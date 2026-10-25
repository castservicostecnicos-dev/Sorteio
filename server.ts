import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.resolve(__dirname, 'dist');

// Health check endpoint for Render.com
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from built Vite dist folder
app.use(express.static(distPath));

// Fallback all routes to index.html for Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`FutSociety Pro server running on port ${PORT}`);
});
