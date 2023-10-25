const {io} = require('./socket');

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
const peers = io.of('/mediasocket')

peers.on('connection', socket => {
  let session;
  if (process.env.NODE_ENV === "production") {
    try {
      session = peers.request.session;
    } catch (err) {
      console.log(err);
    };
  } else {
    session = {
      cookie: {
        path: '/',
        _expires: null,
        originalMaxAge: null,
        httpOnly: true,
        secure: false
      },
      user_id: 'EoFObpf612bdJKt',
      name: 't1',
      loggedin: true,
      userInfo: {
        userId: 'EoFObpf612bdJKt',
        name: 't1',
        loggedin: true,
        email: 't1@t.t',
        myinfo: null,
        timeZone: 'America/Los_Angeles'
      }
    };
  };
/*   console.log('peer connected');
  const userId =  */
})