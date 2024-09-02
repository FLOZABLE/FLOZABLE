import DropDownButton from "../DropDownButton/DropDownButton";
import styles from "./ViewerSelectorBtn.module.css";

export default function ViewerSelectorBtn({ viewer, setViewer }) {
  return (
    <div className={styles.ViewerSelectorBtn}>
      <DropDownButton
        options={[
          { name: "Day", value: "day" },
          { name: "Week", value: "week" },
          { name: "Month", value: "month" },
        ]}
        setValue={setViewer}
        value={viewer}
      />
    </div>
  );
}
