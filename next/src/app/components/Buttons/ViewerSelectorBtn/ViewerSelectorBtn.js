import DropDownButton from "../DropDownButton/DropDownButton";
import styles from "./ViewerSelectorBtn.module.css";

export default function ViewerSelectorBtn({ viewer, setViewer }) {
  return (
    <div className={styles.ViewerSelectorBtn}>
      <DropDownButton
        options={{
          day: "Day",
          week: "Week",
          month: "Month",
        }}
        setValue={setViewer}
        value={viewer}
      />
    </div>
  );
}
