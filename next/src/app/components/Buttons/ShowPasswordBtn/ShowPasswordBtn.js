import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "./ShowPasswordBtn.module.css";

export default function ShowPasswordBtn({ isShowPassword, setIsShowPassword }) {
  return (
    <div
      className={styles.ShowPasswordBtn}
      onClick={() => setIsShowPassword((prev) => !prev)}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={isShowPassword ? "eyeSlash" : "eye"}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ display: "inline-block" }}
        >
          <FontAwesomeIcon icon={isShowPassword ? faEye : faEyeSlash} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
