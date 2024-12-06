self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification cliquée :', event);

  const data = event.notification.data;
  console.log('Données transmises dans le service worker :', data);

  if (!data || !data.reminderId) {
    console.error('Les données de la notification sont manquantes ou invalides.');
    return;
  }

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const message = {
        type: 'NOTIFICATION_CLICK',
        data: {
          notification: {
            body: event.notification.body,
            data: {
              reminderId: data.reminderId,
              action: data.action,
            },
            title: event.notification.title,
          },
        },
      };

      if (clientList.length > 0) {
        clientList[0].postMessage(message);
        return clientList[0].focus();
      }

      return clients.openWindow('/home-content?reminderId=' + data.reminderId);
    })
  );
});
