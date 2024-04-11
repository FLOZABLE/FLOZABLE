const worker = new Worker('/subjectTimerWorker.js', {type: 'module'});

export default worker;