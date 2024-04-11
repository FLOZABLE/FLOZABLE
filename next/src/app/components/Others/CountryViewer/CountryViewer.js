import React, { useEffect, useState } from "react";
import styles from "./CountryViewer.module.css";
import ReactCountryFlag from "react-country-flag";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { getCountryCode } from "@/app/utils/Tool";

function CountryViewer({timezone}) {
  const [flag, setFlag] = useState(null);

  useEffect(() => {
    if (!timezone) return;
    const countryCode = getCountryCode(timezone);
    if (countryCode) {
      setFlag(
        <ReactCountryFlag 
        countryCode={countryCode}
        svg
      />
      );
    } else {
      setFlag(
        <FontAwesomeIcon icon={faGlobe} />
      );
    }
  }, [timezone]);
  return (
    <div className={styles.CountryViewer}>
      {flag}
      <div className={styles.hoverEl}>
        {timezone}
      </div>
    </div>
  );
};

export default CountryViewer;