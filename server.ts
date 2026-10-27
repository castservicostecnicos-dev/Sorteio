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

// Serve static assets from built Vite dist folder with proper Cache-Control
app.use(
  express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Never cache index.html, sw.js, or manifest so new deploys are loaded immediately
      if (
        filePath.endsWith('index.html') ||
        filePath.endsWith('sw.js') ||
        filePath.endsWith('registerSW.js') ||
        filePath.endsWith('manifest.webmanifest')
      ) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (filePath.includes('/assets/')) {
        // Hashed assets can be safely cached
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Fallback all routes to index.html for Single Page Application with no-cache headers
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`FutSociety Pro server running on port ${PORT}`);
});
