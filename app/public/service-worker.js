console.log('service worker')

self.addEventListener('push', event => {
  console.log('event', event)
  const notificationData = event.data.json();
  console.log(notificationData)

  const notificationOptions = {
    title: notificationData.title,
    body: notificationData.body,
    icon: notificationData.icon,
    actions: [
      { action: 'viewplan', title: 'View plan' },
      { action: 'close', title: 'Close' }
    ],
    data: notificationData.data
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

self.addEventListener('notificationclick', function(event) {
  const notificationData = event.notification.data;
  const action = event.action;

  if (action === "viewplan") {
    event.waitUntil(
      clients.openWindow(notificationData.link)
    );
  }
  event.notification.close();
});