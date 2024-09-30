import { useContext } from "react";
import styles from "./AccountWall.module.css";
import { ModalsContext } from "@/app/utils/Contexts";

export default function AccountWall() {
  const { setIsAccountModal } = useContext(ModalsContext);

  return (
    <div
      className={styles.AccountWall}
      onClick={() => {
        setIsAccountModal(true);
      }}
    >
      <p>Login to use this feature!</p>
    </div>
  );
}
