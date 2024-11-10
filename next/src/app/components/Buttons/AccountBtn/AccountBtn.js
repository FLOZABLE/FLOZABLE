import { AccountModalContext } from "@/app/utils/Contexts";
import styles from "./AccountBtn.module.css";
import { useContext } from "react";
import { getAuthLogout } from "@/Api/authApi";
import { IconLogin, IconLogout } from "@/app/utils/Svg";
import { useAccount } from "@/Hooks/accountHooks";

export default function AccountBtn() {
  const { setIsAccountModal } = useContext(AccountModalContext);
  const { accountData, clearAccountData } = useAccount();

  return (
    <div
      className={styles.AccountBtn}
      onClick={async () => {
        try {
          if (accountData) {
            const response = await getAuthLogout();
            if (response.success) {
              clearAccountData();
              window.location.reload();
            }
          } else {
            setIsAccountModal(true);
          }
        } catch (err) {
          console.log(err);
        }
      }}
    >
      {accountData ? (
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
