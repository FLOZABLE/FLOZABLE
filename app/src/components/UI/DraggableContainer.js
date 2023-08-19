import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableBox from './DraggableBox';

const DraggableContainer = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ position: 'relative', width: '800px', height: '600px', border: '1px solid black' }}>
        <DraggableBox x={100} y={100}>
          Drag Me!
        </DraggableBox>
      </div>
    </DndProvider>
  );
};

export default DraggableContainer;
