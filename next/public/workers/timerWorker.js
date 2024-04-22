/* self.addEventListener('message', (e) => {
  let message = e.data;
  let timer = message.timer;
  let type = message.type;
  let group = message.group;
  if(message.command === 'startTimer') {
    let intervalId = setInterval(() => {
      self.postMessage({command:'start', timer: timer, intervalId: intervalId, type: type, group: group})
    }, 1000)
  } else if (message.command === 'stopTimer') {
    let intervalId = message.intervalId;
    clearInterval(intervalId);
    //self.postMessage({command:'stop', timer: timer})
  }
}) */
setInterval(() => {
  self.postMessage({command: 'update-timer'});
}, 1000);