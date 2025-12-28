import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle all routes - serve index.html for SPA routing
app.get('*', (req, res) => {
  // Don't serve index.html for API routes or static assets
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return res.status(404).send('Not found');
  }
  
  // Serve index.html for all other routes (SPA routing)
  const indexPath = join(__dirname, 'dist', 'index.html');
  try {
    const html = readFileSync(indexPath, 'utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).send('Error loading application');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

