self.addEventListener('push', function (event) {
  console.log('Notification reçue dans le service worker :', event);

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.notification.body || 'Contenu non défini',
    icon: data.notification.icon || '/assets/icons/icon-192x192.png',
    actions: data.notification.actions || [],
    data: data.notification.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.notification.title || 'Titre non défini', options)
  );
});

// Gestion des clics sur la notification
self.addEventListener('notificationclick', function (event) {
  console.log('Notification cliquée :', event);
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (data.onActionClick) {
    const actionData = data.onActionClick[action] || data.onActionClick.default;
    if (actionData.operation === 'openWindow') {
      event.waitUntil(clients.openWindow(actionData.url));
    } else if (actionData.operation === 'focusLastFocusedOrOpen') {
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(actionData.url) && 'focus' in client) {
              return client.focus();
            }
          }
          return clients.openWindow(actionData.url);
        })
      );
    }
  }
});
