from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import torch

app = FastAPI(title="Hallucination Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# truthy/hallucination classifier — works on all transformers versions
# Uses a NLI (Natural Language Inference) model to detect contradiction
# Contradiction between a claim and context = hallucination signal
print("Loading model...")
classifier = pipeline(
    "zero-shot-classification",
    model="cross-encoder/nli-MiniLM2-L6-H768",
    device=0 if torch.cuda.is_available() else -1,
)
print("Model loaded!")

CANDIDATE_LABELS = ["factual and accurate", "hallucinated or incorrect"]


class TextInput(BaseModel):
    text: str


def get_display_label(score: float) -> str:
    if score < 0.4:
        return "Safe"
    elif score < 0.7:
        return "Suspicious"
    else:
        return "Highly Hallucinated"


@app.get("/")
def root():
    return {"status": "Hallucination Detection API is running"}


@app.post("/predict")
def predict(input: TextInput):
    if not input.text or len(input.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short")

    text = input.text.strip()[:1500]

    result = classifier(text, CANDIDATE_LABELS)

    # result["labels"][0] is the top predicted label
    # result["scores"][0] is its confidence
    labels = result["labels"]
    scores = result["scores"]

    # Find score for "hallucinated or incorrect"
    hall_idx = labels.index("hallucinated or incorrect")
    hallucination_score = round(scores[hall_idx], 4)
    label = get_display_label(hallucination_score)

    return {"score": hallucination_score, "label": label}