import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableBox from './DraggableBox';

const DraggableContainer = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ position: 'relative', width: '50rem', height: '37.5rem', border: '0.0625rem solid black' }}>
        <DraggableBox x={100} y={100}>
          Drag Me!
        </DraggableBox>
      </div>
    </DndProvider>
  );
};

export default DraggableContainer;
