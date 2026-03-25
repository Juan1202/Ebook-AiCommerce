from fastapi import APIRouter, Request, Response
from app.proxy import proxy_request, SERVICE_MAP

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "bff-gateway", "routes": list(SERVICE_MAP.keys())}


@router.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service: str, path: str, request: Request) -> Response:
    return await proxy_request(service, path, request)


@router.api_route("/api/{service}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway_root(service: str, request: Request) -> Response:
    return await proxy_request(service, "", request)
