"use client";

import { useContext, useRef, useState } from "react";
import styles from "./SharePlanModal.module.css";
import {
  ModalsContext,
  PlansContext,
  ResponseContext,
} from "@/app/utils/Contexts";
import DraggableModal from "../DraggableModal/DraggableModal";
import SearchUsers from "../../Users/SearchUsers/SearchUsers";
import SearchBar from "../../Inputs/SearchBar/SearchBar";
import { postPlanShare } from "@/Api/plansApi";

export default function SharePlanModal() {
  const { isSharePlanModal, setIsSharePlanModal } = useContext(ModalsContext);
  const { planModal, setPlanModal } = useContext(PlansContext);
  const { setResponse } = useContext(ResponseContext);

  const modalRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DraggableModal
      isOpen={isSharePlanModal}
      setIsOpen={setIsSharePlanModal}
      refProp={modalRef}
    >
      <div className={`${styles.SharePlanModal}`}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <SearchUsers
          searchQuery={searchQuery}
          onClick={(userInfo) => {
            if (
              planModal.share.find((user) => user.user_id === userInfo.user_id)
            ) {
              return setResponse({
                success: false,
                reason: `Already Shared with ${userInfo.name}`,
              });
            }

            if (planModal.opened) {
              setPlanModal((prev) => {
                return {
                  ...prev,
                  share: [...prev.share, userInfo],
                };
              });
              postPlanShare([userInfo.user_id], planModal.plan_id);
              setResponse({ success: true, msg: `Added ${userInfo.name}` });
            }
          }}
        />
      </div>
    </DraggableModal>
  );
}
