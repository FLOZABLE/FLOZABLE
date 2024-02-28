import React, { useEffect, useState } from "react";
import { socket } from "../../../socket";

function ThemeUsageCounter({ initialVal, themeId }) {
  const [count, setCount] = useState([]);

  useEffect(() => {
    if (!themeId) return;
    const onUsed = () => {
      setCount((prev) => prev + 1);
    };

    /* const onRemoveMember = (userId) => {
      //const newMembers = members
      setCount(prev => {return prev.filter((memberId) => {return memberId !== userId})});
    }; */

    socket.on(`used:${themeId}`, onUsed);
    //socket.on(`removeMember:${groupId}`, onRemoveMember);
    return () => {
      socket.off(`used:${themeId}`, onUsed);
      //socket.off(`removeMember:${groupId}`, onRemoveMember);
    };
  }, [themeId]);

  useEffect(() => {
    setCount(initialVal);
  }, [initialVal]);

  return <p>{count}</p>;
}

export default ThemeUsageCounter;
