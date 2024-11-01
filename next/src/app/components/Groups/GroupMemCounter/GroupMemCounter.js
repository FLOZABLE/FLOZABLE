import { socket } from "@/app/utils/socket";
import React, { useEffect, useState } from "react";

function GroupMemCounter({ initialMembers, groupId }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    const onNewMember = ({ userId }) => {
      setMembers((prev) => [...prev, userId]);
    };

    const onRemoveMember = ({ userId }) => {
      //const newMember = members
      setMembers((prev) => {
        return prev.filter((memberId) => {
          return memberId !== userId;
        });
      });
    };

    socket.on(`joined:${groupId}`, onNewMember);
    socket.on(`removeMember:${groupId}`, onRemoveMember);
    return () => {
      socket.off(`joined:${groupId}`, onNewMember);
      socket.off(`removeMember:${groupId}`, onRemoveMember);
    };
  }, [groupId]);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  return <p>{members.length}</p>;
}

export default GroupMemCounter;
