import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./MainFooter.module.css";
import { faChevronRight, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";

export default function MainFooter() {
  return (
    <footer className={styles.MainFooter} id={styles.top}>
      <div className={styles.section}>
        <Image
          src={"/img/main/bg-top.png"}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          alt={`background`}
        />
      </div>
      <div className={styles.section} id={styles.middle}>
        <div className={styles.layer}>
          <h3 className={styles.title}>Address</h3>
          <ul>
            <li className={styles.item}>
              <i>
                <FontAwesomeIcon icon={faEnvelope} />
              </i>
              <p>support@flozable.com</p>
            </li>
          </ul>
          <div className={styles.items}></div>
        </div>
        <div className={styles.layer} id={styles.links}>
          <h3 className={styles.title}>Quick Link</h3>
          <div className={styles.items}>
            <Link href={"/dashboard"} className={styles.item}>
              <i>
                <FontAwesomeIcon icon={faChevronRight} />
              </i>
              <p>Dashboard</p>
            </Link>
            <Link href={"/#about"} className={styles.item}>
              <i>
                <FontAwesomeIcon icon={faChevronRight} />
              </i>
              <p>About Us</p>
            </Link>
            <Link href={"/privacy"} className={styles.item}>
              <i>
                <FontAwesomeIcon icon={faChevronRight} />
              </i>
              <p>Privacy Policy</p>
            </Link>
            <Link href={"/terms"} className={styles.item}>
              <i>
                <FontAwesomeIcon icon={faChevronRight} />
              </i>
              <p>Terms of Service</p>
            </Link>
            <Link href={"/cookies"} className={styles.item}>
              <i>
                <FontAwesomeIcon icon={faChevronRight} />
              </i>
              <p>Cookies</p>
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.section} id={styles.bottom}>
        <p>© FLOZABLE, All Right Reserved.</p>
      </div>
    </footer>
  );
}
