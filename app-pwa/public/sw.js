self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            title: data.title,
            body: data.body,
            tag: 'giesbert',
            renotify: true,
            icon: data.icon || '/icon-192x192.png',
            badge: '/badge-96x96.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
            },
        };
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('https://giesbert.das-habitat.de'));
});
