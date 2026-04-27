import asyncio

import httpx
from fastapi import APIRouter, Request, Response

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
    return await proxy_request("enrichment-real", "external-apis/status", request)


@router.api_route(
    "/api/admin/enrichment/trigger",
    methods=["POST"],
)
async def admin_enrichment_trigger(request: Request) -> Response:
    return await proxy_request("enrichment-real", "enrich", request)


@router.api_route(
    "/api/admin/enrichment/{path:path}",
    methods=["GET", "POST"],
)
async def admin_enrichment_path(path: str, request: Request) -> Response:
    return await proxy_request("enrichment-real", f"enrich/{path}", request)


# ─────────────────────────────────────────
# GENERIC catch-all proxy
# ─────────────────────────────────────────

@router.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service: str, path: str, request: Request) -> Response:
    return await proxy_request(service, path, request)


@router.api_route("/api/{service}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway_root(service: str, request: Request) -> Response:
    return await proxy_request(service, "", request)
