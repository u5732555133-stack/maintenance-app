// Proxy Vercel pour communiquer avec le backend RPI
// Contourne les restrictions Private Network Access du navigateur

const https = require('https');
const { URL } = require('url');

const RPI_API_URL = 'https://rpi011.taild92b43.ts.net/api';

// Helper pour lire le body de la requête
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk.toString();
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Gestion CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extraire le chemin de l'API depuis l'URL
    // Ex: /api/auth/login -> /auth/login
    const path = req.url.replace(/^\/api/, '');
    const targetUrl = `${RPI_API_URL}${path}`;

    console.log(`[Proxy] ${req.method} ${targetUrl}`);

    // Lire le body pour POST/PUT
    let bodyData = '';
    if (req.method === 'POST' || req.method === 'PUT') {
      bodyData = await getRawBody(req);
      console.log('[Proxy] Request body:', bodyData);
    }

    // Faire la requête HTTPS vers le RPI
    const result = await new Promise((resolve, reject) => {
      const url = new URL(targetUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
        // Important pour Tailscale
        rejectUnauthorized: false
      };

      // Ajouter Content-Length si on a un body
      if (bodyData) {
        options.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      // Copier l'en-tête Authorization s'il existe
      if (req.headers.authorization) {
        options.headers['Authorization'] = req.headers.authorization;
      }

      const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          console.log('[Proxy] Response status:', response.statusCode);
          console.log('[Proxy] Response data:', data);

          try {
            const jsonData = JSON.parse(data);
            resolve({ status: response.statusCode, data: jsonData });
          } catch (e) {
            console.log('[Proxy] Non-JSON response:', data);
            resolve({
              status: response.statusCode,
              data: { error: 'Réponse non-JSON du serveur', details: data }
            });
          }
        });
      });

      request.on('error', (error) => {
        console.error('[Proxy] Request error:', error);
        reject(error);
      });

      // Timeout de 8 secondes (Vercel timeout est 10s)
      request.setTimeout(8000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      // Envoyer le body pour POST/PUT
      if (bodyData) {
        request.write(bodyData);
      }

      request.end();
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('[Proxy] Erreur complète:', error);
    console.error('[Proxy] Stack:', error.stack);
    return res.status(500).json({
      error: 'Erreur de communication avec le serveur',
      details: error.message,
      stack: error.stack
    });
  }
};
