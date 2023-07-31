self.addEventListener('push', event => {
  console.log(event)
  const options = {
    body: 'This is a push notification.',
  };

  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});