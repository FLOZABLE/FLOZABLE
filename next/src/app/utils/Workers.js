const membersTimerWorker = new Worker('/timerWorker.js');

const subjectsTimerWorker = new Worker('/subjectTimerWorker.js');

export {
  membersTimerWorker,
  subjectsTimerWorker
};