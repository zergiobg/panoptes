self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        
        const title = data.title || 'Nueva Alerta de Panoptes';
        const options = {
            body: data.body || 'Alguien ha reportado algo cerca.',
            icon: data.icon || '/panoptes_logo.png',
            badge: '/panoptes_logo.png',
            data: data.data || { url: '/' },
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            requireInteraction: true
        };

        event.waitUntil(self.registration.showNotification(title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If so, just focus it.
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
