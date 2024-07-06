import { IconFriend } from "@/app/utils/Svg";
import styles from "./FriendsBar.module.css";
import { useState } from "react";

function OptionBox({ viewer, setViewer, id, children }) {
  return (
    <div
      className={styles.OptionBox}
      id={viewer === id ? styles.selected : ""}
      onClick={() => {
        setViewer(id);
      }}
    >
      {children}
    </div>
  );
}

export default function FriendsBar() {
  const [viewer, setViewer] = useState("online");
  
  return (
    <div className={styles.FriendsBar}>
      <div className={styles.OptionBox}>
        <i>
          <IconFriend />
        </i>
        <h3 className="jost">Friends</h3>
      </div>
      <div className={styles.divider}></div>
      <OptionBox id={"online"} setViewer={setViewer} viewer={viewer}>
        Online
      </OptionBox>
      <OptionBox id={"all"} setViewer={setViewer} viewer={viewer}>
        All
      </OptionBox>
      <OptionBox id={"recommended"} setViewer={setViewer} viewer={viewer}>
        Recommended
      </OptionBox>
      <OptionBox id={"requests"} setViewer={setViewer} viewer={viewer}>
        Requests
      </OptionBox>
    </div>
  );
}
