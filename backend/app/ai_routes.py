"""Constrained FAQ assistant; no LLM provider or account tools enabled yet."""
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/assistant", tags=["assistant"])


class ChatInput(BaseModel):
    message: str = Field(min_length=1, max_length=500)


@router.post("/chat")
def chat(payload: ChatInput):
    question = payload.message.lower()
    if any(word in question for word in ("wallet", "balance", "transfer")):
        answer = "TamboPay Phase 1 uses direct checkout and does not offer a stored-value wallet."
    elif any(word in question for word in ("airtime", "data", "electricity", "cable", "bill")):
        answer = "TamboPay plans to support airtime, data, electricity, cable TV and other bill payments. Availability and prices must be confirmed at checkout."
    elif any(word in question for word in ("payment", "order", "transaction", "refund")):
        answer = "For your transaction status, sign in and check your order history. I cannot verify or change payments."
    else:
        answer = "I can explain TamboPay services and direct checkout. For account-specific support, please contact the support team."
    return {"answer": answer, "provider": "verified-faq", "ai_enabled": False}
