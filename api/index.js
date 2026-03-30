// Vercel Serverless Function entry point
// This wraps the Express app using serverless-http for Vercel's runtime
import serverless from 'serverless-http';
import app from './app.js';

// Export the serverless-wrapped Express app
export default serverless(app);
