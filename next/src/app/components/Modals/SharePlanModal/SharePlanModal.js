import { useContext } from "react";
import styles from "./SharePlanModal.module.css";
import { ModalsContext } from "@/app/utils/Contexts";


export default function SharePlanModal() {
  const {isSharePlanModal, setIsSharePlanModal} = useContext(ModalsContext);

  

  return (
    <div className={`modal ${styles.SharePlanModal}`}>

    </div>
  )
}