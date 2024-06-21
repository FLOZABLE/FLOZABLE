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

export default function SharePlanModal() {
  const { isSharePlanModal, setIsSharePlanModal } = useContext(ModalsContext);
  const { planModal, setPlanModal } = useContext(PlansContext);
  const { setResponse } = useContext(ResponseContext);

  const modalRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState(false);

  return (
    <DraggableModal
      isOpen={isSharePlanModal}
      setIsOpen={setIsSharePlanModal}
      refProp={modalRef}
    >
      <div className={`${styles.SharePlanModal}`}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEnter={() => {
            setSearch(true);
          }}
        />
        <SearchUsers
          searchQuery={searchQuery}
          search={search}
          setSearch={setSearch}
          onClick={(userInfo) => {
            if (
              planModal.shared.find((user) => user.user_id === userInfo.user_id)
            ) {
              return setResponse({success: false, reason: `Already Shared with ${userInfo.name}`});
            };

            if (planModal.opened) {
              setPlanModal((prev) => {
                return {
                  ...prev,
                  shared: [...prev.shared, userInfo],
                };
              });
              setResponse({success: true, msg: `Added ${userInfo.name}`})
            }
          }}
        />
      </div>
    </DraggableModal>
  );
}
