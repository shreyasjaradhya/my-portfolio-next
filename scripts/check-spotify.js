const https = require('https');
const fs = require('fs');
const path = require('path');

https.get('https://open.spotify.com/embed/track/7uoFMmxln0GPXQ0AcCBXRq', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const scriptMatch = data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      console.error('No script found');
      return;
    }
    const json = JSON.parse(scriptMatch[1]);
    const entity = json.props.pageProps.state.data.entity;
    console.log('Title:', entity.name);
    console.log('Artist:', entity.artists.map(a => a.name).join(', '));
    const audioUrl = entity.audioPreview?.url;
    console.log('Audio URL:', audioUrl);

    if (audioUrl) {
      const audioDir = path.join(__dirname, '..', 'public', 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const dest = path.join(audioDir, 'snowman.mp3');
      const file = fs.createWriteStream(dest);
      https.get(audioUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(dest);
          console.log(`Saved ${dest} (${stats.size} bytes) successfully!`);
        });
      });
    }
  });
});
