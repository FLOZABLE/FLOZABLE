let intervalId;

self.addEventListener('message', (e) => {
  let message = e.data;
  if(message.command === 'startSubjectTimer') {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.postMessage({command:'updateSubjectTimer'});
    }, 1000);
  } else if (message.command === 'stopSubjectTimer') {
    clearInterval(intervalId);
  }
});