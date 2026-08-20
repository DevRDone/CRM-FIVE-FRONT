const https = require('https');

https.get('https://fiveforms.netlify.app/', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Find the main JS file
    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (jsMatch) {
      const jsUrl = 'https://fiveforms.netlify.app' + jsMatch[1];
      console.log('Found JS file:', jsUrl);
      
      https.get(jsUrl, (jsRes) => {
        let jsContent = '';
        jsRes.on('data', chunk => jsContent += chunk);
        jsRes.on('end', () => {
          // Look for API URL
          const apiMatch = jsContent.match(/baseURL:"([^"]+)"/);
          if (apiMatch) {
            console.log('Found API URL in JS bundle:', apiMatch[1]);
          } else {
            console.log('API URL not found explicitly. Checking for localhost...');
            if (jsContent.includes('http://localhost:5000')) {
              console.log('Found localhost:5000 in JS bundle!');
            }
          }
        });
      });
    } else {
      console.log('Could not find JS bundle.');
    }
  });
}).on('error', err => console.error(err));
