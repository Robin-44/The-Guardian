self.addEventListener('install', (event) => {
  console.log('Service worker installé : nouvelle version activée.');
  self.skipWaiting(); 
});

self.addEventListener('push', function (event) {
  console.log('Notification reçue dans le service worker :', event);

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.notification.body || 'Contenu non défini',
    icon: data.notification.icon || '/assets/icons/favicon.png',
    actions: data.notification.actions || [],
    data: data.notification.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.notification.title || 'Titre non défini', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification cliquée :', event);

  const reminderId = event.notification.data?.reminderId;
  console.log('Reminder ID extrait :', reminderId);

  let targetURL = '/calendar'; // URL par défaut
  if (reminderId) {
    targetURL = `/home-content?reminderId=${reminderId}`;
  }
  console.log('Redirection vers URL :', targetURL);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log('Clients trouvés :', clientList);
      for (const client of clientList) {
        console.log('Vérification du client :', client.url);
        if (client.url.includes(targetURL) && 'focus' in client) {
          console.log('Focalisation sur le client existant.');
          return client.focus();
        }
      }
      console.log('Aucun client correspondant trouvé, ouverture d\'une nouvelle fenêtre.');
      return clients.openWindow(targetURL);
    }).catch((err) => {
      console.error('Erreur lors de la redirection :', err);
    })
  );

  event.notification.close();
});
