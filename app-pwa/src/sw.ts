import { clientsClaim } from 'workbox-core';
import { NetworkOnly } from 'workbox-strategies';
import { setCatchHandler, setDefaultHandler } from 'workbox-routing';
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  matchPrecache,
} from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Precaching & routing
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Lifecycle
self.skipWaiting();
clientsClaim();

// Network-only for everything not precached
setDefaultHandler(new NetworkOnly());

// Offline fallback to app-shell
setCatchHandler(async ({ event }): Promise<Response> => {
  switch ((event as FetchEvent).request.destination) {
    case 'document': {
      const cachedResponse = await matchPrecache('/index.html');
      return cachedResponse ?? Response.error();
    }
    default:
      return Response.error();
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const { title, body, icon } = event.data.json();
  const options = {
    body,
    tag: 'giesbert',
    renotify: true,
    icon: icon ?? '/icon-192x192.png',
    badge: '/badge-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
    },
  } as NotificationOptions;
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(import.meta.env.VITE_SITE_ADDRESS));
});
