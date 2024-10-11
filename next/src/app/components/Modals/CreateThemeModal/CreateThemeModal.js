import React, { useState, useContext, useCallback } from "react";
import styles from "./CreateThemeModal.module.css";
import { faLink, faPen } from "@fortawesome/free-solid-svg-icons";
import { ResponseContext, ThemesContext } from "@/app/utils/Contexts";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import TextEditor from "@/app/components/Inputs/TextEditor/TextEditor";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import DraggableModal from "../DraggableModal/DraggableModal";
import { putThemesTheme } from "@/Api/themesApi";
import TagsGenerator from "../../Inputs/TagsGenerator/TagsGenerator";

function CreateThemeModal({ isOpen, setIsOpen }) {
  const { setResponse } = useContext(ResponseContext);
  const { setThemes } = useContext(ThemesContext);

  const [newTheme, setNewTheme] = useState({
    tags: [],
    name: "",
    description: "",
    url: "",
  });

  const submit = useCallback(() => {
    (async () => {
      const data = await putThemesTheme(newTheme);

      setResponse(data);
      if (data.success) {
        setIsOpen(false);
        /* setNewTheme({
          tags: [],
          name: "",
          description: "",
          url: "",
        }); */
        setThemes((prev) => [...prev, data.newTheme]);
      }
    })();
  }, [newTheme]);

  const setValue = (value) => {
    setNewTheme((prev) => ({ ...prev, ...value }));
  };

  return (
    <div className={styles.CreateThemeModal}>
      <DraggableModal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className={`${styles.inner} customScroll`}>
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
            <TagsGenerator
              tags={newTheme.tags}
              setTags={(tags) => setNewTheme({ ...newTheme, tags })}
            />
          </div>
          <div className={styles.submitWrapper}>
            <BlobBtn onClick={submit}>SUBMIT</BlobBtn>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}

export default CreateThemeModal;
