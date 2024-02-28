import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CopyBtn.module.css";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";

function CopyBtn({text, copyText = 'Copy!', copiedText = 'Copied!'}) {
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
    <div className={styles.CopyBtn} onClick={() => {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
    }}>
      <i>
        <FontAwesomeIcon icon={faCopy} />
      </i>
      <div className={styles.hoverEl}>
        {isCopied ? copiedText : copyText}
      </div>
    </div>
  );
};

export default CopyBtn;