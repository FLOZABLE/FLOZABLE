const {generateRandomId, hashing} = require('../tool');
/**create bots */
function createBots(number) {
  const connection = pool.promise();
  let timeZones = [
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Africa/Cairo',
    'Asia/Dubai',
    'America/Sao_Paulo',
    'Europe/Moscow',
    'Asia/Seoul',
    'Asia/Kolkata',
    'Pacific/Auckland'
  ]

  for (let i = 0; i < length; i++) {
    const name = `tester${i}`;
    const email = `tester${i}@t.t`;
    const password = '0';
    let hashed = hashing(password);

    const userId = generateId();
    const keySalt = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');
    const timeZone = timeZones[Math.floor(Math.random() * 11)];

    let userDateTime = DateTime.now().setZone(timeZone);
    //randomize date
    const subtractedDate = Math.floor(Math.random() * 100)
    userDateTime = userDateTime.minus({ days: subtractedDate });
    const twelveAmDateTime = userDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const unixTimestamp = Math.floor(twelveAmDateTime.toMillis() / 1000);
    const userInfo = {
      name: name,
      email: email,
      hashed_password: hashed[1],
      salt: hashed[0],
      user_id: userId,
      timezone: timeZone,
      datum_point: unixTimestamp,
      key_salt: keySalt,
      iv: iv,
      notification_setting: 'default_setting',
      study: JSON.stringify({ study: false, point: unixTimestamp, total: 0 })
    }
    connection.query('INSERT INTO users SET?', userInfo);
  };
  pool.releaseConnection(connection);
}