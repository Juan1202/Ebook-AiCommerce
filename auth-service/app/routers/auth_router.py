from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from typing import Optional
from app.application.auth_use_cases import (
    decode_token, get_mock_admin_token, login_user, register_user, 
    create_access_token, is_token_revoked, revoke_token
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
    refresh_token: Optional[str] = None
    token_type: str
    role: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(db, req.username, req.email, req.password, req.role)
        return {"message": "Usuario registrado", "username": user.username, "role": user.role.value}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    access_token, refresh_token = login_user(db, form.username, form.password)
    if not access_token:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    payload = decode_token(access_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer", role=payload["role"])


@router.post("/refresh", response_model=TokenResponse)
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")
    
    if is_token_revoked(db, payload.get("jti")):
        raise HTTPException(status_code=401, detail="Refresh token revocado")
        
    data = {"sub": payload.get("sub"), "role": payload.get("role"), "user_id": payload.get("user_id")}
    new_access_token = create_access_token(data)
    
    return TokenResponse(access_token=new_access_token, refresh_token=req.refresh_token, token_type="bearer", role=payload.get("role"))


@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if payload and payload.get("jti"):
        revoke_token(db, payload.get("jti"))
    return {"message": "Sesión cerrada correctamente"}


@router.get("/verify")
def verify(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") == "refresh":
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
        
    if is_token_revoked(db, payload.get("jti")):
        raise HTTPException(status_code=401, detail="Token revocado")
        
    return {"username": payload.get("sub"), "role": payload.get("role"), "user_id": payload.get("user_id")}


@router.get("/mock-token")
def mock_token():
    """Retorna token admin de prueba — solo para desarrollo local."""
    token = get_mock_admin_token()
    return {"access_token": token, "token_type": "bearer", "note": "TOKEN DE PRUEBA — solo desarrollo local"}
