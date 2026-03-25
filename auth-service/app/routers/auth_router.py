from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.auth_use_cases import (
    decode_token, get_mock_admin_token, login_user, register_user,
)
from app.infrastructure.database import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(db, req.username, req.email, req.password, req.role)
        return {"message": "Usuario registrado", "username": user.username, "role": user.role.value}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    token = login_user(db, form.username, form.password)
    if not token:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    payload = decode_token(token)
    return TokenResponse(access_token=token, token_type="bearer", role=payload["role"])


@router.get("/verify")
def verify(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return {"username": payload.get("sub"), "role": payload.get("role"), "user_id": payload.get("user_id")}


@router.get("/mock-token")
def mock_token():
    """Retorna token admin de prueba — solo para desarrollo local."""
    token = get_mock_admin_token()
    return {"access_token": token, "token_type": "bearer", "note": "TOKEN DE PRUEBA — solo desarrollo local"}
