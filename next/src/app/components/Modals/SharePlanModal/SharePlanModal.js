"use client";

import { useContext, useRef } from "react";
import styles from "./SharePlanModal.module.css";
import { ModalsContext } from "@/app/utils/Contexts";
import DraggableModal from "../DraggableModal/DraggableModal";

export default function SharePlanModal() {
  const { isSharePlanModal, setIsSharePlanModal } = useContext(ModalsContext);

  const modalRef = useRef(null);

  return (
    <DraggableModal
      isOpen={isSharePlanModal}
      setIsOpen={setIsSharePlanModal}
      refProp={modalRef}
    >
      <div className={`${styles.SharePlanModal}`}>dfsd</div>
    </DraggableModal>
  );
}
