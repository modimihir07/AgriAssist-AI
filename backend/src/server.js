import app from './app.js';
import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AgriAssist AI Backend & Project Hub running on http://localhost:${PORT}`);
    
    // Log environment status for debugging
    const keysToCheck = ['GEMINI_KEY', 'GEMINI_API_KEY', 'API_KEY', 'MOCK_API', 'NODE_ENV'];
    console.log('--- Environment Status ---');
    keysToCheck.forEach(key => {
      const value = process.env[key];
      if (value) {
        if (key.includes('KEY')) {
          console.log(`${key}: Present (length: ${value.length}, preview: ${value.substring(0, 4)}...${value.substring(value.length - 4)})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      } else {
        console.log(`${key}: Not set`);
      }
    });
    console.log('--------------------------');
  });
}

startServer();
