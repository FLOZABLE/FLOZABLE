"use client";

import { useContext, useRef, useState } from "react";
import styles from "./SearchUsersModal.module.css";
import DraggableModal from "../DraggableModal/DraggableModal";
import SearchUsers from "../../Users/SearchUsers/SearchUsers";
import SearchBar from "../../Inputs/SearchBar/SearchBar";
import { ModalsContext } from "@/app/utils/Contexts";

export default function SearchUsersModal() {
  const { isSearchUsersModal, setIsSearchUsersModal } =
    useContext(ModalsContext);
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef(null);

  return (
    <DraggableModal
      isOpen={isSearchUsersModal}
      setIsOpen={setIsSearchUsersModal}
      refProp={modalRef}
    >
      <div className={`${styles.SearchUsersModal}`}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <SearchUsers searchQuery={searchQuery} onClick={(userInfo) => {}} />
      </div>
    </DraggableModal>
  );
}
