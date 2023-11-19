import React from "react";
import { useDrag } from "react-dnd";

function Volume({ id, index, text }) {
  const [, drag] = useDrag({
    type: "ITEM",
    item: { id, index },
  });

  return (
    <div
      ref={drag}
      style={{ border: "1px solid black", padding: "8px", marginBottom: "8px" }}
    >
      {text}
    </div>
  );
}

export default Volume;
