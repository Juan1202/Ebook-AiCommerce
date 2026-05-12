import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.use_cases.chat_use_case import ChatUseCase
from app.infrastructure.clients.catalog_client import CatalogClient
from app.infrastructure.clients.inventory_client import InventoryClient
from app.infrastructure.clients.pricing_client import PricingClient
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories.interaction_repository import (
    SqlInteractionRepository,
)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    question: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    intent: str
    answer: str
    interaction_id: str | None


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    if not body.question.strip():
        raise HTTPException(status_code=422, detail="question cannot be empty")

    session_id = body.session_id or str(uuid.uuid4())
    repo = SqlInteractionRepository(db)
    use_case = ChatUseCase(
        repo=repo,
        catalog=CatalogClient(),
        pricing=PricingClient(),
        inventory=InventoryClient(),
    )
    interaction = use_case.execute(session_id=session_id, question=body.question)
    return ChatResponse(
        session_id=interaction.session_id,
        intent=interaction.interpreted_intent,
        answer=interaction.answer_text,
        interaction_id=interaction.id,
    )
