# Namma Farm — Custom Agricultural ML Model Integration

This directory contains the Python ML inference microservice designed to serve your custom-trained agricultural vision and plant pathology models (PyTorch, ONNX, TensorFlow, or EfficientNet/ResNet).

---

## 🚀 Quick Setup & Execution

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Inference Server
```bash
python app.py
```
The service will start on `http://localhost:8000`.

---

## ⚙️ Connecting to Namma Farm Backend

In `server/.env`, configure the inference microservice endpoint:

```env
AI_PROVIDER="custom_ml"
AI_MODEL_SERVICE_URL="http://localhost:8000/predict"
```

The Node.js backend will automatically route all crop analysis and disease diagnosis requests (`POST /api/ai/analyze-crop`) directly to your local Python ML microservice without any cloud dependencies.

---

## 📦 API Endpoints

### `GET /health`
Returns service status and list of supported agricultural crops.

### `POST /predict`
- **Body**: `multipart/form-data` with `image` file and optional `selected_crop` parameter.
- **Output**: Standardized JSON conforming to the Namma Farm Crop Vision schema.
