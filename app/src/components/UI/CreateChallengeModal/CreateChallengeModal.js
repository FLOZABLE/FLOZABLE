import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CreateChallengeModal.module.css";
import { faXmark, faFileLines, faClock } from "@fortawesome/free-solid-svg-icons";
import TextEditor from "../TextEditor/TextEditor";
import DateSelector from "../DateSelector/DateSelector";
import BlobBtn from "../BlobBtn/BlobBtn";

function CreateChallengeModal({
    isModalOpen,
    setIsModalOpen,
    title,
    setTitle,
    description,
    setDescription,
    start,
    setStart,
    end,
    setEnd,
    setChallengeSubmit
}) {
    return (
        <div className={`${styles.CreateChallengeModal} modal ${isModalOpen ? "open" : ""}`}>
            <div className={styles.modalHeader}>
                <i onClick={() => { setIsModalOpen(false) }}>
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
                <div className={styles.wrapper}>
                    <div className={styles.iconWrapper}>
                        <FontAwesomeIcon icon={faClock} />
                        <div className={styles.hoverEl}>
                            <p>Select Time</p>
                        </div>
                    </div>
                    <div className={styles.contentWrapper}>
                        <DateSelector
                            start={start}
                            setStart={setStart}
                            end={end}
                            setEnd={setEnd}
                        />
                    </div>
                </div>

                <div className={styles.submit}>
                    <BlobBtn name={"SUBMIT"} setClicked={setChallengeSubmit} delay={-1} />
                </div>
            </div>
        </div>
    );
}

export default CreateChallengeModal;