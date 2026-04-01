import { analyzeImage, chatWithAgriBot, testGeminiKey } from '../services/geminiService.js';
import { db } from '../config/firebase.js';

export const testKey = async (req, res) => {
  try {
    const result = await testGeminiKey();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const detectDisease = async (req, res) => {
  const { imageBase64, mimeType, location, temperature, language } = req.body;
  const userId = req.user?.uid || 'anonymous';

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  try {
    const diagnosis = await analyzeImage(imageBase64, location, temperature, mimeType, language);

    if (!diagnosis.isClear) {
      return res.status(422).json({ 
        error: 'Image is unclear or not a plant. Please try again with a clearer photo of a leaf.' 
      });
    }

    res.json(diagnosis);
  } catch (error) {
    console.error('Error in disease detection:', error);
    if (error.message === "INVALID_API_KEY") {
      return res.status(401).json({ error: 'The Gemini API Key provided is invalid or has been reported as leaked. Please check your AI Studio Secrets.' });
    }
    res.status(500).json({ error: 'Failed to process image' });
  }
};

export const getHistory = async (req, res) => {
  const userId = req.user?.uid;

  try {
    if (!db || !userId) {
      return res.json([
        { id: '1', plantType: 'Tomato', disease: 'Healthy', confidence: 0.99, timestamp: new Date() }
      ]);
    }

    const snapshot = await db.collection('diagnoses')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const chat = async (req, res) => {
  const { context, message, location, imageBase64, mimeType, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const reply = await chatWithAgriBot(context, message, location, imageBase64, mimeType, language);
    res.json({ reply });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
};
