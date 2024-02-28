import React, { useEffect, useMemo, useState } from "react";
import { socket } from "../../../socket";

function GroupLikesCounter({ initialMembers, groupId }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    const onLiked = (userId) => {
      setMembers(prev => [...prev, userId]);
    };

    const onUnliked = (userId) => {
      setMembers(prev => {return prev.filter((memberId) => {return memberId !== userId})});
    };

    socket.on(`liked:${groupId}`, onLiked);
    socket.on(`unliked:${groupId}`, onUnliked);
    return () => {
      socket.off(`liked:${groupId}`, onLiked);
      socket.off(`unliked:${groupId}`, onUnliked);
    };
  }, [groupId]);

  useMemo(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  return (
    <p>{members.length}</p>
  );
};

export default GroupLikesCounter;