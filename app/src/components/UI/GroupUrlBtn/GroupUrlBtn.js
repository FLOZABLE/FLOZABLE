import { faLink } from "@fortawesome/free-solid-svg-icons";
import styles from "./GroupUrlBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

function GroupUrlBtn({ text, copyText = 'Copy!', copiedText = 'Copied!', bgColor='#ffffffC0', color='#000' }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeoutId = setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  return (
    <div className={styles.GroupUrlBtn} style={{backgroundColor: bgColor, color}} onClick={() => {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
    }}>
      <i style={{color}}>
        <FontAwesomeIcon icon={faLink} />
      </i>
      <div className={styles.hoverEl} style={{color}} >
        {isCopied ? copiedText : copyText}
      </div>
    </div>
  );
};

export default GroupUrlBtn;