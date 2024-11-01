import { socket } from "@/app/utils/socket";
import { useEffect } from "react";

export default function SocketCounter({ id, events, members, setMembers }) {
  useEffect(() => {
    if (!id || !events) return;

    const onAdd = ({ userId }) => {
      setMembers((prev) => [...prev, userId]);
    };

    const onRemove = ({ userId }) => {
      setMembers((prev) => {
        return prev.filter((memberId) => {
          return memberId !== userId;
        });
      });
    };

    socket.on(`${events.add}:${id}`, onAdd);
    socket.on(`${events.remove}:${id}`, onRemove);
    return () => {
      socket.off(`${events.add}:${id}`, onAdd);
      socket.off(`${events.remove}:${id}`, onRemove);
    };
  }, [id, events]);

  return members.length;
}
