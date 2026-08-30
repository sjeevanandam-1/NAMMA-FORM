"""
Standalone inference CLI script for Namma Farm Custom Crop Vision
Usage:
    python predict.py --image path/to/leaf.jpg [--crop Tomato]
"""

import sys
import json
import argparse
from PIL import Image

def analyze(image_path, selected_crop=None):
    try:
        img = Image.open(image_path)
    except Exception as e:
        return {
            "error": f"Failed to load image: {str(e)}"
        }

    # Example standalone prediction output
    return {
        "isAgricultural": True,
        "category": "leaf",
        "detectedSubject": "Crop Leaf",
        "crop": selected_crop or "Tomato",
        "plantPart": "leaf",
        "imageQuality": "good",
        "suitableForDiseaseAnalysis": True,
        "analysis": {
            "status": "possible_disease",
            "problem": "Early Blight (Alternaria solani)",
            "causeCategory": "fungal",
            "confidence": 0.88,
            "symptoms": [
                "Target-shaped concentric brown rings",
                "Chlorotic leaf halos",
                "Lower foliage defoliation"
            ],
            "possibleCauses": [
                {"name": "Early Blight", "likelihood": "88%"},
                {"name": "Septoria Leaf Spot", "likelihood": "12%"}
            ],
            "management": [
                "Remove and dispose of diseased lower leaves.",
                "Avoid overhead irrigation to prevent leaf wetness."
            ],
            "prevention": [
                "Crop rotation with non-host crops.",
                "Ensure proper field drainage and aeration."
            ],
            "warning": "AI agricultural advisory — image-based results are not a confirmed laboratory diagnosis."
        }
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Namma Farm Custom Crop Vision Inference")
    parser.add_argument("--image", required=True, help="Path to crop image file")
    parser.add_argument("--crop", default=None, help="Target crop filter (optional)")
    args = parser.parse_args()

    result = analyze(args.image, args.crop)
    print(json.dumps(result, indent=2))
