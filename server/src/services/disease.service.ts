import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma.js';

export interface PossibleCauseItem {
  name: string;
  likelihood: string;
}

export interface DiseaseAnalysisResult {
  isAgricultural: boolean;
  category: 'leaf' | 'fruit' | 'vegetable' | 'crop' | 'plant' | 'seed' | 'flower' | 'non_agricultural';
  detectedSubject: string;
  crop: string | null;
  plantPart: 'leaf' | 'fruit' | 'flower' | 'seed' | 'stem' | 'root' | 'whole_plant' | 'none';
  imageQuality: 'good' | 'blurry' | 'too_dark' | 'low_resolution' | 'unclear';
  suitableForDiseaseAnalysis: boolean;
  suitabilityMessage?: string;

  analysis?: {
    status: 'possible_disease' | 'healthy' | 'pest_damage' | 'nutrient_deficiency' | 'environmental_stress' | 'unable_to_identify';
    problem: string;
    causeCategory: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutrient' | 'environmental' | 'healthy' | 'unknown';
    confidence: number;
    symptoms: string[];
    possibleCauses: PossibleCauseItem[];
    management: string[];
    prevention: string[];
    warning: string;
  };

  scan?: any;
}

export class DiseaseService {
  /**
   * Real AI Multimodal Vision Analysis for Crop Doctor.
   * Sends the actual uploaded image bytes to Google Gemini 1.5 Flash Vision.
   */
  static async analyzeImage(params: {
    imageUrl: string;
    selectedCrop?: string;
    farmerId?: string;
  }): Promise<DiseaseAnalysisResult> {
    const { imageUrl, selectedCrop = '', farmerId } = params;

    if (!imageUrl || !imageUrl.trim()) {
      throw new Error('Please upload a photo of your crop, fruit, vegetable, or plant leaf.');
    }

    // Resolve base64 image data and MIME type from local file, data URI, or URL
    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('data:image')) {
      const parts = imageUrl.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1];
    } else if (imageUrl.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), imageUrl.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase().replace('.', '');
        mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        base64Data = fileBuffer.toString('base64');
      } else {
        throw new Error('Uploaded image file could not be located on the server.');
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      try {
        const fetchRes = await fetch(imageUrl);
        if (fetchRes.ok) {
          const arrayBuf = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          const cType = fetchRes.headers.get('content-type');
          if (cType && cType.startsWith('image/')) {
            mimeType = cType;
          }
          base64Data = buffer.toString('base64');
        }
      } catch (err) {
        console.warn('Could not fetch remote image for vision analysis:', err);
      }
    }

    if (!base64Data) {
      throw new Error('Image data is required for vision analysis.');
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(
        'AI Vision is not configured. Please configure GEMINI_API_KEY in server/.env.'
      );
    }

    // Real Gemini 1.5 Flash Vision Multimodal Prompt
    const systemPrompt = `You are a world-class agricultural computer vision expert and senior plant pathologist.
Analyze this uploaded image in detail.

Follow these strict evaluation rules:
1. WHAT IS IN THE IMAGE:
   - Categorize the subject into: "leaf", "fruit", "vegetable", "crop", "plant", "seed", "flower", or "non_agricultural".
   - If the image contains a person, face, human, animal, dog, cat, car, vehicle, building, anime character, cartoon, screenshot, document, food dish, or random non-agricultural object, you MUST set:
     "isAgricultural": false,
     "category": "non_agricultural",
     "detectedSubject": "2-4 word description of what is visible (e.g. Person, Anime Character, Dog, Sedan Car)",
     "crop": null,
     "plantPart": "none",
     "suitableForDiseaseAnalysis": false

2. AGRICULTURAL IDENTIFICATION:
   - If it is agricultural:
     - Identify the exact crop name (e.g. "Tomato", "Rice", "Banana", "Potato", "Chilli", "Cotton", "Mango", "Brinjal", "Groundnut", "Sugarcane", "Wheat", "Maize").
     - Identify the plant part: "leaf", "fruit", "flower", "seed", "stem", "root", "whole_plant".
     - Note: Do NOT assume the selected crop ("${selectedCrop}") if the image actually shows a different crop. The image is the ground truth.

3. IMAGE QUALITY:
   - Check if the image is "good", "blurry", "too_dark", "low_resolution", or "unclear".
   - If quality is poor (blurry, dark, too far), set "suitableForDiseaseAnalysis": false.

4. SUITABILITY FOR LEAF DISEASE ANALYSIS:
   - If it is a fruit, tuber, vegetable produce (e.g. Tomato fruit, Banana bunch, Mango fruit, Potato tuber, Chilli pod):
     Set "suitableForDiseaseAnalysis": false.
     Set "suitabilityMessage": "[Crop] [Produce] detected. This image is not suitable for leaf disease analysis. Please upload a clear image of an affected leaf."
   - If it is an affected crop leaf/foliage and image quality is good:
     Set "suitableForDiseaseAnalysis": true.

5. DISEASE & PROBLEM PATHOLOGY ANALYSIS (Only if suitableForDiseaseAnalysis is true):
   - Determine causeCategory:
     • "fungal" (e.g. Early Blight, Late Blight, Blast, Powdery Mildew, Rust, Anthracnose)
     • "bacterial" (e.g. Bacterial Spot, Bacterial Wilt, Bacterial Blight)
     • "viral" (e.g. Leaf Curl Virus, Mosaic Virus — Note: Do NOT claim chemicals cure viruses! Emphasize vector control, rogueing infected plants, certified seed)
     • "pest" (e.g. Leaf Miner, Mites, Aphids, Whiteflies, Caterpillar defoliation — Categorize as Pest/Insect Damage)
     • "nutrient" (e.g. Nitrogen deficiency, Iron chlorosis, Potassium scorch)
     • "environmental" (e.g. Sunscald, drought stress, waterlogging)
     • "healthy" (Normal healthy foliage — Do NOT invent a disease! Set problem: "Healthy / No obvious disease detected")
     • "unknown" (If evidence is insufficient/uncertain, set problem: "Unable to reliably identify the disease from this image")
   - Provide:
     • "confidence": decimal between 0.50 and 0.99
     • "symptoms": 2-4 bullet points of visible leaf symptoms
     • "possibleCauses": list of 1-3 likely causes with percentages (e.g. [{"name": "Early Blight", "likelihood": "85%"}, {"name": "Septoria", "likelihood": "15%"}])
     • "management": 3-5 practical, safe, IPM/organic management steps (No fake pesticide dosages; advise regional agricultural authority compliance)
     • "prevention": 2-4 preventive agronomic steps

Return ONLY a raw, valid JSON object matching this exact schema:
{
  "isAgricultural": boolean,
  "category": "leaf" | "fruit" | "vegetable" | "crop" | "plant" | "seed" | "flower" | "non_agricultural",
  "detectedSubject": string,
  "crop": string | null,
  "plantPart": "leaf" | "fruit" | "flower" | "seed" | "stem" | "root" | "whole_plant" | "none",
  "imageQuality": "good" | "blurry" | "too_dark" | "low_resolution" | "unclear",
  "suitableForDiseaseAnalysis": boolean,
  "suitabilityMessage": string | null,

  "analysis": {
    "status": "possible_disease" | "healthy" | "pest_damage" | "nutrient_deficiency" | "environmental_stress" | "unable_to_identify",
    "problem": string,
    "causeCategory": "fungal" | "bacterial" | "viral" | "pest" | "nutrient" | "environmental" | "healthy" | "unknown",
    "confidence": number,
    "symptoms": string[],
    "possibleCauses": [
      { "name": string, "likelihood": string }
    ],
    "management": string[],
    "prevention": string[],
    "warning": "AI agricultural advisory — image-based results are not a confirmed laboratory diagnosis."
  }
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const visionRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          },
        ],
      }),
    });

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      console.error('[Gemini Vision API Error]:', visionRes.status, errText);
      throw new Error(`AI Vision service error (${visionRes.status}). Please verify your GEMINI_API_KEY.`);
    }

    const visionData = (await visionRes.json()) as any;
    const textResponse = visionData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('AI Vision model did not return an analysis candidate.');
    }

    const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response JSON:', textResponse);
      throw new Error('Failed to parse AI Vision structured response.');
    }

    const result: DiseaseAnalysisResult = {
      isAgricultural: !!parsed.isAgricultural,
      category: parsed.category || (parsed.isAgricultural ? 'crop' : 'non_agricultural'),
      detectedSubject: parsed.detectedSubject || (parsed.isAgricultural ? `${parsed.crop || 'Crop'} ${parsed.plantPart || 'Plant'}` : 'Non-agricultural subject'),
      crop: parsed.crop || null,
      plantPart: parsed.plantPart || 'none',
      imageQuality: parsed.imageQuality || 'good',
      suitableForDiseaseAnalysis: !!parsed.suitableForDiseaseAnalysis,
      suitabilityMessage: parsed.suitabilityMessage || undefined,
      analysis: parsed.analysis,
    };

    // If analysis was performed and farmerId is provided, save record to PostgreSQL
    if (farmerId && result.isAgricultural && result.suitableForDiseaseAnalysis && result.analysis) {
      try {
        const confidencePct = Math.round((result.analysis.confidence || 0.85) * 100);
        const severityStr =
          result.analysis.causeCategory === 'healthy'
            ? 'LOW'
            : result.analysis.confidence > 0.8
            ? 'HIGH'
            : 'MEDIUM';

        const savedScan = await prisma.diseaseScan.create({
          data: {
            farmerId,
            cropName: result.crop || selectedCrop || 'Crop',
            imageUrl,
            diseaseName: result.analysis.problem,
            confidenceScore: confidencePct,
            severity: severityStr,
            observedSymptoms: result.analysis.symptoms?.join('\n• ') || 'Visual symptoms analyzed by vision model.',
            possibleCauses: result.analysis.possibleCauses?.map((c) => `${c.name} (${c.likelihood})`).join(', ') || result.analysis.causeCategory,
            recommendation: {
              create: {
                diseaseName: result.analysis.problem,
                organicTreatment: result.analysis.management?.join('\n• ') || 'Follow integrated pest and disease management guidelines.',
                chemicalTreatment:
                  result.analysis.causeCategory === 'viral'
                    ? 'Viruses cannot be cured with chemical fungicides/antibiotics. Manage insect vectors (whiteflies/aphids) with recommended treatments and remove infected plants.'
                    : 'Use only university and government approved products strictly according to label instructions. Consult your local agricultural officer.',
                safetyGuideline: 'Wear protective equipment when spraying. Observe recommended Pre-Harvest Intervals (PHI) before harvesting.',
                expertConsultationNote: 'If symptoms persist or spread across >20% of your crop, contact your nearest Krishi Vigyan Kendra (KVK) or Block Agricultural Officer.',
                sourceName: 'ICAR-IIHR / State Agricultural University Protocols',
                verificationDate: new Date(),
              },
            },
          },
          include: {
            recommendation: true,
          },
        });

        result.scan = savedScan;
      } catch (dbErr) {
        console.error('[Error saving scan to PostgreSQL]:', dbErr);
      }
    }

    return result;
  }

  /**
   * Delete a scan from scan history
   */
  static async deleteScan(scanId: string, farmerId: string) {
    const scan = await prisma.diseaseScan.findFirst({
      where: { id: scanId, farmerId },
    });

    if (!scan) {
      throw new Error('Scan record not found or unauthorized');
    }

    await prisma.diseaseScan.delete({
      where: { id: scanId },
    });

    return { success: true, message: 'Scan history deleted successfully' };
  }

  /**
   * Get farmer scan history
   */
  static async getFarmerScans(farmerId: string) {
    return prisma.diseaseScan.findMany({
      where: { farmerId },
      include: { recommendation: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
