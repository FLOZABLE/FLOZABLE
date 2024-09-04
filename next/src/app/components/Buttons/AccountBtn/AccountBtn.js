import { ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import styles from "./AccountBtn.module.css";
import { useContext } from "react";
import { getAuthLogout } from "@/Api/authApi";
import { IconLogin, IconLogout } from "@/app/utils/Svg";

export default function AccountBtn() {
  const { setIsAccountModal } = useContext(ModalsContext);
  const { clearAccountData, userInfo } = useContext(UserInfoContext);

  return (
    <div
      className={styles.AccountBtn}
      onClick={async () => {
        if (userInfo) {
          const data = await getAuthLogout();
          if (data.success) {
            clearAccountData();
            window.location.reload();
          }
        } else {
          setIsAccountModal(true);
        }
      }}
    >
      {userInfo ? (
        <>
          <i>
            <IconLogout />
          </i>
          <p>Logout</p>
        </>
      ) : (
        <>
          <i>
            <IconLogin />
          </i>
          <p>Login</p>
        </>
      )}
    </div>
  );
}
