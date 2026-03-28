import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import diseaseRoutes from './routes/diseaseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

const app = express();

// Trust the first proxy to resolve rate limiting issues behind reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// Rate limiting - apply ONLY to API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  validate: { xForwardedForHeader: false }
});
app.use('/api', limiter);

// Routes
app.use('/api/disease', diseaseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/weather', weatherRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API Status check
app.get('/api/status', (req, res) => {
  const hasKey = !!(
    process.env.GEMINI_API_KEY || 
    process.env.API_KEY || 
    process.env.GOOGLE_API_KEY || 
    process.env.GEMINI_KEY ||
    process.env.AI_STUDIO_KEY ||
    process.env.AGRIASSIST_KEY
  );
  const isMock = process.env.MOCK_API === 'true';
  res.json({ 
    liveMode: hasKey && !isMock,
    hasKey,
    isMock
  });
});

// Debug endpoint
app.get('/debug/env', (req, res) => {
  const keysToCheck = [
    'GEMINI_API_KEY', 
    'API_KEY', 
    'GOOGLE_API_KEY', 
    'GEMINI_KEY', 
    'AI_STUDIO_KEY', 
    'AGRIASSIST_KEY',
    'MOCK_API',
    'NODE_ENV'
  ];
  
  const envStatus = {};
  keysToCheck.forEach(key => {
    const value = process.env[key];
    if (value) {
      if (key.includes('KEY')) {
        envStatus[key] = {
          exists: true,
          length: value.length,
          preview: `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        };
      } else {
        envStatus[key] = {
          exists: true,
          value: value
        };
      }
    } else {
      envStatus[key] = { exists: false };
    }
  });
  
  res.json({
    timestamp: new Date().toISOString(),
    env: envStatus
  });
});

export default app;
