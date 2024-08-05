import styles from "./SearchUsersBox.module.css";
import SearchBar from "../../Inputs/SearchBar/SearchBar";
import { useState } from "react";
import SearchUsers from "../SearchUsers/SearchUsers";
import { useRouter } from "next/navigation";

export default function SearchUsersBox() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={`Box ${styles.SearchUsersBox}`}>
      <div className={`header ${styles.header}`}>Search friends</div>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <SearchUsers
        searchQuery={searchQuery}
        onClick={(userInfo) => {
          router.push(`/dashboard/user/${userInfo.user_id}`);
        }}
      />
    </div>
  );
}
