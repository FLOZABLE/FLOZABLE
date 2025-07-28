self.addEventListener('push', event => {
  const notificationData = event.data.json();

  const notificationOptions = {
    title: notificationData.title,
    body: notificationData.body,
    icon: 'path/to/icon.png',
    image: notificationData.image, // Assuming image is included in the push data
    actions: [
      { action: 'reply', title: 'Reply' },
      { action: 'archive', title: 'Archive' }
    ],
    data: {
      // Add any additional data you want to pass with the notification
      link: notificationData.link,
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});


self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification.data;
  console.log(data)
  if (data.link) {
    event.waitUntil(clients.openWindow(data.link));
  }
  notification.close();
});