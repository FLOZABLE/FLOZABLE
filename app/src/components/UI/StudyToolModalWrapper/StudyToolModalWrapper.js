import { useDrag } from "react-dnd";
const style = {
  position: "absolute",
  border: "0.0625rem dashed gray",
  backgroundColor: "white",
  padding: "0.5rem 1rem",
  cursor: "move",
};

function StudyToolModalWrapper({ id, left, top, hideSourceOnDrag, children }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "box",
      item: { id, left, top },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top],
  );
  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />;
  }
  return (
    <div
      className="box"
      ref={drag}
      style={{ ...style, left, top, zIndex: 100 - id}}
      data-testid="box"
    >
      {children}
    </div>
  );
}

export default StudyToolModalWrapper;
