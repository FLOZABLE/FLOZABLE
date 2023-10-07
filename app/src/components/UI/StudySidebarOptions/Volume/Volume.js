import React from "react";
import styles from "./Volume.module.css";
import { useDrag } from 'react-dnd';

function Volume(props) {
  const {id, index, text, moveItem} = props;

  const [, drag] = useDrag({
    type: 'ITEM',
    item: { id, index },
  });

  return (
    <div ref={drag} style={{ border: '1px solid black', padding: '8px', marginBottom: '8px' }}>
      {text}
    </div>
  );
};

export default Volume;