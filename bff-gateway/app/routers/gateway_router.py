import asyncio
import json

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from app.proxy import TIMEOUT, SERVICE_MAP, proxy_request

router = APIRouter()


# ─────────────────────────────────────────
# HEALTH — aggregated across all services
# ─────────────────────────────────────────

async def _ping_service(name: str, base_url: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{base_url}/health")
        if r.status_code == 200:
            return {"status": "ok", "url": base_url}
        return {"status": "degraded", "code": r.status_code, "url": base_url}
    except Exception as exc:
        return {"status": "unavailable", "error": type(exc).__name__, "url": base_url}


@router.get("/health")
async def health():
    checks = await asyncio.gather(
        *[_ping_service(name, url) for name, url in SERVICE_MAP.items()],
        return_exceptions=True,
    )
    services = {name: result for name, result in zip(SERVICE_MAP.keys(), checks)}
    overall = "ok" if all(s.get("status") == "ok" for s in services.values()) else "degraded"
    return {
        "status": overall,
        "service": "bff-gateway",
        "version": "2.0.0",
        "services": services,
    }


# ─────────────────────────────────────────
# SPRINT 2 — Admin Pricing routes
# ─────────────────────────────────────────

@router.post("/api/admin/pricing/bulk-calculate")
async def admin_pricing_bulk_calculate() -> JSONResponse:
    """Fetch all catalog books and calculate a price for each one."""
    catalog_url = SERVICE_MAP.get("catalog", "http://catalog-service:8003")
    pricing_url = SERVICE_MAP.get("pricing", "http://pricing-service:8005")

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        try:
            books_resp = await client.get(f"{catalog_url}/books", params={"limit": 500})
            books_resp.raise_for_status()
            books = books_resp.json()
            if isinstance(books, dict):
                books = books.get("items", books.get("data", []))
        except Exception as exc:
            return JSONResponse(
                status_code=503,
                content={"detail": f"No se pudo obtener el catálogo: {type(exc).__name__}"},
            )

        ok_count = 0
        fail_count = 0
        for book in books:
            book_id = str(book.get("id", ""))
            book_title = book.get("title", "Sin título")
            condition = book.get("condition") or "BUENO"
            valid_conditions = {"NUEVO", "BUENO", "ACEPTABLE", "DETERIORADO"}
            if condition not in valid_conditions:
                condition = "BUENO"
            try:
                await client.post(
                    f"{pricing_url}/pricing/calculate",
                    json={"book_id": book_id, "book_title": book_title, "condition": condition},
                    timeout=10.0,
                )
                ok_count += 1
            except Exception:
                fail_count += 1

    return JSONResponse(content={"calculated": ok_count, "failed": fail_count, "total": len(books)})


@router.api_route(
    "/api/admin/pricing/recalculate",
    methods=["POST"],
)
async def admin_pricing_recalculate(request: Request) -> Response:
    return await proxy_request("pricing", "pricing/calculate", request)


@router.api_route(
    "/api/admin/pricing/{book_id}/history",
    methods=["GET"],
)
async def admin_pricing_history(book_id: str, request: Request) -> Response:
    return await proxy_request("pricing", f"pricing/{book_id}/history", request)


@router.api_route(
    "/api/admin/pricing/{book_id}/explanation",
    methods=["GET"],
)
async def admin_pricing_explanation(book_id: str, request: Request) -> Response:
    return await proxy_request("pricing", f"pricing/{book_id}/explanation", request)


@router.api_route(
    "/api/admin/pricing/{book_id}",
    methods=["GET"],
)
async def admin_pricing_detail(book_id: str, request: Request) -> Response:
    return await proxy_request("pricing", f"pricing/{book_id}", request)


@router.api_route(
    "/api/admin/pricing",
    methods=["GET"],
)
async def admin_pricing_list(request: Request) -> Response:
    return await proxy_request("pricing", "pricing/", request)


@router.api_route(
    "/api/admin/pricing",
    methods=["POST"],
)
async def admin_pricing_calculate(request: Request) -> Response:
    return await proxy_request("pricing", "pricing/calculate", request)


# ─────────────────────────────────────────
# SPRINT 2 — Admin Enrichment routes
# ─────────────────────────────────────────

@router.api_route(
    "/api/admin/enrichment/status",
    methods=["GET"],
)
async def admin_enrichment_status(request: Request) -> Response:
    return await proxy_request("enrichment", "external-apis/status", request)


@router.api_route(
    "/api/admin/enrichment/trigger",
    methods=["POST"],
)
async def admin_enrichment_trigger(request: Request) -> Response:
    return await proxy_request("enrichment", "enrich", request)


@router.api_route(
    "/api/admin/enrichment/{path:path}",
    methods=["GET", "POST"],
)
async def admin_enrichment_path(path: str, request: Request) -> Response:
    return await proxy_request("enrichment", f"enrich/{path}", request)


# ─────────────────────────────────────────
# SPRINT 3 — Orders routes
# ─────────────────────────────────────────

@router.api_route(
    "/api/orders/{order_id}/confirm",
    methods=["POST"],
)
async def order_confirm(order_id: int, request: Request) -> Response:
    return await proxy_request("order", f"orders/{order_id}/confirm", request)


@router.api_route(
    "/api/orders/{order_id}/cancel",
    methods=["POST"],
)
async def order_cancel(order_id: int, request: Request) -> Response:
    return await proxy_request("order", f"orders/{order_id}/cancel", request)


@router.api_route(
    "/api/orders/{order_id}/fulfill",
    methods=["POST"],
)
async def order_fulfill(order_id: int, request: Request) -> Response:
    return await proxy_request("order", f"orders/{order_id}/fulfill", request)


@router.api_route(
    "/api/orders/{order_id}",
    methods=["GET"],
)
async def order_detail(order_id: int, request: Request) -> Response:
    return await proxy_request("order", f"orders/{order_id}", request)


@router.api_route(
    "/api/orders",
    methods=["GET", "POST"],
)
async def orders_root(request: Request) -> Response:
    return await proxy_request("order", "orders", request)


# ─────────────────────────────────────────
# GENERIC catch-all proxy
# ─────────────────────────────────────────

@router.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service: str, path: str, request: Request) -> Response:
    return await proxy_request(service, path, request)


@router.api_route("/api/{service}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway_root(service: str, request: Request) -> Response:
    return await proxy_request(service, "", request)
