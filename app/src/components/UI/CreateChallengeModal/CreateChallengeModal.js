import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CreateChallengeModal.module.css";
import { faXmark, faFileLines } from "@fortawesome/free-solid-svg-icons";
import TextEditor from "../TextEditor/TextEditor";

function CreateChallengeModal({
    isModalOpen,
    setIsModalOpen,
    title,
    setTitle,
    description,
    setDescription
}) {
    return (
        <div className={`${styles.CreateChallengeModal} modal ${isModalOpen ? "open" : ""}`}>
            <div className={styles.modalHeader}>
                <i onClick={() => {setIsModalOpen(false)}}>
                    <FontAwesomeIcon icon={faXmark} />
                </i>
            </div>
            <div className={styles.container}>
                <div className={`${styles.wrapper} ${styles.title}`}>
                    <div className={styles.contentWrapper}>
                        <input
                        type="text"
                        placeholder="Enter Title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                        />
                    </div>
                </div>
                <div className={styles.wrapper}>
                    <div className={styles.iconWrapper}>
                        <FontAwesomeIcon icon={faFileLines} />
                        <div className={styles.hoverEl}>
                            <p>Add Description</p>
                        </div>
                    </div>
                    <div className={styles.contentWrapper}>
                        <TextEditor
                        setDescription={setDescription}
                        description={description}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateChallengeModal;