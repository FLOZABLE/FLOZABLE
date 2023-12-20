import { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SearchUsers({searchQuery}) {
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    if (rateLimited) return;
    setRateLimited(true);
    fetch(`${serverOrigin}/api/users/search`, {
      method: "post",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        setOtherGroups(
          (prev) => {
            prev.filter(group => {
              return group.group_id != group_id;
            })
          }
        );
        setMyGroups((prev) => [...prev, joinTarget]);
      })
      .catch((error) => console.error(error));
    const rateLimitId = setTimeout(() => {
      setRateLimited(false);
    }, 1500);
    return () => {
      clearTimeout(rateLimitId);
    };
  }, [searchQuery, rateLimited]);

  return (
    <div className={styles.SearchUsers}>

    </div>
  );
};

export default SearchUsers;