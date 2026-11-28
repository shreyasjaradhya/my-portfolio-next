const http = require('http');
const https = require('https');

http.get('http://localhost:3000', (res) => {
  let html = '';
  res.on('data', (c) => (html += c));
  res.on('end', async () => {
    const rawMatches = html.match(/src="([^"]+)"/g) || [];
    const imagePaths = [...new Set(rawMatches.map(s => s.replace(/src="|"/g, '').replace(/&amp;/g, '&')))]
      .filter(p => p.includes('/images/') || p.includes('/_next/image') || p.includes('supabase.co'));

    console.log(`Checking ${imagePaths.length} image paths...`);

    for (const p of imagePaths) {
      if (p.startsWith('http')) {
        https.get(p, r => {
          console.log(`[${r.statusCode}] External: ${p.substring(0, 80)}...`);
        }).on('error', e => console.error(`[ERR] External: ${p}`, e.message));
      } else {
        http.get(`http://localhost:3000${p}`, r => {
          console.log(`[${r.statusCode}] Local: ${p.substring(0, 80)}...`);
        }).on('error', e => console.error(`[ERR] Local: ${p}`, e.message));
      }
    }
  });
});
