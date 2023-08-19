import React, { useState } from 'react';
import { useDrag } from 'react-dnd';

const DraggableBox = ({ initialX, initialY, children }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'BOX',
    item: { x: initialX, y: initialY },
  });

  const [position, setPosition] = useState({ x: initialX, y: initialY });

  const handleDrop = () => {
    // Handle drop event if needed
  };

  return (
    <div
      ref={(node) => {
        dragRef(node);
        handleDrop(); // Handle drop event here
      }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '100px',
        height: '100px',
        backgroundColor: isDragging ? 'lightgray' : 'lightblue',
      }}
    >
      {children}
    </div>
  );
};

export default DraggableBox;

