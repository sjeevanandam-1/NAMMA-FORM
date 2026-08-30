import fs from 'fs';
import path from 'path';

export interface ImageUnderstandingResult {
  isAgricultural: boolean;
  category:
    | 'fruit'
    | 'vegetable'
    | 'crop'
    | 'leaf'
    | 'flower'
    | 'seed'
    | 'non_agricultural'
    | 'other_agricultural';
  identifiedCrop: string | null;
  detectedSubject: string;
  confidence: number;
  isLeafDiseaseImage: boolean;
  suitabilityMessage: string;
  qualityScore: number;
  message: string;
  canProceedToDiseaseAnalysis: boolean;
  validationStatus: 'VALID_LEAF' | 'AGRICULTURAL_NOT_LEAF' | 'NON_AGRICULTURAL' | 'UNCLEAR_OR_BLURRY';
}

export class ImageValidationService {
  /**
   * Real Vision AI Image Understanding Pipeline.
   * Sends actual uploaded image buffer to real Vision AI model.
   * STRICT NO-MOCK POLICY: If AI API key is missing, explicitly returns unconfigured error.
   */
  static async classifyAndUnderstandImage(params: {
    imageUrl: string;
    selectedCrop?: string;
  }): Promise<ImageUnderstandingResult> {
    const { imageUrl } = params;

    if (!imageUrl || !imageUrl.trim()) {
      throw new Error('No leaf image selected. Please upload a clear photo of the affected crop leaf.');
    }

    // Resolve local image file or base64
    let base64Image = '';
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('data:image')) {
      const parts = imageUrl.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Image = parts[1];
    } else if (imageUrl.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), imageUrl.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase().replace('.', '');
        mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        base64Image = fileBuffer.toString('base64');
      } else {
        throw new Error('Uploaded image file could not be located on the server.');
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Remote URL - fetch buffer
      try {
        const fetchRes = await fetch(imageUrl);
        if (fetchRes.ok) {
          const arrayBuf = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          const cType = fetchRes.headers.get('content-type');
          if (cType && cType.startsWith('image/')) {
            mimeType = cType;
          }
          base64Image = buffer.toString('base64');
        }
      } catch (err) {
        console.warn('Could not fetch remote image for base64 analysis:', err);
      }
    }

    if (!base64Image) {
      throw new Error('Image data is required for vision analysis.');
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      throw new Error(
        'AI Vision service is not configured. Please configure the required AI API key (GEMINI_API_KEY in server/.env).'
      );
    }

    // Real AI Vision Multimodal API Request
    try {
      const prompt = `You are a real-world agricultural computer vision classifier.
Analyze this uploaded image in detail.

Strict Analysis Rules:
1. CATEGORY CLASSIFICATION: Classify the primary subject into exactly one of:
   - "fruit" (e.g. Banana, Mango, Apple, Guava, Papaya, Orange, Lemon, Grapes)
   - "vegetable" (e.g. Tomato fruit produce, Potato tuber, Chilli pod, Brinjal produce, Onion bulb, Carrot, Cucumber)
   - "crop" (e.g. Rice whole plant, Cotton crop, Sugarcane, Maize, Wheat)
   - "leaf" (e.g. Tomato leaf foliage, Rice leaf blade, Chilli leaf, Cotton leaf, Brinjal leaf, Potato leaf, affected crop leaf)
   - "flower" (e.g. Jasmine, Marigold, Rose, Sunflower)
   - "seed" (e.g. Grain, seed batch, pods)
   - "non_agricultural" (e.g. Person, Face, Human, Dog, Cat, Pet animal, Car, Vehicle, Building, Anime/Manga illustration, Cartoon, Screenshot, Document, Furniture, Processed food dish, Household object, Random non-plant object)

2. AGRICULTURAL CHECK:
   - If the image contains a person, face, animal, vehicle, building, anime character, cartoon, screenshot, or non-plant object, mark isAgricultural=false and category="non_agricultural".

3. IDENTIFIED CROP:
   - What exact plant/crop species is present? (e.g. "Tomato", "Banana", "Rice", "Cotton", "Chilli", "Potato", "Mango", "Brinjal", "Groundnut", "Sugarcane", "Maize", "Wheat", "Onion", null if non-agricultural).

4. DETECTED SUBJECT:
   - A brief 2-4 word description of what is actually visible in the image (e.g. "Person / Illustration", "Anime Character", "Tomato Fruit", "Tomato Leaf", "Banana Bunch", "Sedan Car", "Dog", "Rice Foliage").

5. LEAF DISEASE SUITABILITY:
   - Is this image specifically an affected plant leaf or foliage shoot suitable for plant pathology / leaf disease analysis?
   - If it is a fruit, vegetable produce, person, animal, vehicle, anime, or object, set isLeafDiseaseImage=false.
   - Only set isLeafDiseaseImage=true if an actual crop leaf/foliage is visible and clearly inspectable.

6. CLARITY:
   - Is the image clear, or is it too blurry, dark, distant, or unclear? (qualityScore: 0 to 100).

Return ONLY a raw valid JSON object without markdown fences:
{
  "isAgricultural": boolean,
  "category": "fruit" | "vegetable" | "crop" | "leaf" | "flower" | "seed" | "non_agricultural",
  "identifiedCrop": string or null,
  "detectedSubject": string,
  "confidence": number,
  "isLeafDiseaseImage": boolean,
  "isBlurryOrUnclear": boolean,
  "qualityScore": number
}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const visionRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Image } },
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
      const parsed = JSON.parse(cleaned);

      // 1. Non-Agricultural Check
      if (!parsed.isAgricultural || parsed.category === 'non_agricultural') {
        return {
          isAgricultural: false,
          category: 'non_agricultural',
          identifiedCrop: null,
          detectedSubject: parsed.detectedSubject || 'Person / Illustration',
          confidence: parsed.confidence || 0.95,
          isLeafDiseaseImage: false,
          suitabilityMessage: `This image does not appear to be a real agricultural crop or plant. Detected: ${parsed.detectedSubject || 'Non-agricultural subject'}. Please upload a clear photo of a real crop, fruit, vegetable, or affected plant leaf.`,
          qualityScore: parsed.qualityScore || 10,
          message: `This image does not appear to be a real agricultural crop or plant. Detected: ${parsed.detectedSubject || 'Non-agricultural object'}.`,
          canProceedToDiseaseAnalysis: false,
          validationStatus: 'NON_AGRICULTURAL',
        };
      }

      // 2. Blurry / Low Quality Check
      if (parsed.isBlurryOrUnclear || (parsed.qualityScore && parsed.qualityScore < 45)) {
        return {
          isAgricultural: true,
          category: parsed.category || 'leaf',
          identifiedCrop: parsed.identifiedCrop || 'Unknown',
          detectedSubject: parsed.detectedSubject || 'Unclear leaf photo',
          confidence: parsed.confidence || 0.4,
          isLeafDiseaseImage: false,
          suitabilityMessage: 'Image is too unclear for reliable analysis. Please upload a clear, close-up photo of the affected leaf.',
          qualityScore: parsed.qualityScore || 30,
          message: 'Image is too unclear for reliable analysis. Please upload a clear, close-up photo of the affected leaf.',
          canProceedToDiseaseAnalysis: false,
          validationStatus: 'UNCLEAR_OR_BLURRY',
        };
      }

      // 3. Agricultural Produce (Fruit / Vegetable / Seed) but NOT a leaf
      if (!parsed.isLeafDiseaseImage) {
        const prodName = parsed.detectedSubject || parsed.identifiedCrop || 'Agricultural Produce';
        return {
          isAgricultural: true,
          category: parsed.category || 'vegetable',
          identifiedCrop: parsed.identifiedCrop || 'Crop Produce',
          detectedSubject: prodName,
          confidence: parsed.confidence || 0.92,
          isLeafDiseaseImage: false,
          suitabilityMessage: `Leaf disease analysis cannot be performed because this image shows a ${prodName} rather than an affected leaf. Please upload a clear image of an affected leaf to diagnose plant pathology.`,
          qualityScore: parsed.qualityScore || 90,
          message: `${prodName} detected. This image is not suitable for leaf disease analysis. Please upload a clear image of an affected leaf.`,
          canProceedToDiseaseAnalysis: false,
          validationStatus: 'AGRICULTURAL_NOT_LEAF',
        };
      }

      // 4. Valid Leaf Image
      return {
        isAgricultural: true,
        category: 'leaf',
        identifiedCrop: parsed.identifiedCrop || 'Crop',
        detectedSubject: parsed.detectedSubject || `${parsed.identifiedCrop || 'Crop'} Leaf`,
        confidence: parsed.confidence || 0.94,
        isLeafDiseaseImage: true,
        suitabilityMessage: 'Image is suitable for crop disease analysis.',
        qualityScore: parsed.qualityScore || 95,
        message: `Valid ${parsed.identifiedCrop || 'crop'} leaf image accepted. Ready for disease analysis.`,
        canProceedToDiseaseAnalysis: true,
        validationStatus: 'VALID_LEAF',
      };
    } catch (err: any) {
      if (err.message && err.message.includes('AI Vision service is not configured')) {
        throw err;
      }
      console.error('[Vision Analysis Exception]:', err);
      throw new Error(err.message || 'Vision AI analysis failed. Please try again.');
    }
  }

  // Backward compatibility wrapper
  static async validateCropLeafImage(params: {
    imageUrl: string;
    selectedCrop?: string;
  }) {
    const understanding = await this.classifyAndUnderstandImage(params);
    return {
      isValid: understanding.canProceedToDiseaseAnalysis,
      validationStatus:
        understanding.validationStatus === 'VALID_LEAF'
          ? ('VALID' as const)
          : understanding.validationStatus === 'UNCLEAR_OR_BLURRY'
          ? ('UNCLEAR_OR_BLURRY' as const)
          : ('NOT_PLANT' as const),
      detectedCrop: understanding.identifiedCrop || 'None',
      detectedSubject: understanding.detectedSubject,
      qualityScore: understanding.qualityScore,
      message: understanding.message,
      understanding,
    };
  }
}
