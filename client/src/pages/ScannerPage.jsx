import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyzeMealImage } from '../services/apiClient';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Info,
  CheckCircle2,
  FileText,
  Utensils,
  ArrowLeft,
} from 'lucide-react';
import { curatedRecipes } from '../data/curatedData';

export default function ScannerPage() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mealCategory, setMealCategory] = useState(() => {
    const hr = new Date().getHours();
    if (hr < 11) return 'breakfast';
    if (hr < 16) return 'lunch';
    if (hr < 21) return 'dinner';
    return 'snack';
  });
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
      setAnalysisError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setAnalysisError('File size is too large (max 10MB). Please select a smaller photo.');
      return;
    }

    setAnalysisError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Sample preset picker
  const handleSelectSample = async (recipe) => {
    setPreviewUrl(recipe.image_url);
    setNotes(`Sample meal: ${recipe.title}`);
    setMealCategory(recipe.category ? recipe.category.toLowerCase() : 'lunch');

    // Create a dummy File object from the sample image
    try {
      const res = await fetch(recipe.image_url);
      const blob = await res.blob();
      const file = new File([blob], 'sample_meal.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      showToast(`Selected sample "${recipe.title}"! Ready to scan.`, 'info');
    } catch {
      // If CORS or offline, mock file
      const dummyBlob = new Blob(['sample-img'], { type: 'image/jpeg' });
      const file = new File([dummyBlob], 'sample_meal.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !previewUrl) {
      setAnalysisError('Please choose or take a food photograph first.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      formData.append('meal_category', mealCategory);
      formData.append('notes', notes);

      const token = session?.access_token || null;
      const data = await analyzeMealImage(formData, token);

      if (data && data.is_food === false) {
        setAnalysisError(
          data.rejectionReason || 'No food detected in this image. Please capture a photo of an edible meal, plate, or snack.'
        );
        return;
      }

      if (!data || !data.items || data.items.length === 0) {
        setAnalysisError('No food items could be recognized in this photo. Please retake with clearer lighting.');
        return;
      }

      // Navigate to results screen with analysis data
      navigate('/scan-results', {
        state: {
          analysis: data,
          previewUrl,
          mealCategory,
          notes,
        },
      });
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || 'Failed to analyze meal image. Please try again with clear lighting.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-16">
      {/* ============================================================== */}
      {/* 1. MINT VIBRANT HEADER */}
      {/* ============================================================== */}
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 p-4 sm:p-6 lg:p-8 pt-3 pb-6 rounded-b-[2.5rem] bg-gradient-to-b from-[#A5F3C8] via-[#CEF6DF] via-40% to-[#F8FAF8] border-b border-[#CEF6DF]/60 shadow-[0_4px_24px_rgba(0,108,77,0.04)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-xs flex items-center justify-center text-[#18181B] hover:bg-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
                AI Meal Scanner
              </h1>
              <p className="text-xs text-[#006C4D] font-bold">
                Multimodal portion & calorie estimation
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[#006C4D] text-xs font-black shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
            Vision Ready
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN CAPTURE / UPLOAD CARD */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2EFE7] shadow-sm flex flex-col items-center">
        {!previewUrl ? (
          <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-[#CEF6DF] rounded-3xl bg-[#F8FAF8] hover:bg-[#E8FBF0]/40 transition-colors">
            <div className="w-16 h-16 rounded-3xl bg-[#101418] flex items-center justify-center text-white shadow-xl mb-4">
              <Camera className="w-8 h-8 text-[#34D399]" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#18181B] text-center mb-1">
              Snap or upload your meal photo
            </h3>
            <p className="text-xs sm:text-sm text-[#6C7A72] text-center max-w-sm mb-6 font-medium">
              Gemini identifies ingredients, detects portion weights, and computes accurate calories & macros.
            </p>

            {/* Action Buttons: Take Photo & Gallery Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-3 px-5 rounded-full bg-[#101418] hover:bg-[#27272A] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Camera className="w-4 h-4 text-[#34D399]" />
                <span>Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-5 rounded-full bg-white text-[#18181B] font-black text-xs border border-[#E2EFE7] hover:bg-[#E8FBF0] shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Upload className="w-4 h-4 text-[#006C4D]" />
                <span>Upload File</span>
              </button>
            </div>

            {/* Hidden native inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </div>
        ) : (
          /* Image Preview State */
          <div className="w-full flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#E2EFE7] bg-black/5 shadow-inner">
              <img src={previewUrl} alt="Meal to analyze" className="w-full h-full object-cover" />

              <button
                onClick={handleReset}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>
            </div>
          </div>
        )}

        {/* Quick Sample Presets (For instant testing) */}
        {!previewUrl && (
          <div className="w-full mt-6 pt-5 border-t border-[#E2EFE7]">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93] block mb-2.5 text-center">
              Or Try a Sample Dish
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {curatedRecipes.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSample(item)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#F8FAF8] hover:bg-[#E8FBF0] border border-[#E2EFE7] transition-all text-center group"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-[#18181B] line-clamp-1">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal Category & Notes Fields */}
        <div className="w-full mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#6C7A72] mb-2">
              Meal Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMealCategory(cat)}
                  className={`py-2 px-3 rounded-2xl text-xs font-black capitalize transition-all ${
                    mealCategory === cat
                      ? 'bg-[#18181B] text-white shadow-md'
                      : 'bg-[#F8FAF8] text-[#6C7A72] border border-[#E2EFE7] hover:bg-[#E8FBF0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#6C7A72] mb-1.5">
              Meal Context / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1 tbsp olive oil, homemade sourdough..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FAF8] border border-[#E2EFE7] text-xs font-semibold text-[#18181B] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#34D399]"
            />
          </div>
        </div>

        {/* Error Notification */}
        {analysisError && (
          <div className="w-full mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#BA1A1A] flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          </div>
        )}

        {/* Analyze Action Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={(!selectedFile && !previewUrl) || analyzing}
          className="w-full mt-6 py-3.5 rounded-2xl bg-[#101418] hover:bg-[#27272A] text-white font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <Sparkles className="w-4 h-4 text-[#34D399] animate-spin" />
              <span>Analyzing Meal with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#34D399]" />
              <span>Analyze Food & Portion</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Manual Entry Fallback Suggestion */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-white border border-[#E2EFE7] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#E8FBF0] flex items-center justify-center text-[#006C4D]">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#18181B]">Don't have a photo?</h4>
            <p className="text-[11px] text-[#6C7A72]">
              Search verified USDA & Indian foods and record portions manually
            </p>
          </div>
        </div>
        <Link
          to="/diary?action=add"
          className="px-4 py-2 rounded-full bg-[#18181B] text-white text-xs font-black hover:bg-[#27272A] transition-colors"
        >
          Add Food
        </Link>
      </div>
    </div>
  );
}
