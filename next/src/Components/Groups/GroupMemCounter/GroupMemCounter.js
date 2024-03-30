import { socket } from "@/utils/socket";
import React, { useEffect, useState } from "react";

function GroupMemCounter({ initialMembers, groupId }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    const onNewMember = (userId) => {
      setMembers(prev => [...prev, userId]);
    };

    const onRemoveMember = (userId) => {
      console.log("removing", userId);
      //const newMembers = members
      setMembers(prev => {return prev.filter((memberId) => {return memberId !== userId})});
    };

    socket.on(`newMember:${groupId}`, onNewMember);
    socket.on(`removeMember:${groupId}`, onRemoveMember);
    console.log(`removeMember:${groupId}`);
    return () => {
      socket.off(`newMember:${groupId}`, onNewMember);
      socket.off(`removeMember:${groupId}`, onRemoveMember);
    };
  }, [groupId]);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  return (
    <p>{members.length}</p>
  );
};

export default GroupMemCounter;