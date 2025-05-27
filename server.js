const express = require('express');
const proxy = require('express-http-proxy');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Проксирование запросов к API
app.use(
  '/api',
  proxy('http://www.djemsolutions.com:12010', {
    proxyReqPathResolver: (req) => {
      return '/api' + req.url;
    },
    proxyErrorHandler: (err, res, next) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    },
  })
);

// Сервер статических файлов
app.use(express.static(path.join(__dirname, 'build')));

// Обработка всех остальных запросов, чтобы React Router мог работать
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
