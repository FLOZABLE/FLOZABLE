import { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SearchUsers({searchQuery}) {
  const [rateLimited, setRateLimited] = useState(false);
  const [lastUpd, setLastUpd] = useState(false);

  useEffect(() => {
    const isRateLimited = lastUpd && new Date().getTime() - lastUpd < 2000;
    console.log(isRateLimited)
    if (isRateLimited || !searchQuery || searchQuery.length <= 3) return;
    
    setLastUpd(new Date().getTime());
    fetch(`${serverOrigin}/api/friend/search?query=${searchQuery}`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
      })
      .catch((error) => console.error(error));
  }, [searchQuery, lastUpd]);

  return (
    <div className={styles.SearchUsers}>

    </div>
  );
};

export default SearchUsers;