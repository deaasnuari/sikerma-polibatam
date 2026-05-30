const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/dokumen-kerjasama?per_page=500',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer 22|N0mJz5s3kU2sW5p3FmS2eM1nS1zY7oG1dD8lJ9eK', // Just putting a random token might fail, wait, let me just fetch directly or use curl
  }
};
