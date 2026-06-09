from __future__ import annotations

import json
import os
import random
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Cardify AI backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Category = Literal["accessory", "appliance", "toy", "electronics", "beauty", "other"]

CATEGORY_LABEL: dict[str, str] = {
    "electronics": "Электроника",
    "accessory": "Аксессуар",
    "appliance": "Бытовая техника",
    "toy": "Игрушка",
    "beauty": "Красота и уход",
    "other": "Другое",
}

CATEGORY_TO_TEMPLATE: dict[str, str] = {
    "electronics": "airpods",
    "accessory": "gamepad",
    "appliance": "fen",
    "toy": "gamepad",
    "beauty": "toothpaste",
    "other": "gamepad",
}


class ClassifyRequest(BaseModel):
    image: str  # data URL or http url


class ClassifyResponse(BaseModel):
    category: Category
    categoryLabel: str
    template: str
    title: str
    confidence: float
    source: Literal["ai", "mock"]


class GenerateRequest(BaseModel):
    prompt: str


class GenerateResponse(BaseModel):
    image: Optional[str]
    source: Literal["ai", "unavailable"]
    message: Optional[str] = None


def _has_key() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def _mock_classify() -> ClassifyResponse:
    cat = random.choice(["electronics", "appliance", "accessory", "beauty", "toy"])
    return ClassifyResponse(
        category=cat,  # type: ignore[arg-type]
        categoryLabel=CATEGORY_LABEL[cat],
        template=CATEGORY_TO_TEMPLATE[cat],
        title=CATEGORY_LABEL[cat],
        confidence=round(random.uniform(0.55, 0.72), 2),
        source="mock",
    )


@app.get("/")
def root() -> dict[str, object]:
    return {"service": "cardify-backend", "ai_enabled": _has_key()}


@app.get("/api/health")
def health() -> dict[str, object]:
    return {"ok": True, "ai_enabled": _has_key()}


@app.post("/api/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest) -> ClassifyResponse:
    if not _has_key():
        return _mock_classify()

    try:
        from openai import OpenAI

        client = OpenAI()
        prompt = (
            "Определи тип товара на изображении. Верни СТРОГО JSON без markdown: "
            '{"category": one of '
            '["accessory","appliance","toy","electronics","beauty","other"], '
            '"title": краткое название товара на русском (1-2 слова), '
            '"confidence": число 0..1}.'
        )
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": req.image}},
                    ],
                }
            ],
            max_tokens=120,
            temperature=0,
        )
        raw = (resp.choices[0].message.content or "").strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(raw)
        category = parsed.get("category", "other")
        if category not in CATEGORY_LABEL:
            category = "other"
        return ClassifyResponse(
            category=category,  # type: ignore[arg-type]
            categoryLabel=CATEGORY_LABEL[category],
            template=CATEGORY_TO_TEMPLATE[category],
            title=str(parsed.get("title") or CATEGORY_LABEL[category]),
            confidence=float(parsed.get("confidence", 0.8)),
            source="ai",
        )
    except Exception:
        return _mock_classify()


@app.post("/api/generate-background", response_model=GenerateResponse)
def generate_background(req: GenerateRequest) -> GenerateResponse:
    if not _has_key():
        return GenerateResponse(
            image=None,
            source="unavailable",
            message="ИИ-генерация недоступна: не задан OPENAI_API_KEY",
        )
    try:
        from openai import OpenAI

        client = OpenAI()
        result = client.images.generate(
            model=os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1"),
            prompt=f"clean studio product background, minimal, soft gradient: {req.prompt}",
            size="1024x1024",
            n=1,
        )
        b64 = result.data[0].b64_json
        if b64:
            return GenerateResponse(image=f"data:image/png;base64,{b64}", source="ai")
        url = result.data[0].url
        return GenerateResponse(image=url, source="ai")
    except Exception as exc:  # pragma: no cover
        return GenerateResponse(image=None, source="unavailable", message=str(exc))
