import httpx
from fastapi import Request, Response, HTTPException

TIMEOUT = 5.0

SERVICE_MAP = {
    "auth": "http://auth-service:8001",
    "inventory": "http://inventory-service:8002",
    "catalog": "http://catalog-service:8003",
    "enrichment": "http://ai-enrichment-mock:8006",
    "quality": "http://data-quality-module:8007",
    "config": "http://config-module:8008",
}


async def proxy_request(service_name: str, path: str, request: Request) -> Response:
    base_url = SERVICE_MAP.get(service_name)
    if base_url is None:
        raise HTTPException(status_code=404, detail=f"Service '{service_name}' not found")

    url = f"{base_url}/{path}"
    method = request.method
    headers = {k: v for k, v in request.headers.items()
                if k.lower() not in ("host", "content-length")}

    try:
        body = await request.body()
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            upstream = await client.request(
                method=method,
                url=url,
                headers=headers,
                content=body,
                params=dict(request.query_params),
            )
        return Response(
            content=upstream.content,
            status_code=upstream.status_code,
            headers=dict(upstream.headers),
            media_type=upstream.headers.get("content-type", "application/json"),
        )
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Service '{service_name}' unavailable: {type(exc).__name__}",
        )
