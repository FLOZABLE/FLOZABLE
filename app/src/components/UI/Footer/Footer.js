import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.FooterContainer}>
      <div className={styles.inner}>
        <Link to="/dashboard">
          <p>Main</p>
        </Link>
        <div className={styles.divider}></div>
        <Link to="/dashboard">
          <p>About Us</p>
        </Link>
        <div className={styles.divider}></div>
        <Link to="/dashboard">
          <p>Blog</p>
        </Link>
        <div className={styles.divider}></div>
        <Link to="/dashboard">
          <p>License</p>
        </Link>
      </div>
    </footer>
  );
}

export default Footer;