import os
import httpx
from fastapi import Request, Response, HTTPException

from app.audit import record_event

TIMEOUT = 5.0

SERVICE_MAP = {
    "auth":            os.getenv("AUTH_SERVICE_URL",       "http://auth-service:8001"),
    "inventory":       os.getenv("INVENTORY_SERVICE_URL",  "http://inventory-service:8002"),
    "catalog":         os.getenv("CATALOG_SERVICE_URL",    "http://catalog-service:8003"),
    "enrichment":      os.getenv("AI_ENRICHMENT_URL",      "http://ai-enrichment-mock:8006"),
    "enrichment-real": os.getenv("ENRICHMENT_SERVICE_URL", "http://ai-enrichment-service:8004"),
    "pricing":         os.getenv("PRICING_SERVICE_URL",    "http://pricing-service:8005"),
    "quality":         os.getenv("DATA_QUALITY_URL",       "http://data-quality-module:8007"),
    "config":          os.getenv("CONFIG_MODULE_URL",      "http://config-module:8008"),
}


def _classify_event(service_name: str, status_code: int | None = None, error: bool = False) -> tuple[str, str]:
    if error:
        return "error", "technical"
    if status_code is not None and status_code >= 500:
        return "critical", "technical"
    if service_name in ("enrichment", "enrichment-real"):
        return "consulta_ia", "business"
    if service_name in ("catalog", "inventory", "pricing"):
        return "pedido", "business"
    return "request", "operational"


async def proxy_request(service_name: str, path: str, request: Request) -> Response:
    base_url = SERVICE_MAP.get(service_name)
    if base_url is None:
        raise HTTPException(status_code=404, detail=f"Servicio '{service_name}' no registrado")

    url = f"{base_url}/{path}" if path else base_url
    headers = {k: v for k, v in request.headers.items()
               if k.lower() not in ("host", "content-length")}

    try:
        body = await request.body()
        async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
            upstream = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=dict(request.query_params),
            )

        event_type, category = _classify_event(service_name, status_code=upstream.status_code)
        record_event(
            event_type=event_type,
            category=category,
            description=f"Proxy {request.method} /api/{service_name}/{path} responded {upstream.status_code}",
            service=service_name,
            path=path,
            status_code=upstream.status_code,
            metadata={
                "method": request.method,
                "query": dict(request.query_params),
                "url": url,
            },
        )

        return Response(
            content=upstream.content,
            status_code=upstream.status_code,
            headers=dict(upstream.headers),
            media_type=upstream.headers.get("content-type", "application/json"),
        )
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        record_event(
            event_type="error",
            category="technical",
            description=f"Servicio '{service_name}' no disponible: {type(exc).__name__}",
            service=service_name,
            path=path,
            status_code=503,
            metadata={"exception": type(exc).__name__},
        )
        raise HTTPException(
            status_code=503,
            detail=f"Servicio '{service_name}' no disponible: {type(exc).__name__}",
        )
