import { IconLogout } from "@/app/utils/Svg";
import styles from "./LogoutBtn.module.css";
import { getAuthLogout } from "@/Api/authApi";
import { useContext } from "react";
import { UserInfoContext } from "@/app/utils/Contexts";

export default function LogoutBtn() {
  const { clearAccountData } = useContext(UserInfoContext);

  return (
    <div
      className={styles.LogoutBtn}
      onClick={async () => {
        const data = await getAuthLogout();
        if (data.success) {
          clearAccountData();
        }
      }}
    >
      <i>
        <IconLogout />
      </i>
      <p>Logout</p>
    </div>
  );
}
