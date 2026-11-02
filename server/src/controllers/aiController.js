import multer from 'multer';
import { analyzeMealImage } from '../services/geminiService.js';

// Multer memory storage configuration with 10MB limit and MIME type validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file type. Only JPEG, PNG, and WebP images are supported.');
      err.code = 'INVALID_FILE_TYPE';
      cb(err, false);
    }
  },
});

export const uploadMealMiddleware = upload.single('image');

/**
 * Controller: Handle AI meal analysis request
 */
export async function analyzeMeal(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided. Please upload a meal photo.',
        code: 'MISSING_IMAGE',
      });
    }

    const { notes = '', mealType = 'lunch' } = req.body;
    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    const analysisResult = await analyzeMealImage(imageBuffer, mimeType, notes);

    return res.status(200).json({
      success: true,
      mealType,
      ...analysisResult,
    });
  } catch (error) {
    if (error.code === 'GEMINI_NOT_CONFIGURED') {
      return res.status(503).json({
        error: error.message,
        code: error.code,
        setupRequired: true,
        instructions: 'Add GEMINI_API_KEY=your_key in server/.env (obtain free from Google AI Studio at aistudio.google.com).',
      });
    }

    if (error.code === 'INVALID_FILE_TYPE' || error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: error.message || 'File size exceeds 10MB limit or has an unsupported format.',
        code: error.code,
      });
    }

    console.error('Error analyzing meal image:', error.message);
    return res.status(error.status || 500).json({
      error: error.message || 'Failed to analyze meal photograph. Please try another angle or enter manually.',
      code: 'ANALYSIS_FAILED',
      details: error.details || null,
    });
  }
}

