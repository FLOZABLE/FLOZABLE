import { IconLogout } from "@/app/utils/Svg";
import styles from "./LogoutBtn.module.css";
import { useAccount } from "@/Hooks/accountHooks";
import { getAuthLogout } from "@/Api/authApi";

export default function LogoutBtn() {
  const { clearAccountData } = useAccount();

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
