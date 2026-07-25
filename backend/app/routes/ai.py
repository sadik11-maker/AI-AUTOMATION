import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.dependencies import get_current_user
from app.services.ai_service import call_ai, call_ai_conversation


router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)


class AIRequest(BaseModel):
    message: str


class WidgetChatMessage(BaseModel):
    role: str
    content: str


class WidgetChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[WidgetChatMessage] = Field(default_factory=list)
    business_name: str = Field(default="our company", max_length=100)


AGENT_SYSTEM_PROMPT = """You are an AI assistant that helps customer support agents triage tickets.

Given a customer's message, respond with ONLY a JSON object (no markdown, no extra text) with exactly these two keys:
- "category": one of "Delivery Issue", "Payment Issue", "Refund Request", "Account Issue", "Technical Issue", "General Support"
- "suggested_response": a short, empathetic, professional draft reply (2-4 sentences) the agent can send to the customer, written in first person plural ("we").

Do not include anything other than the JSON object in your response."""


@router.post("/suggest-response")
def suggest_ai_response(
    request: AIRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.message.strip():
        return {
            "category": "Unknown",
            "suggested_response": "Please provide a message so we can help you."
        }

    try:
        raw_reply = call_ai(
            system_prompt=AGENT_SYSTEM_PROMPT,
            user_message=request.message,
            max_tokens=300
        )
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    try:
        cleaned = raw_reply.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(cleaned)

        return {
            "category": parsed.get("category", "General Support"),
            "suggested_response": parsed.get(
                "suggested_response",
                raw_reply
            )
        }
    except (json.JSONDecodeError, AttributeError):
        return {
            "category": "General Support",
            "suggested_response": raw_reply
        }


WIDGET_SYSTEM_PROMPT_TEMPLATE = """You are a friendly, concise AI customer support assistant embedded on {business_name}'s website.

Guidelines:
- Be warm, professional, and to the point (usually 1-3 sentences).
- Try to resolve simple questions directly (order status, returns policy, how something works, account help, etc.) using general best-practice customer service knowledge.
- If the issue needs a human or access to the customer's account/order data you don't have, clearly say you'll create a support ticket for them, and ask for whatever single piece of information is still missing (e.g. their order number) if it would help the human agent.
- Never invent specific order numbers, tracking details, or account information you don't actually have access to.
- Keep replies short. Do not use markdown headers or bullet lists unless the user asks for a list."""


@router.post("/widget-chat")
def widget_chat(request: WidgetChatRequest):
    system_prompt = WIDGET_SYSTEM_PROMPT_TEMPLATE.format(
        business_name=request.business_name
    )

    conversation = [
        {"role": m.role, "content": m.content}
        for m in request.history
        if m.role in ("user", "assistant")
    ]
    conversation.append({"role": "user", "content": request.message})

    conversation = conversation[-20:]

    try:
        reply = call_ai_conversation(
            system_prompt=system_prompt,
            history=conversation,
            max_tokens=400
        )
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {
        "reply": reply
    }