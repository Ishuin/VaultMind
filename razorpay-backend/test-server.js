const express = require('express');
const app = express();
const PORT = 3005; // Using a different port just in case

app.get('/', (req, res) => {
  res.send('Minimal Express server is running!');
});

app.listen(PORT, () => {
  console.log(`Minimal server listening on port ${PORT}`);
  console.log('Press Ctrl+C to stop.');
});

// Keep the process alive for a very long time if listen doesn't
// This is a HACK and not for production, just for testing if listen is the issue
// setInterval(() => {
//   console.log('Minimal server still alive...');
// }, 60000);
