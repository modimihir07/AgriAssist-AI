/**
 * Local development server for AgriAssist AI
 * - Serves the API routes via Express
 * - Runs Vite dev middleware for frontend hot-reload (dev mode)
 * - Serves static frontend build (production mode)
 */

import app from './api/app.js';
import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

dotenv.config();

const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  // Vite middleware for development (hot reload)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend build in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // Fallback to index.html for SPA routing (except API routes)
    app.get('*', (req, res) => {
      // API routes are already handled by the Express app
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ AgriAssist AI Server running on http://localhost:${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api\n`);

    // Log environment status for debugging
    const keysToCheck = ['GEMINI_API_KEY', 'MOCK_API', 'NODE_ENV', 'FIREBASE_PROJECT_ID'];
    console.log('--- Environment Status ---');
    keysToCheck.forEach(key => {
      const value = process.env[key];
      if (value) {
        if (key.includes('KEY')) {
          const preview = value.substring(0, 4) + '...' + value.substring(Math.max(0, value.length - 4));
          console.log(`✓ ${key}: Present (preview: ${preview})`);
        } else {
          console.log(`✓ ${key}: ${value}`);
        }
      } else {
        console.log(`✗ ${key}: Not set`);
      }
    });
    console.log('--------------------------\n');
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
