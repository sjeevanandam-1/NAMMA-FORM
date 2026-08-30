import React, { useEffect, useState, useRef } from 'react';
import api from '../../lib/api.js';
import {
  Stethoscope,
  Camera,
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck,
  RotateCcw,
  AlertCircle,
  XCircle,
  Check,
  Trash2,
  Layers,
  Bug,
  HelpCircle,
  Info,
} from 'lucide-react';

interface PossibleCauseItem {
  name: string;
  likelihood: string;
}

interface DiseaseAnalysis {
  status: 'possible_disease' | 'healthy' | 'pest_damage' | 'nutrient_deficiency' | 'environmental_stress' | 'unable_to_identify';
  problem: string;
  causeCategory: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutrient' | 'environmental' | 'healthy' | 'unknown';
  confidence: number;
  symptoms: string[];
  possibleCauses: PossibleCauseItem[];
  management: string[];
  prevention: string[];
  warning: string;
}

interface FullVisionResult {
  isAgricultural: boolean;
  category: string;
  detectedSubject: string;
  crop: string | null;
  plantPart: string;
  imageQuality: string;
  suitableForDiseaseAnalysis: boolean;
  suitabilityMessage?: string;
  analysis?: DiseaseAnalysis;
  scan?: any;
}

export const CropDoctor: React.FC = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);

  const [selectedCrop, setSelectedCrop] = useState<string>('Auto-Detect');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Vision Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<FullVisionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/disease/history');
      setScans(res.data.data || []);
      if (res.data.data?.length > 0 && !selectedScan && !visionResult) {
        setSelectedScan(res.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching scan history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const resetUploadState = (errorMsg?: string) => {
    setFile(null);
    setPreviewUrl(null);
    setVisionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (errorMsg) {
      setErrorMessage(errorMsg);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setVisionResult(null);
    setSelectedScan(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        resetUploadState('Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        resetUploadState('Image file size must be less than 10MB.');
        return;
      }

      setFile(selectedFile);
      const localBlob = URL.createObjectURL(selectedFile);
      setPreviewUrl(localBlob);

      // Real Multimodal Vision AI Analysis
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        if (selectedCrop && selectedCrop !== 'Auto-Detect') {
          formData.append('cropName', selectedCrop);
        }

        const res = await api.post('/disease/validate-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const data: FullVisionResult = res.data.data;
        setVisionResult(data);

        // Fetch refreshed scan history
        fetchHistory();
      } catch (err: any) {
        const resData = err.response?.data?.data as FullVisionResult | undefined;
        const msg = err.response?.data?.message || 'Vision AI analysis failed.';

        if (
          err.response?.data?.status === 'INVALID_AGRICULTURAL_IMAGE' ||
          err.response?.data?.status === 'IMAGE_REJECTED' ||
          (resData && !resData.isAgricultural)
        ) {
          resetUploadState(
            `Invalid agricultural image. This image does not appear to contain a crop, plant, leaf, or fruit. (Detected: ${resData?.detectedSubject || 'Non-agricultural'}). Please upload a clear crop/plant/leaf/fruit image.`
          );
        } else if (err.response?.data?.status === 'QUALITY_INSUFFICIENT' || (resData && resData.imageQuality !== 'good')) {
          resetUploadState(
            'Image quality is insufficient for reliable analysis. Please upload a clear close-up image of the affected area.'
          );
        } else if (err.response?.data?.status === 'AI_MODEL_NOT_INSTALLED') {
          resetUploadState(
            'AI model not installed. Please start your custom AI model inference service (at AI_MODEL_SERVICE_URL in server/.env) or deploy the trained model.'
          );
        } else {
          resetUploadState(msg);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleDeleteScan = async (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan history record?')) {
      return;
    }

    try {
      await api.delete(`/disease/history/${scanId}`);
      setScans((prev) => prev.filter((s) => s.id !== scanId));
      if (selectedScan?.id === scanId) {
        setSelectedScan(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete scan');
    }
  };

  // Determine crop mismatch
  const hasCropMismatch =
    selectedCrop !== 'Auto-Detect' &&
    visionResult?.crop &&
    !visionResult.crop.toLowerCase().includes(selectedCrop.toLowerCase()) &&
    !selectedCrop.toLowerCase().includes(visionResult.crop.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 sm:p-8 rounded-3xl text-white shadow-card border border-teal-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              REAL MULTIMODAL AI CROP VISION & DISEASE IDENTIFICATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Crop Doctor & Vision Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Upload any image. Real Google Gemini 1.5 Flash Vision understands the subject, verifies agricultural suitability, and delivers scientific diagnostic guidance.
            </p>
          </div>

          <div className="bg-teal-950/60 p-3.5 rounded-2xl border border-teal-700/60 text-xs space-y-1">
            <span className="text-teal-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              ICAR & TNAU Knowledge Cross-Reference
            </span>
            <p className="text-[11px] text-slate-300">
              Integrated pest management & verified agronomic protocols.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Live Vision Understanding */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Camera className="w-5 h-5 text-teal-600" />
                  Upload Crop Image
                </h3>
                {previewUrl && (
                  <button
                    onClick={() => resetUploadState()}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {/* Crop Filter / Reference Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Crop Filter (Optional)
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Auto-Detect">Auto-Detect Crop from Image</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Rice">Rice (Paddy)</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Banana">Banana</option>
                  <option value="Potato">Potato</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Mango">Mango</option>
                  <option value="Brinjal">Brinjal (Eggplant)</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize (Corn)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The AI vision model inspects the uploaded image directly and never assumes the dropdown value.
                </span>
              </div>

              {/* Crop Mismatch Alert */}
              {hasCropMismatch && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Crop Mismatch Detected:</strong>
                    Selected crop is <strong>{selectedCrop}</strong>, but AI vision detected <strong>{visionResult?.crop}</strong>. Analyzing as <strong>{visionResult?.crop}</strong>.
                  </div>
                </div>
              )}

              {/* Error / Rejection Notice */}
              {errorMessage && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-sm">Image Rejected:</strong>
                    <span className="leading-relaxed mt-0.5 block">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Actual Uploaded Image Preview Box */}
              <div className="relative h-64 rounded-2xl bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Actual uploaded crop preview"
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                      {file?.name || 'Actual Uploaded Image'}
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">No image selected</p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Upload a photo of your crop foliage, leaf, fruit, or plant
                    </p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                    <Sparkles className="w-8 h-8 text-teal-400 animate-spin" />
                    <span className="text-xs font-bold">Analyzing image with Google Gemini Vision...</span>
                    <span className="text-[10px] text-slate-300">Understanding subject & examining pathology...</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="w-full py-3.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-teal-200 shadow-xs">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>{isAnalyzing ? 'Analyzing Image...' : previewUrl ? 'Upload Different Photo' : 'Upload Crop Photo'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  disabled={isAnalyzing}
                  className="hidden"
                />
              </label>

              {/* AI Image Understanding Box */}
              {visionResult && (
                <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-900">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      AI Image Understanding
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase">
                      {visionResult.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Detected Crop
                      </span>
                      <strong className="text-slate-900 text-xs font-black">
                        {visionResult.crop || 'None'}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Plant Part
                      </span>
                      <strong className="text-slate-900 capitalize text-xs">
                        {visionResult.plantPart}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Image Quality
                      </span>
                      <strong className="text-slate-900 capitalize text-xs">
                        {visionResult.imageQuality}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Suitable for Leaf Analysis
                      </span>
                      <strong
                        className={`text-xs font-black ${
                          visionResult.suitableForDiseaseAnalysis
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {visionResult.suitableForDiseaseAnalysis ? 'YES' : 'NO'}
                      </strong>
                    </div>
                  </div>

                  {!visionResult.suitableForDiseaseAnalysis && visionResult.suitabilityMessage && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                      {visionResult.suitabilityMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scan History Card */}
            {scans.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                  <span>Recent Scan History ({scans.length})</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {scans.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedScan(s);
                        setVisionResult(null);
                      }}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        selectedScan?.id === s.id
                          ? 'bg-teal-50 border-teal-300 text-teal-950 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {s.cropName?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="block font-bold text-slate-900">{s.diseaseName}</strong>
                          <span className="text-[10px] text-slate-400">
                            {s.cropName} • {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {s.confidenceScore}%
                        </span>
                        <button
                          onClick={(e) => handleDeleteScan(s.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete scan record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Diagnostic & Agricultural Management Report */}
          <div className="lg:col-span-7 space-y-6">
            {visionResult?.analysis ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                      AI CROP DOCTOR DIAGNOSTIC
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                      {visionResult.analysis.problem}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Identified Crop: <strong>{visionResult.crop}</strong> • Plant Part: <strong>{visionResult.plantPart}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Confidence
                      </span>
                      <span className="text-lg font-black text-emerald-600">
                        {Math.round(visionResult.analysis.confidence * 100)}%
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border capitalize ${
                        visionResult.analysis.causeCategory === 'healthy'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : visionResult.analysis.causeCategory === 'viral'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : visionResult.analysis.causeCategory === 'pest'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {visionResult.analysis.causeCategory} Cause
                    </div>
                  </div>
                </div>

                {/* Visible Symptoms */}
                {visionResult.analysis.symptoms?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Visible Symptoms
                    </h4>
                    <ul className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700">
                      {visionResult.analysis.symptoms.map((sym, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Possible Causes & Differentials */}
                {visionResult.analysis.possibleCauses?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Possible Causes & Likelihood
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visionResult.analysis.possibleCauses.map((pc, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{pc.name}</span>
                          <span className="font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md text-[11px]">
                            {pc.likelihood}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Management */}
                {visionResult.analysis.management?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recommended Management
                    </h4>
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                      {visionResult.analysis.management.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-emerald-950">
                          <span className="font-bold text-emerald-700 shrink-0">{idx + 1}.</span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention */}
                {visionResult.analysis.prevention?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Prevention
                    </h4>
                    <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs space-y-2">
                      {visionResult.analysis.prevention.map((prev, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-teal-950">
                          <span className="font-bold text-teal-700 shrink-0">•</span>
                          <span className="leading-relaxed">{prev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning & Advisory Notice */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Advisory Notice:
                  </div>
                  <p className="leading-relaxed">
                    {visionResult.analysis.warning ||
                      'AI-generated agricultural guidance. This is not a confirmed laboratory diagnosis. Consult your local KVK or Agricultural Extension Officer.'}
                  </p>
                </div>
              </div>
            ) : selectedScan ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-in fade-in">
                {/* Result from History */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                      Saved Scan • {new Date(selectedScan.createdAt).toLocaleDateString()}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                      {selectedScan.diseaseName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Crop: <strong>{selectedScan.cropName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Confidence
                      </span>
                      <span className="text-lg font-black text-emerald-600">
                        {selectedScan.confidenceScore}%
                      </span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl text-xs font-extrabold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {selectedScan.severity} SEVERITY
                    </div>
                  </div>
                </div>

                {/* Visible Symptoms */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Visible Symptoms
                  </h4>
                  <p className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedScan.observedSymptoms}
                  </p>
                </div>

                {/* Management */}
                {selectedScan.recommendation && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recommended Management
                    </h4>
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
                      {selectedScan.recommendation.organicTreatment}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                      <strong>Safety Guidelines: </strong>
                      {selectedScan.recommendation.safetyGuideline}
                    </div>
                  </div>
                )}

                {/* Advisory Notice */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Advisory Notice:
                  </div>
                  <p className="leading-relaxed">
                    AI-generated agricultural guidance. This is not a confirmed laboratory diagnosis. Consult your local KVK or Agricultural Extension Officer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
                <Stethoscope className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="font-extrabold text-slate-700 text-base">No Active Diagnostic Scan</h3>
                <p className="text-xs max-w-sm mx-auto">
                  Upload a crop photo on the left. The real AI vision model will inspect the image, identify the crop species, verify leaf disease suitability, and provide agricultural guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
