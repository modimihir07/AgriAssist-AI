import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  // Ensure lat and lon are numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Latitude and longitude must be valid numbers' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY?.trim().replace(/^["']|["']$/g, '');

  if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY' || apiKey === '') {
    console.warn('OPENWEATHER_API_KEY is not set or is a placeholder. Returning unavailable status.');
    
    return res.json({ 
      temperature: null,
      available: false,
      isMock: true,
      message: 'Weather service currently unavailable (No API Key)'
    });
  }

  const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  const maskedUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${maskedKey}&units=metric`;

  console.log(`Calling Weather API: ${maskedUrl}`);

  try {
    const response = await axios.get(weatherUrl);
    
    if (response.data.cod !== 200) {
      console.error(`Weather API Error Response (cod: ${response.data.cod}):`, response.data.message);
      return res.json({ 
        temperature: null,
        available: false,
        message: response.data.message || 'Weather data unavailable'
      });
    }

    let temperature = response.data.main.temp;
    
    // Check for extreme values (potential Kelvin fallback)
    // If units=metric is working, temp should be between -60 and 60 for most inhabited places.
    // If it's around 273+, it's likely Kelvin.
    if (temperature > 100) {
      console.warn(`Unexpectedly high temperature (${temperature}°C). Converting from Kelvin?`);
      temperature = temperature - 273.15;
    }

    // Round to nearest integer
    const roundedTemp = Math.round(temperature);
    
    console.log(`Weather API Success: ${roundedTemp}°C for ${response.data.name || 'Unknown Location'}`);
    
    res.json({ 
      temperature: roundedTemp, 
      available: true,
      locationName: response.data.name
    });
  } catch (error) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    
    console.error(`Weather API Error (${status || 'Unknown'}):`, errorMessage);
    
    if (status === 401) {
      console.warn('Invalid API key or key not yet active. Showing placeholder.');
      return res.json({ 
        temperature: null,
        available: false,
        isMock: true,
        message: 'Weather service activation pending or invalid key'
      });
    }

    if (status === 404) {
      console.warn('Location not found or remote area. Showing unavailable.');
      return res.json({ 
        temperature: null,
        available: false,
        message: 'Temperature unavailable for this location'
      });
    }
    
    // Return 200 with available: false as requested
    return res.json({ 
      temperature: null,
      available: false,
      isMock: true,
      message: 'Weather service currently unavailable'
    });
  }
});

export default router;
