import React, { useState, useRef, useContext, useCallback } from "react";
import styles from "./CreateThemeModal.module.css";
import { faLink, faPen } from "@fortawesome/free-solid-svg-icons";
import config from "@/app/utils/config";
import { ResponseContext, ThemesContext } from "@/app/utils/Contexts";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import TextEditor from "@/app/components/Inputs/TextEditor/TextEditor";
import TagContainerGen from "@/app/components/Inputs/TagContainerGen/TagContainerGen";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import DraggableModal from "../DraggableModal/DraggableModal";
import { putThemesTheme } from "@/Api/themesApi";

function CreateThemeModal({ isOpen, setIsOpen }) {
  const { setResponse } = useContext(ResponseContext);
  const { setThemes } = useContext(ThemesContext);

  const [newTheme, setNewTheme] = useState({
    tags: [],
    name: "",
    description: "",
    url: "",
  });

  const modalRef = useRef(null);

  const submit = useCallback(() => {
    (async () => {
      const data = await putThemesTheme(newTheme);

      setResponse(data);
      if (data.success) {
        setIsOpen(false);
        setNewTheme({
          tags: [],
          name: "",
          description: "",
          url: "",
        });
        setThemes((prev) => [...prev, data.newTheme]);
      }
    })();
  }, [newTheme]);

  const setValue = (value) => {
    setNewTheme((prev) => ({ ...prev, ...value }));
  };

  return (
    <DraggableModal refProp={modalRef} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className={`${styles.CreateThemeModal} customScroll`}>
        <div className={styles.layer}>
          <CustomInput
            input={newTheme.name}
            handleInput={(e) => {
              const name = e.target.value;
              setValue({ name });
            }}
            icon={faPen}
            placeHolder={"Theme Name"}
            type={"text"}
          />
        </div>
        <div className={styles.layer}>
          <TextEditor
            value={newTheme.description}
            setValue={(description) => {
              setValue({ description });
            }}
          />
        </div>
        <div className={styles.layer}>
          <CustomInput
            input={newTheme.url}
            handleInput={(e) => {
              const url = e.target.value;
              setValue({ url });
            }}
            icon={faLink}
            placeHolder={"Youtube Link"}
            type={"text"}
          />
        </div>
        <div className={styles.layer}>
          <TagContainerGen
            maxTags={10}
            setTags={newTheme.tags}
            handleCreatedTagsChange={(tags) => {
              setValue({ tags });
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
