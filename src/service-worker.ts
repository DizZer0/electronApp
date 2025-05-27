/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkOnly, NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();
// clientsClaim заставляет новый активный сервис-воркер сразу же захватить все доступные клиенты (открытые вкладки ).

const manifest = self.__WB_MANIFEST.filter(entry => {
  if (typeof entry === 'string') {
    return !entry.startsWith('capacitor-electron:');
  } else {
    return !entry.url.startsWith('capacitor-electron:');
  }
});

precacheAndRoute(manifest);
// self.__WB_MANIFEST — это манифест, который содержит список URL-адресов ресурсов, которые должны быть предварительно кэшированы. Этот манифест обычно генерируется автоматически в процессе сборки вашего приложения (например, с помощью инструментов, таких как Workbox или Create React App
// precacheAndRoute() — выполняет две основные задачи:
// 1. Предварительное кэширование (Precaching): Функция кэширует все ресурсы, перечисленные в манифесте, во время установки сервис-воркера. Это означает, что эти ресурсы будут доступны офлайн.
// 2. Маршрутизация (Routing): Функция настраивает маршрутизацию таким образом, чтобы запросы к этим ресурсам обслуживались из кэша, если они доступны. Если ресурс не найден в кэше, он может быть загружен с сервера.
// https://cra.link/PWA
// https://developers.google.com/web/fundamentals/architecture/app-shell

// В этом примере, если POST-запрос на /posts проваливается из-за отсутствия интернета, он будет добавлен в очередь postsQueue и будет пытаться повторно отправиться в течение 24 часов. Если запрос не будет успешно отправлен в течение этого времени, он будет удален из очереди.
const bgSyncPlugin = new BackgroundSyncPlugin('myQueueName', {
  maxRetentionTime: 24 * 60, // Попытка выполнения повторного запроса будет выполнена в течение 24 часов (в минутах)
});
// Регистрация маршрута для кэширования данных с учетом пагинации
// registerRoute(
//   ({ url }) => {
//     // Проверяем, что URL соответствует базовому URL и содержит параметры пагинации
//     return url.origin === 'http://localhost:3000' && url.pathname === '/api/v1/Dictionaries/all';
//   },
//   new StaleWhileRevalidate({
//     cacheName: 'paginated-data',
//     plugins: [
//       new CacheableResponsePlugin({
//         statuses: [0, 200],
//       }),
//       new ExpirationPlugin({
//         maxEntries: 50, // Максимальное количество записей в кэше
//         maxAgeSeconds: 60 * 60 * 24, // Срок хранения кэша в секундах (24 часа)
//       }),
//     ],
//   })
// );

// Регистрируем маршрут для обработки POST-запросов на /posts
registerRoute(
  ({ url }) => url.pathname === '/posts',
  new NetworkOnly({
    plugins: [bgSyncPlugin], // Используем плагин для фоновой синхронизации
  }),
  'POST' // Обрабатываем только POST-запросы
);

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Возвращает значение false, чтобы игнорировать запросы от выполнения с помощью index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== 'navigate') {
      return false;
    }

    // Если это не навигация, игнорируем.
    // Это может быть использовано для исключения определенных путей, например, для служебных маршрутов.
    if (url.pathname.startsWith('/_')) {
      return false;
    }

    // Если это похоже на URL-адрес ресурса, поскольку он содержит
    // расширение файла, игнорируем.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Возвращает true, чтобы сигнализировать о том, что мы хотим использовать обработчик.
    return true;
  },
  // Обработчик, который будет возвращать содержимое index.html для всех запросов, которые не были пропущены предыдущими условиями.
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Пример маршрута кэширования во время выполнения для запросов, которые не обрабатываются предварительным кэшированием
registerRoute(
  // Проверяем, что URL имеет тот же домен и заканчивается на .png
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  // Эта стратегия сначала возвращает данные из кеша (если они есть), а затем обновляет кеш, запрашивая данные с сервера. Таким образом, пользователь получает данные быстро, но кеш постепенно обновляется.
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // Это плагин, который управляет временем жизни записей в кеше. В данном случае он ограничивает количество записей в кеше до 50, удаляя старые записи, когда лимит достигнут
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);
// Кешируем иконки .ico и .png с использованием стратегии CacheFirst
registerRoute(
  ({ url }) => url.origin === self.location.origin && (url.pathname.endsWith('.ico') || url.pathname.endsWith('.png')),
  // Стратегия кеширования, которая сначала пытается обслужить запрос из кеша, и только если данные в кеше отсутствуют, делает запрос на сервер
  new CacheFirst({
    cacheName: 'icons',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);
// // Регистрируем маршрут для кеширования данных с конкретного API-эндпоинта
registerRoute(
  // Проверяем, что URL соответствует API-эндпоинту для получения списка пользователей
  ({ url }) => url.origin === 'https://jsonplaceholder.typicode.com' && url.pathname === '/users',
  // Используем стратегию StaleWhileRevalidate для обслуживания запросов из кеша и обновления данных из сети
  new StaleWhileRevalidate({
    cacheName: 'users-list',
    plugins: [
      // Ограничиваем количество кешированных записей до 1, удаляя старые при необходимости
      new ExpirationPlugin({ maxEntries: 1 }),
    ],
  })
);
// Исключаем файлы CSS из кеширования
registerRoute(
  // Проверяем, что URL имеет тот же домен и заканчивается на .css
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.css'),
  // Используем стратегию NetworkOnly для загрузки файлов CSS только из сети и никогда не кеширования
  new NetworkOnly()
);

registerRoute(
 ({url}) => {
  console.log(url)
  return url.pathname.startsWith("/api/")
 },
  new NetworkFirst({
    cacheName: 'names-chache',
    networkTimeoutSeconds: 3, // Таймаут 3 секунды
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60 // 24 часа
      })
    ]
  })
);


// skipWaiting заставляет новый сервис-воркер пропустить состояние ожидания и сразу же стать активным.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});