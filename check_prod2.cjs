const https = require('https');

https.get('https://fiveforms.netlify.app/assets/index-7y2Vi0vI.js', (res) => {
  let jsContent = '';
  res.on('data', chunk => jsContent += chunk);
  res.on('end', () => {
    const idx = jsContent.indexOf('baseURL');
    if (idx !== -1) {
      console.log('Context around baseURL:');
      console.log(jsContent.substring(idx - 20, idx + 80));
    } else {
      console.log('baseURL not found');
    }
  });
});
