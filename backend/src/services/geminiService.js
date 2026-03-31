import { GoogleGenAI, Type } from "@google/genai";

const getDynamicMock = (imageBase64) => {
  const mockResults = [
    { plantType: "Tomato", disease: "Early Blight", confidence: 0.92, remedies: ["Remove infected leaves", "Apply copper-based fungicide"], prevention: ["Rotate crops", "Ensure good air circulation"], isClear: true, isMock: true, pestName: "Aphids", pestRemedies: ["Spray with neem oil", "Introduce ladybugs"], pestConfidence: 0.85 },
    { plantType: "Wheat", disease: "Leaf Rust", confidence: 0.88, remedies: ["Apply triazole fungicides", "Monitor spread"], prevention: ["Plant resistant varieties", "Clear volunteer wheat"], isClear: true, isMock: true, pestName: "", pestRemedies: [], pestConfidence: 0 },
    { plantType: "Apple", disease: "Apple Scab", confidence: 0.95, remedies: ["Apply captan or myclobutanil", "Remove fallen leaves"], prevention: ["Prune trees for airflow", "Plant resistant varieties"], isClear: true, isMock: true, pestName: "Codling Moth", pestRemedies: ["Use pheromone traps", "Apply granulosis virus"], pestConfidence: 0.78 },
    { plantType: "Corn", disease: "Healthy", confidence: 0.98, remedies: [], prevention: ["Maintain regular watering", "Monitor for pests"], isClear: true, isMock: true, pestName: "Corn Borer", pestRemedies: ["Apply Bacillus thuringiensis (Bt)", "Remove infested stalks"], pestConfidence: 0.92 },
    { plantType: "Potato", disease: "Late Blight", confidence: 0.91, remedies: ["Apply chlorothalonil", "Destroy infected plants"], prevention: ["Use certified seed", "Hilling to protect tubers"], isClear: true, isMock: true, pestName: "Colorado Potato Beetle", pestRemedies: ["Handpick beetles", "Apply spinosad"], pestConfidence: 0.89 }
  ];
  // Simple hash based on length to pick a deterministic mock result
  const hash = (imageBase64 || "").length % mockResults.length;
  return mockResults[hash];
};

const getValidKey = () => {
  let val = process.env.GEMINI_API_KEY?.trim();
  if (val) {
    val = val.replace(/[^\x00-\x7F]/g, "");
    if (val === 'your_actual_api_key_here' || val === 'MY_GEMINI_API_KEY' || val.length < 10) {
      return null;
    }
    return { key: val, source: 'GEMINI_API_KEY' };
  }
  return null;
};

export const analyzeImage = async (imageBase64, location, mimeType = "image/jpeg", language = "en") => {
  let ai = null;
  try {
    const keyInfo = getValidKey();
    
    if (keyInfo) {
      ai = new GoogleGenAI({ apiKey: keyInfo.key });
      console.log(`[DEBUG] Gemini AI Initialized successfully. Key Source: ${keyInfo.source}. Key length: ${keyInfo.key.length}. Preview: ${keyInfo.key.substring(0, 4)}...${keyInfo.key.substring(keyInfo.key.length - 4)}`);
    } else {
      const rawKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      console.warn(`[DEBUG] Gemini API Key is missing or invalid. Raw key length: ${rawKey?.length || 0}. Falling back to mock data.`);
    }
  } catch (e) {
    console.error("Gemini AI Initialization Error:", e);
  }

  // Bypass MOCK_API if we have a valid AI instance
  if ((process.env.MOCK_API === 'true' && !ai) || !ai) {
    console.log("[DEBUG] Using Mock Data (MOCK_API is true or AI not initialized)");
    return getDynamicMock(imageBase64);
  }

  let locationContext = "";
  if (location && location.lat && location.lng) {
    locationContext = `The crop is located at latitude ${location.lat}, longitude ${location.lng}. Please consider regional climate and common local diseases in your analysis if relevant.`;
  }

  let langPrompt = "";
  if (language === "gu") {
    langPrompt = `CRITICAL: Provide ALL response fields (plantType, disease, remedies, prevention, pestName, pestRemedies) in Gujarati language (Gujarati script). 
    For the "remedies" and "pestRemedies" arrays, any pesticide, fungicide, insecticide, or chemical names MUST be given in the form commonly used in Indian markets, written in Gujarati script (e.g., "કોપર ઓક્સીક્લોરાઇડ", "મેન્કોઝેબ", "ઇમિડાક્લોપ્રિડ"). This is extremely important for farmers to recognize the products.`;
  } else if (language !== "en") {
    langPrompt = `CRITICAL: Provide ALL response fields (plantType, disease, remedies, prevention, pestName, pestRemedies) in ${language} language. This is extremely important.`;
  }

  const prompt = `
    Analyze this image carefully. 
    CRITICAL INSTRUCTION: First, determine if the image clearly shows a plant, crop, leaf, vegetable, fruit, or agricultural subject.
    If the image is NOT a plant/crop/leaf/vegetable/fruit (e.g., it's a person, car, animal, random object, screenshot, or completely blurry), you MUST set "isClear" to false and leave other fields empty. Do not hallucinate a plant name.
    If it IS a valid plant/crop/leaf, identify:
    1. The plant type.
    2. Any diseases present.
    3. Any insects, pests, or bugs visible on the plant/leaf.
    ${locationContext}
    ${langPrompt}
  `;

  try {
    // Sanitize imageBase64: Ensure it only contains valid base64 characters
    // This prevents TypeErrors if non-ASCII characters snuck into the string
    const sanitizedBase64 = (imageBase64 || "").replace(/[^\x00-\x7F]/g, "");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: sanitizedBase64,
              mimeType: mimeType
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plantType: { type: Type.STRING, description: "The name of the plant or crop. Empty if not a plant." },
            disease: { type: Type.STRING, description: "The name of the disease, or 'Healthy'. Empty if not a plant." },
            confidence: { type: Type.NUMBER, description: "Confidence score for disease detection between 0 and 1." },
            remedies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of remedies for the disease. Empty if healthy or not a plant." },
            prevention: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of prevention methods. Empty if not a plant." },
            pestName: { type: Type.STRING, description: "The name of any detected insect or pest. Empty if none detected." },
            pestRemedies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of remedies or treatments specifically for the detected pest. Empty if none." },
            pestConfidence: { type: Type.NUMBER, description: "Confidence score for pest detection between 0 and 1." },
            isClear: { type: Type.BOOLEAN, description: "True ONLY if the image clearly shows a plant, crop, leaf, fruit, or vegetable. False otherwise." }
          },
          required: ["plantType", "disease", "confidence", "remedies", "prevention", "isClear", "pestName", "pestRemedies"]
        }
      }
    });
    
    console.log("[DEBUG] Gemini API Analysis call succeeded.");
    return JSON.parse(response.text.trim());
  } catch (apiError) {
    const errorMsg = apiError.message || "";
    let isQuotaError = false;
    let errStr = "";
    
    // Check various ways the error might be structured
    try {
      errStr = typeof apiError === 'object' ? JSON.stringify(apiError) : String(apiError);
      if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429") || errStr.includes("quota exceeded")) {
        isQuotaError = true;
      }
    } catch (e) {
      errStr = errorMsg;
      if (errorMsg.toLowerCase().includes("quota") || errorMsg.includes("429")) {
        isQuotaError = true;
      }
    }

    if (errStr.includes("API key not valid") || errStr.includes("leaked") || errStr.includes("PERMISSION_DENIED") || errorMsg.includes("API key not valid") || errorMsg.includes("leaked") || errorMsg.includes("PERMISSION_DENIED")) {
      console.error("[DEBUG] Gemini API Key Error:", apiError);
      throw new Error("INVALID_API_KEY");
    }
    
    if (isQuotaError) {
      console.warn("[DEBUG] Gemini API Quota Exceeded (429). Falling back to mock data.");
      return {
        ...getDynamicMock(imageBase64),
        isMock: true,
        quotaExceeded: true,
        message: "AI Quota Exceeded. Showing simulated results."
      };
    }

    console.error("[DEBUG] Gemini API Analysis Error:", apiError);

    // Fallback to dynamic mock data if API fails and no key is provided
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_api_key_here') {
      return getDynamicMock(imageBase64);
    }
    throw new Error(`AI Analysis Failed: ${apiError.message}`);
  }
};

export const chatWithAgriBot = async (context, message, location, imageBase64, mimeType = "image/jpeg", language = "en") => {
  let ai = null;
  try {
    const keyInfo = getValidKey();
    
    if (keyInfo) {
      ai = new GoogleGenAI({ apiKey: keyInfo.key });
      console.log(`[DEBUG] AgriBot Chat Initialized successfully. Key Source: ${keyInfo.source}. Key length: ${keyInfo.key.length}. Preview: ${keyInfo.key.substring(0, 4)}...${keyInfo.key.substring(keyInfo.key.length - 4)}`);
    } else {
      const rawKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      console.warn(`[DEBUG] AgriBot Chat Key is missing or invalid. Raw key length: ${rawKey?.length || 0}. Falling back to mock data.`);
    }
  } catch (e) {
    console.error("AgriBot Chat Initialization Error:", e);
  }

  // Bypass MOCK_API if we have a valid AI instance
  if ((process.env.MOCK_API === 'true' && !ai) || !ai) {
    console.log("[DEBUG] Chat Using Mock Mode (MOCK_API is true or AI not initialized)");
    return "I am AgriBot (Mock Mode). To get real AI responses, please configure a valid Gemini API Key. In the meantime, I recommend following standard agricultural practices for your crop.";
  }

  let locationContext = "";
  if (location && location.lat && location.lng) {
    if (location.name) {
      locationContext = `The farmer is located near ${location.name} (Lat: ${location.lat}, Lng: ${location.lng}). Consider local climate or regional factors for ${location.name} if relevant.`;
    } else {
      try {
        // Fetch location name using a free reverse geocoding API
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=10&addressdetails=1`, {
          headers: {
            'User-Agent': 'AgriAssist-Hackathon-App'
          }
        });
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          const areaName = geoData.address?.city || geoData.address?.county || geoData.address?.state || "your area";
          locationContext = `The farmer is located near ${areaName} (Lat: ${location.lat}, Lng: ${location.lng}). Consider local climate or regional factors for ${areaName} if relevant.`;
        } else {
          locationContext = `The farmer is located at latitude ${location.lat}, longitude ${location.lng}. Consider local climate or regional factors if relevant.`;
        }
      } catch (e) {
        console.warn("Reverse geocoding failed:", e);
        locationContext = `The farmer is located at latitude ${location.lat}, longitude ${location.lng}. Consider local climate or regional factors if relevant.`;
      }
    }
  }

  let langPrompt = "";
  if (language === "gu") {
    langPrompt = `CRITICAL: You MUST respond in Gujarati language (Gujarati script). 
    Any product recommendations or chemical names MUST use local Indian market names in Gujarati script. Do not use English unless the user explicitly asks for it.`;
  } else if (language !== "en") {
    langPrompt = `CRITICAL: You MUST respond in ${language} language. Do not use English unless the user explicitly asks for it.`;
  }

  const prompt = `You are AgriBot, an expert agricultural AI assistant. 
  The farmer just scanned a crop with the following diagnosis:
  Plant: ${context.plantType}
  Disease: ${context.disease}
  ${locationContext}
  ${langPrompt}
  
  The farmer asks: "${message}"
  
  Provide a helpful, concise, and scientifically accurate response (max 3-4 sentences). If the user asks about the image, refer to the provided image.`;

  try {
    // Sanitize imageBase64: Ensure it only contains valid base64 characters
    const sanitizedBase64 = imageBase64 ? imageBase64.replace(/[^\x00-\x7F]/g, "") : null;

    const contents = {
      parts: [
        { text: prompt }
      ]
    };

    if (sanitizedBase64) {
      contents.parts.push({
        inlineData: {
          data: sanitizedBase64,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: contents
    });
    console.log("[DEBUG] AgriBot Chat API call succeeded.");
    return response.text;
  } catch (error) {
    const errorMsg = error.message || "";
    let isQuotaError = false;
    let errStr = "";

    try {
      errStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
      if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429") || errStr.includes("quota exceeded")) {
        isQuotaError = true;
      }
    } catch (e) {
      errStr = errorMsg;
      if (errorMsg.toLowerCase().includes("quota") || errorMsg.includes("429")) {
        isQuotaError = true;
      }
    }
    
    if (errStr.includes("API key not valid") || errStr.includes("leaked") || errStr.includes("PERMISSION_DENIED") || errorMsg.includes("API key not valid") || errorMsg.includes("leaked") || errorMsg.includes("PERMISSION_DENIED")) {
      console.error("[DEBUG] Chat API Key Error:", error);
      return "The Gemini API Key provided is invalid or has been reported as leaked. Please check your AI Studio Secrets and ensure you copied the key correctly.";
    }
    
    if (isQuotaError) {
      console.warn("[DEBUG] Chat API Quota Exceeded (429). Providing friendly fallback message.");
      return "I'm sorry, but I've reached my AI usage limit for now. Please try again in a few minutes or tomorrow. In the meantime, I recommend following standard agricultural practices for your crop.";
    }

    console.error("[DEBUG] Chat API Error:", error);
    return `I am currently experiencing connection issues to the AI network. Error details: ${error.message || 'Unknown error'}. Please check your API key or try again later.`;
  }
};

export const testGeminiKey = async () => {
  const keysToCheck = ['GEMINI_API_KEY'];
  
  const keyStatus = {};
  try {
    for (const key of keysToCheck) {
      const val = process.env[key];
      if (val) {
        const sanitized = val.trim().replace(/[^\x00-\x7F]/g, "");
        keyStatus[key] = {
          exists: true,
          originalLength: val.length,
          sanitizedLength: sanitized.length,
          preview: sanitized.length > 8 ? `${sanitized.substring(0, 4)}...${sanitized.substring(sanitized.length - 4)}` : "too short"
        };
      } else {
        keyStatus[key] = { exists: false };
      }
    }

    const keyInfo = getValidKey();
    
    if (!keyInfo) {
      return { 
        success: false, 
        error: "No valid API key found in environment variables.",
        keyStatus
      };
    }

    const ai = new GoogleGenAI({ apiKey: keyInfo.key });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: "Hello, this is a test message to verify the API key."
    });

    return { 
      success: true, 
      message: response.text,
      keySource: keyInfo.source,
      keyLength: keyInfo.key.length,
      keyStatus
    };
  } catch (error) {
    console.error("[DEBUG] Test Key Error:", error);
    return { 
      success: false, 
      error: error.message,
      details: error.stack,
      keyStatus: typeof keyStatus !== 'undefined' ? keyStatus : {}
    };
  }
}
