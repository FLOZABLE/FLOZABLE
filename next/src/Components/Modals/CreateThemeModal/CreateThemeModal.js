import React, { useState, useRef, useContext } from "react";
import Draggable from "react-draggable";
import styles from "./CreateThemeModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import config from "@/utils/config";
import { ResponseContext, ThemesContext } from "@/utils/Contexts";
import CustomInput from "@/Components/Inputs/CustomInput/CustomInput";
import TextEditor from "@/Components/Inputs/TextEditor/TextEditor";
import TagContainerGen from "@/Components/Inputs/TagContainerGen/TagContainerGen";
import BlobBtn from "@/Components/Buttons/BlobBtn/BlobBtn";

function CreateThemeModal({
  isOpen,
  setIsOpen,
}) {
  const { setResponse } = useContext(ResponseContext);
  const { setThemes } = useContext(ThemesContext);

  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const modalRef = useRef(null);

  const submit = () => {
    fetch(`${config.server}/themes/create`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name, tags, description, url
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setThemes(prev => [...prev,
          data.themeInfo
          ]);

          setTags([]);
          setName("");
          setDescription("");
          setUrl("");
          setIsOpen(false);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <Draggable nodeRef={modalRef} handle=".header">
      <div
        className={`${styles.CreateThemeModal} modal ${isOpen ? "open" : ""
          }`}
        ref={modalRef}
      >
        <div className={`${styles.header} header`}>
          <i
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <div className={`${styles.content} customScroll`}>
          <div className={styles.layer}>
            <CustomInput
              input={name}
              handleInput={(e) => { setName(e.target.value) }}
              icon={faPen}
              placeHolder={"Theme Name"}
              type={"text"}
            />
          </div>
          <div className={styles.layer}>
            <TextEditor
              setDescription={setDescription}
              description={description}
            />
          </div>
          <div className={styles.layer}>
            <CustomInput
              input={url}
              handleInput={(e) => { setUrl(e.target.value) }}
              icon={faLink}
              placeHolder={"Youtube Link"}
              type={"text"}
            />
          </div>
          <div className={styles.layer}>
            <TagContainerGen
              maxTags={10}
              setTags={setTags}
              handleCreatedTagsChange={(tags) => { setTags(tags) }}
            />
          </div>
          <div className={styles.submitWrapper}>
            <BlobBtn
              name={"SUBMIT"}
              color1={"#fff"}
              color2={"var(--purple2)"}
              setClicked={submit}
            />
          </div>
        </div>
      </div>
    </Draggable>
  );
}

export default CreateThemeModal;