import { GoogleGenAI, Type } from "@google/genai";

const getDynamicMock = (imageBase64) => {
  const mockResults = [
    { plantType: "Tomato", disease: "Early Blight", confidence: 0.92, remedies: ["Remove infected leaves", "Apply copper-based fungicide"], prevention: ["Rotate crops", "Ensure good air circulation"], isClear: true, isMock: true, pestName: "Aphids", pestRemedies: ["Spray with neem oil", "Introduce ladybugs"], pestConfidence: 0.85, soilFertilityLevel: "Medium", soilFertilityRecommendations: "Consider adding organic compost and a balanced NPK fertilizer to support fruit development." },
    { plantType: "Wheat", disease: "Leaf Rust", confidence: 0.88, remedies: ["Apply triazole fungicides", "Monitor spread"], prevention: ["Plant resistant varieties", "Clear volunteer wheat"], isClear: true, isMock: true, pestName: "", pestRemedies: [], pestConfidence: 0, soilFertilityLevel: "High", soilFertilityRecommendations: "The soil appears well-suited for wheat, but ensure adequate nitrogen levels during the growing season." },
    { plantType: "Apple", disease: "Apple Scab", confidence: 0.95, remedies: ["Apply captan or myclobutanil", "Remove fallen leaves"], prevention: ["Prune trees for airflow", "Plant resistant varieties"], isClear: true, isMock: true, pestName: "Codling Moth", pestRemedies: ["Use pheromone traps", "Apply granulosis virus"], pestConfidence: 0.78, soilFertilityLevel: "Medium", soilFertilityRecommendations: "Apple trees benefit from well-drained soil. Apply a layer of mulch to retain moisture and add a fruit-tree specific fertilizer." },
    { plantType: "Corn", disease: "Healthy", confidence: 0.98, remedies: [], prevention: ["Maintain regular watering", "Monitor for pests"], isClear: true, isMock: true, pestName: "Corn Borer", pestRemedies: ["Apply Bacillus thuringiensis (Bt)", "Remove infested stalks"], pestConfidence: 0.92, soilFertilityLevel: "High", soilFertilityRecommendations: "Corn is a heavy feeder; maintain high nitrogen levels and consider side-dressing with urea if leaves yellow." },
    { plantType: "Potato", disease: "Late Blight", confidence: 0.91, remedies: ["Apply chlorothalonil", "Destroy infected plants"], prevention: ["Use certified seed", "Hilling to protect tubers"], isClear: true, isMock: true, pestName: "Colorado Potato Beetle", pestRemedies: ["Handpick beetles", "Apply spinosad"], pestConfidence: 0.89, soilFertilityLevel: "Low", soilFertilityRecommendations: "Potatoes need loose, well-draining soil. Incorporate aged manure and ensure adequate potassium for tuber growth." }
  ];
  // Simple hash based on length to pick a deterministic mock result
  const hash = (imageBase64 || "").length % mockResults.length;
  return mockResults[hash];
};

const sanitizeKey = (val) => {
  if (!val) return "";
  let clean = val.trim();
  // Remove surrounding quotes
  clean = clean.replace(/^["']|["']$/g, "");
  // Remove accidental prefixes
  clean = clean.replace(/^(GEMINI_KEY|GEMINI_API_KEY|API_KEY)\s*=\s*/i, "");
  clean = clean.replace(/^(Bearer|key)\s+/i, "");
  // Remove all whitespace
  clean = clean.replace(/\s/g, "");
  return clean;
};

const isPlaceholder = (k) => {
  if (!k) return true;
  const val = sanitizeKey(k);
  
  if (val.startsWith('AIza') && val.length >= 35) return false;

  const placeholders = [
    'your_actual_api_key_here',
    'MY_GEMINI_API_KEY',
    'your_gemini_api_key',
    'YOUR_GEMINI_API_KEY',
    'ENTER_YOUR_KEY',
    'your_key_here',
    'placeholder',
    'null',
    'undefined',
    'TODO_KEYHERE',
    'TODO',
    'INSERT_KEY',
    'REPLACE_ME',
    'API_KEY',
    'GEMINI_API_KEY',
    'GEMINI_KEY'
  ];
  
  const isGeneric = placeholders.some(p => val.toLowerCase().includes(p.toLowerCase()));
  const isTooShort = val.length < 20;
  const startsWithYour = val.toLowerCase().startsWith('your_');
  const isAllStars = /^[\*]+$/.test(val);
  const hasBrackets = val.includes('<') || val.includes('>') || val.includes('{') || val.includes('}');
  
  return isGeneric || isTooShort || startsWithYour || isAllStars || hasBrackets;
};

let cachedWorkingKey = null;

const getValidKey = () => {
  if (cachedWorkingKey) return cachedWorkingKey;

  const keysToCheck = ['GEMINI_KEY', 'GEMINI_API_KEY', 'API_KEY'];
  let val = null;
  let source = null;

  for (const key of keysToCheck) {
    const k = process.env[key]?.trim();
    if (k && !isPlaceholder(k)) {
      val = k;
      source = key;
      break;
    }
  }

  if (!val) {
    console.warn(`[DEBUG] No valid API key found in ${keysToCheck.join(', ')}.`);
    throw new Error("API key is not set or contains a placeholder value.");
  }

  const originalVal = val;
  val = sanitizeKey(val);
  
  if (val !== originalVal) {
    console.log(`[DEBUG] API key sanitized. Original length: ${originalVal.length}, Sanitized length: ${val.length}`);
  }
  
  console.log(`[DEBUG] Valid API key candidate found. Source: ${source}. Preview: ${val.substring(0, 4)}...${val.substring(val.length - 4)}`);
  return { key: val, source };
};

export const analyzeImage = async (imageBase64, location, temperature, mimeType = "image/jpeg", language = "en") => {
  if (process.env.MOCK_API === 'true') {
    console.log("[DEBUG] Using Mock Data (MOCK_API is explicitly true)");
    return getDynamicMock(imageBase64);
  }

  let ai = null;
  try {
    const keyInfo = getValidKey();
    ai = new GoogleGenAI({ apiKey: keyInfo.key });
    console.log(`[DEBUG] Gemini AI Initialized successfully. Key Source: ${keyInfo.source}.`);
  } catch (e) {
    console.error(`[DEBUG] Gemini AI Initialization Error: ${e.message}`);
    console.warn("[DEBUG] Falling back to mock data due to initialization error.");
    return {
      ...getDynamicMock(imageBase64),
      isMock: true,
      message: `AI Initialization Failed: ${e.message}. Showing simulated results.`
    };
  }

  let locationContext = "";
  if (location && location.lat && location.lng) {
    locationContext = `The crop is located at latitude ${location.lat}, longitude ${location.lng}. Please consider regional climate and common local diseases in your analysis if relevant.`;
    if (temperature !== undefined && temperature !== null) {
      locationContext += ` The current temperature is ${temperature}°C.`;
    }
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
    4. Based on the location and temperature (if provided), provide a soil fertility level (Low/Medium/High) and short recommendations for improvement (fertilizers, compost, etc.) in 2-3 sentences.
    ${locationContext}
    ${langPrompt}
  `;

  try {
    const sanitizedBase64 = (imageBase64 || "").replace(/[^\x00-\x7F]/g, "");

    const callApi = async (genAi) => {
      return await genAi.models.generateContent({
        model: "gemini-2.0-flash-lite",
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
              soilFertilityLevel: { type: Type.STRING, description: "Soil fertility level based on location and temperature. MUST be one of: 'High', 'Medium', 'Low', or 'Unknown'." },
              soilFertilityRecommendations: { type: Type.STRING, description: "Short recommendations for soil improvement (fertilizers, compost, etc.) in 2-3 sentences. Empty if not a plant." },
              isClear: { type: Type.BOOLEAN, description: "True ONLY if the image clearly shows a plant, crop, leaf, fruit, or vegetable. False otherwise." }
            },
            required: ["plantType", "disease", "confidence", "remedies", "prevention", "isClear", "pestName", "pestRemedies", "soilFertilityLevel", "soilFertilityRecommendations"]
          }
        }
      });
    };

    let response;
    try {
      response = await callApi(ai);
    } catch (firstError) {
      const errStr = String(firstError);
      if (errStr.includes("API key not valid") || errStr.includes("INVALID_ARGUMENT") || errStr.includes("PERMISSION_DENIED")) {
        console.warn("[DEBUG] API Key error detected. Re-validating keys...");
        const retest = await testGeminiKey();
        if (retest.success) {
          console.log("[DEBUG] Found working key. Retrying API call...");
          const newAi = new GoogleGenAI({ apiKey: cachedWorkingKey.key });
          response = await callApi(newAi);
        } else {
          throw firstError;
        }
      } else {
        throw firstError;
      }
    }
    
    console.log("[DEBUG] Gemini API Analysis call succeeded.");
    return JSON.parse(response.text.trim());
  } catch (apiError) {
    const errorMsg = apiError.message || "";
    let isQuotaError = false;
    let errStr = "";
    
    // Check various ways the error might be structured
    try {
      errStr = typeof apiError === 'object' ? JSON.stringify(apiError) : String(apiError);
      if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429") || errStr.includes("quota exceeded") || errStr.includes("503") || errStr.includes("UNAVAILABLE")) {
        isQuotaError = true;
      }
    } catch (e) {
      errStr = errorMsg;
      if (errorMsg.toLowerCase().includes("quota") || errorMsg.includes("429") || errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE")) {
        isQuotaError = true;
      }
    }

    if (errStr.includes("API key not valid") || errStr.includes("leaked") || errStr.includes("PERMISSION_DENIED") || errorMsg.includes("API key not valid") || errorMsg.includes("leaked") || errorMsg.includes("PERMISSION_DENIED")) {
      console.error("[DEBUG] Gemini API Key Error:", apiError);
      console.warn("[DEBUG] Falling back to mock data due to invalid/leaked API key.");
      return {
        ...getDynamicMock(imageBase64),
        isMock: true,
        message: "API Key is invalid or leaked. Showing simulated results."
      };
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
    if (process.env.MOCK_API === 'true') {
      return getDynamicMock(imageBase64);
    }
    throw new Error(`AI Analysis Failed: ${apiError.message}`);
  }
};

export const chatWithAgriBot = async (context, message, location, imageBase64, mimeType = "image/jpeg", language = "en") => {
  if (process.env.MOCK_API === 'true') {
    console.log("[DEBUG] Chat Using Mock Mode (MOCK_API is explicitly true)");
    return "I am AgriBot (Mock Mode). To get real AI responses, please configure a valid Gemini API Key. In the meantime, I recommend following standard agricultural practices for your crop.";
  }

  let ai = null;
  try {
    const keyInfo = getValidKey();
    ai = new GoogleGenAI({ apiKey: keyInfo.key });
    console.log(`[DEBUG] AgriBot Chat Initialized successfully. Key Source: ${keyInfo.source}.`);
  } catch (e) {
    console.error(`[DEBUG] AgriBot Chat Initialization Error: ${e.message}`);
    return `I am AgriBot (Mock Mode). AI Initialization Failed: ${e.message}. Please configure a valid Gemini API Key.`;
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

  const makeApiCall = async (currentAi) => {
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

    const response = await currentAi.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: contents
    });
    console.log("[DEBUG] AgriBot Chat API call succeeded.");
    return response.text;
  };

  try {
    return await makeApiCall(ai);
  } catch (error) {
    const errorMsg = error.message || "";
    let isQuotaError = false;
    let errStr = "";

    try {
      errStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
      if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429") || errStr.includes("quota exceeded") || errStr.includes("503") || errStr.includes("UNAVAILABLE")) {
        isQuotaError = true;
      }
    } catch (e) {
      errStr = errorMsg;
      if (errorMsg.toLowerCase().includes("quota") || errorMsg.includes("429") || errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE")) {
        isQuotaError = true;
      }
    }

    const isKeyError = errStr.includes("API key not valid") || 
                       errStr.includes("leaked") || 
                       errStr.includes("PERMISSION_DENIED") || 
                       errStr.includes("API_KEY_INVALID") ||
                       errorMsg.includes("API key not valid") || 
                       errorMsg.includes("leaked") || 
                       errorMsg.includes("PERMISSION_DENIED");

    if (isKeyError) {
      console.warn("[DEBUG] Chat API Key Error detected. Attempting to find a working key...");
      const status = await testGeminiKey();
      if (status.isValid && status.workingKey) {
        console.log("[DEBUG] Found a working key. Retrying Chat API call...");
        const newAi = new GoogleGenAI({ apiKey: status.workingKey });
        try {
          return await makeApiCall(newAi);
        } catch (retryError) {
          console.error("[DEBUG] Chat Retry failed:", retryError.message);
        }
      }
      
      return "The Gemini API Key provided is invalid or has been reported as leaked. Please check your AI Studio Secrets and ensure you have configured a fresh API key. This usually happens when a key is accidentally committed to a public repository.";
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
  const keysToCheck = ['GEMINI_KEY', 'GEMINI_API_KEY', 'API_KEY'];
  const keyStatus = {};
  let workingKeyInfo = null;
  let lastError = null;

  for (const keyName of keysToCheck) {
    const val = process.env[keyName];
    if (val) {
      const sanitized = sanitizeKey(val);
      const placeholder = isPlaceholder(sanitized);
      
      keyStatus[keyName] = {
        exists: true,
        originalLength: val.length,
        sanitizedLength: sanitized.length,
        preview: sanitized.length > 8 ? `${sanitized.substring(0, 4)}...${sanitized.substring(sanitized.length - 4)}` : "too short",
        isPlaceholder: placeholder
      };

      if (!placeholder && !workingKeyInfo) {
        try {
          const ai = new GoogleGenAI({ apiKey: sanitized });
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: "Hello, this is a test message to verify the API key."
          });
          
          if (response && response.text) {
            workingKeyInfo = { key: sanitized, source: keyName };
            cachedWorkingKey = workingKeyInfo;
            keyStatus[keyName].isValid = true;
          }
        } catch (error) {
          console.error(`[DEBUG] Test Key Error for ${keyName}:`, error.message);
          
          // If the error is 503 (UNAVAILABLE) or 429 (RESOURCE_EXHAUSTED), the key is actually valid!
          // The API just rejected the request due to load or quota.
          const errorStr = error.message || "";
          if (errorStr.includes("503") || errorStr.includes("UNAVAILABLE") || 
              errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
            console.log(`[DEBUG] Key is valid, but service is busy/quota exceeded. Accepting key.`);
            workingKeyInfo = { key: sanitized, source: keyName };
            cachedWorkingKey = workingKeyInfo;
            keyStatus[keyName].isValid = true;
            keyStatus[keyName].warning = "Service busy or quota exceeded, but key is valid.";
          } else {
            keyStatus[keyName].isValid = false;
            keyStatus[keyName].error = error.message;
            lastError = error;
          }
        }
      }
    } else {
      keyStatus[keyName] = { exists: false };
    }
  }

  if (workingKeyInfo) {
    return {
      success: true,
      message: "API key is working correctly.",
      keySource: workingKeyInfo.source,
      keyLength: workingKeyInfo.key.length,
      keyStatus
    };
  }

  // If no key worked, try to provide a helpful error message
  let friendlyError = "No valid API key found.";
  if (lastError) {
    const errorMsg = lastError.message || "";
    let errStr = "";
    try {
      errStr = typeof lastError === 'object' ? JSON.stringify(lastError) : String(lastError);
    } catch (e) {
      errStr = errorMsg;
    }

    if (errStr.includes("PERMISSION_DENIED") || errStr.includes("leaked")) {
      friendlyError = "API Key Leaked: The provided API key has been reported as leaked and cannot be used. Please generate a new key in AI Studio.";
    } else if (errStr.includes("INVALID_API_KEY") || errStr.includes("API key not valid") || errStr.includes("INVALID_ARGUMENT")) {
      friendlyError = "Invalid API Key: The provided key is not recognized by Google Gemini API. Please ensure you have copied the full key correctly.";
    } else {
      friendlyError = errorMsg;
    }
  }

  return {
    success: false,
    error: friendlyError,
    keyStatus
  };
};
