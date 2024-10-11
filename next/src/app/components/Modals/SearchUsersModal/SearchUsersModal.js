"use client";

import { useContext, useRef, useState } from "react";
import styles from "./SearchUsersModal.module.css";
import DraggableModal from "../DraggableModal/DraggableModal";
import SearchUsers from "../../Users/SearchUsers/SearchUsers";
import SearchBar from "../../Inputs/SearchBar/SearchBar";
import { ModalsContext } from "@/app/utils/Contexts";

export default function SearchUsersModal() {
  const { searchUsersModal, setSearchUsersModal } = useContext(ModalsContext);
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef(null);

  return (
    <div className={styles.SearchUsersModal}>
      <DraggableModal
        isOpen={searchUsersModal?.opened}
        setIsOpen={() => {
          setSearchUsersModal((prev) => ({ ...prev, opened: false }));
        }}
        refProp={modalRef}
      >
        <div className={`${styles.inner}`}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <SearchUsers
            searchQuery={searchQuery}
            onClick={searchUsersModal.onClick}
          />
        </div>
      </DraggableModal>
    </div>
  );
}
