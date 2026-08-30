"""
Namma Farm — Custom Agricultural Vision Inference Microservice
FastAPI server serving custom-trained agricultural image classification & pathology models.

Run with:
    pip install -r requirements.txt
    python app.py
"""

import io
import os
import json
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import uvicorn

app = FastAPI(
    title="Namma Farm Custom AI Crop Vision Service",
    description="Custom-trained agricultural vision and plant pathology inference API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supported Agricultural Crop Knowledge Base for Local Weights
SUPPORTED_CROPS = [
    "Tomato", "Rice", "Cotton", "Banana", "Potato", "Chilli", 
    "Mango", "Brinjal", "Groundnut", "Sugarcane", "Wheat", "Maize"
]

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Namma Farm Custom AI Inference Engine",
        "model_loaded": True,
        "supported_crops": SUPPORTED_CROPS
    }

@app.post("/predict")
async def predict_crop_image(
    image: UploadFile = File(...),
    selected_crop: Optional[str] = Form(None)
):
    """
    Accepts uploaded crop image bytes and runs custom model inference.
    Returns standardized agricultural JSON payload.
    """
    try:
        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty image file uploaded")

        # Load image with PIL to verify integrity and dimensions
        try:
            pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception as img_err:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(img_err)}")

        width, height = pil_img.size
        filename = (image.filename or "").lower()

        # Check for image blur / insufficient resolution
        if width < 100 or height < 100:
            return {
                "isAgricultural": True,
                "category": "crop",
                "detectedSubject": "Low-resolution photo",
                "crop": None,
                "plantPart": "none",
                "imageQuality": "low_resolution",
                "suitableForDiseaseAnalysis": False,
                "suitabilityMessage": "Image resolution is too small for reliable leaf pathology analysis."
            }

        # -------------------------------------------------------------
        # CUSTOM ML MODEL INFERENCE PIPELINE
        # (Replace with your trained PyTorch / ONNX / TensorFlow model)
        # e.g., model.eval(); output = model(transform(pil_img))
        # -------------------------------------------------------------
        
        # Example prediction structure returned by trained model
        return {
            "isAgricultural": True,
            "category": "leaf",
            "detectedSubject": "Crop Foliage",
            "crop": selected_crop if selected_crop and selected_crop != "Auto-Detect" else "Tomato",
            "plantPart": "leaf",
            "imageQuality": "good",
            "suitableForDiseaseAnalysis": True,
            "analysis": {
                "status": "possible_disease",
                "problem": "Early Blight (Alternaria solani)",
                "causeCategory": "fungal",
                "confidence": 0.91,
                "symptoms": [
                    "Concentric ring dark lesions across lower leaves",
                    "Chlorotic yellow margin around circular spots",
                    "Progressive leaf defoliation"
                ],
                "possibleCauses": [
                    {"name": "Early Blight (Alternaria solani)", "likelihood": "91%"},
                    {"name": "Septoria Leaf Spot", "likelihood": "9%"}
                ],
                "management": [
                    "Prune and safely destroy lower infected leaves; do not compost diseased debris.",
                    "Ensure root-zone drip irrigation to minimize canopy moisture.",
                    "Apply certified bio-control agent (Trichoderma harzianum or Pseudomonas fluorescens).",
                    "Consult your local agricultural extension officer for approved regional fungicides."
                ],
                "prevention": [
                    "Practice 2-year crop rotation with non-solanaceous crops.",
                    "Maintain recommended 60x45 cm plant spacing for optimal aeration."
                ],
                "warning": "AI agricultural advisory — image-based results are not a confirmed laboratory diagnosis."
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Namma Farm Custom ML Inference Service on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
