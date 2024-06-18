import React, { useState, useRef, useContext } from "react";
import styles from "./CreateThemeModal.module.css";
import { faLink, faPen } from "@fortawesome/free-solid-svg-icons";
import config from "@/app/utils/config";
import { ResponseContext, ThemesContext } from "@/app/utils/Contexts";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import TextEditor from "@/app/components/Inputs/TextEditor/TextEditor";
import TagContainerGen from "@/app/components/Inputs/TagContainerGen/TagContainerGen";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import DraggableModal from "../DraggableModal/DraggableModal";

function CreateThemeModal({ isOpen, setIsOpen }) {
  const { setResponse } = useContext(ResponseContext);
  const { setThemes } = useContext(ThemesContext);

  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const modalRef = useRef(null);

  const submit = () => {
    fetch(`${config.server}/themes/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        tags,
        description,
        url,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setThemes((prev) => [...prev, data.themeInfo]);

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
    <DraggableModal refProp={modalRef} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className={`${styles.CreateThemeModal} customScroll`}>
        <div className={styles.layer}>
          <CustomInput
            input={name}
            handleInput={(e) => {
              setName(e.target.value);
            }}
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
            handleInput={(e) => {
              setUrl(e.target.value);
            }}
            icon={faLink}
            placeHolder={"Youtube Link"}
            type={"text"}
          />
        </div>
        <div className={styles.layer}>
          <TagContainerGen
            maxTags={10}
            setTags={setTags}
            handleCreatedTagsChange={(tags) => {
              setTags(tags);
            }}
          />
        </div>
        <div className={styles.submitWrapper}>
          <BlobBtn color1={"#fff"} color2={"var(--purple2)"} onClick={submit}>
            SUBMIT
          </BlobBtn>
        </div>
      </div>
    </DraggableModal>
  );
}

export default CreateThemeModal;
