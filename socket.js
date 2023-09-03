import io from "./app";

io.on('connection', (socket) => {
  console.log('test')
  socket.on('joinRoom', (room, userId) => {
    socket.join(room); // Join the specified room
    console.log(`User joined room: ${room}`);
    console.log(userId, room)
  });

  socket.on('getMembersTime', async(groups, userId) => {
    if(groups.length == 0){
      return 0
    }
    const connection = await (await pool).getConnection();

    const groupsInfo = await connection.query('SELECT members FROM groups WHERE group_id IN (?)', [groups]);
    groupsInfo.forEach(async (group) => {
      group.members = group.members ? JSON.parse(`[${group.members}]`) : [];
      const membersId = group.members.flat().filter((value, index) => index % 2 === 0);
      console.log('groups',group)
      const members = await connection.query(`SELECT user_id, name, subjects, timezone from users where user_id in (?)`, [membersId]);
      members.forEach((member) => {
        member.subjects = JSON.parse(member.subjects)
        console.log(member.subjects);
        const date = new Date().toLocaleDateString('en-US', { timeZone: member.timezone });
        const startTime = new Date(`${date} 00:00:00`).getTime();
        const endTime = new Date(`${date} 24:00:00`).getTime();
        
        console.log(startTime); // Unix timestamp for 0 AM
        console.log(endTime); // Unix timestamp for 12 PM
        if(member.subjects == null){
          return 0;
        }
        member.subjects.forEach((subject, index) => {
          const datum_point = member.subjects[index].datum_point;
          const filteredTimeline = subject.timeline.filter((period, index) => {
            let [start, end] = period;
            console.log(member.subjects[index], index)
            console.log(start, end, datum_point);
            start = (start + datum_point) * 1000;
            if(end == null){
              console.log('studying')
            }
            end = (end + datum_point) * 1000;
            console.log(start, end, startTime, endTime);
            return start >= startTime && end <= endTime;
          })
          console.log('filtered time', filteredTimeline)
        })
      })
    })
    //io.to(groups).emit('sendTime', userId);
    console.log('members in group',groups, userId)
  });

  socket.on('addUser', (room, userId) => {
    console.log('adduser:', room, userId)
    io.to(room).emit('addUser', room, userId);
  });

  socket.on('removeUser', (room, userId) => {
    io.to(room).emit('removeUser', room, userId)
  })

  socket.on('send-signal', () => {
    io.emit('start')
    console.log('test')
  })

  socket.on('test', () => {
    console.log('test')
  })
})

export {io};