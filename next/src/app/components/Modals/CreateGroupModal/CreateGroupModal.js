import React, { useCallback, useState, useRef, useContext } from "react";
import styles from "./CreateGroupModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faPalette,
  faFileLines,
  faTags,
  faLock,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import { ResponseContext } from "@/app/utils/Contexts";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import TextEditor from "@/app/components/Inputs/TextEditor/TextEditor";
import ColorPalette from "@/app/components/Inputs/ColorPalette/ColorPalette";
import SliderAnimation from "@/app/components/Inputs/SliderAnimation/SliderAnimation";
import OptionToggleBtn from "@/app/components/Buttons/OptionToggleBtn/OptionToggleBtn";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import DraggableModal from "../DraggableModal/DraggableModal";
import TagsGenerator from "../../Inputs/TagsGenerator/TagsGenerator";
import { putGroup } from "@/Api/groupsApi";
import { DEFAULT_GROUP } from "@/app/utils/Constant";

function CreateGroupModal({ isOpen, setIsOpen }) {
  const { setResponse } = useContext(ResponseContext);

  const [newGroup, setNewGroup] = useState(DEFAULT_GROUP);

  const [isSelectColor, setIsSelectColor] = useState(false);

  const modalRef = useRef(null);

  const submit = useCallback(() => {
    (async () => {
      const data = await putGroup(newGroup);
      setResponse(data);

      if (data.success) {
        setIsOpen(false);
        setNewGroup(DEFAULT_GROUP);
      }
    })();
  }, [newGroup]);

  return (
    <DraggableModal refProp={modalRef} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className={`${styles.CreateGroupModal} customScroll`}>
        <div className={`${styles.wrapper} ${styles.title}`}>
          <div className={styles.iconWrapper}></div>
          <div className={styles.contentWrapper}>
            <CustomInput
              input={newGroup.name}
              handleInput={(e) => {
                const name = e.target.value;
                setNewGroup((prev) => ({ ...prev, name }));
              }}
              icon={null}
              placeHolder={"Study Group Name"}
              type={"text"}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faFileLines} />
            <div className={styles.hoverEl}>
              <p>Description</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <TextEditor
              setValue={(description) => {
                setNewGroup((prev) => ({ ...prev, description }));
              }}
              value={newGroup.description}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faPalette} />
            <div className={styles.hoverEl}>
              <p>Color</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <ColorPalette
              setSelectedColor={(color) => {
                setNewGroup((prev) => ({ ...prev, color }));
              }}
              selectedColor={newGroup.color}
              isSelectColor={isSelectColor}
              setIsSelectColor={setIsSelectColor}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faUserGroup} />
            <div className={styles.hoverEl}>
              <p>Max Members</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <SliderAnimation
              min={0}
              max={100}
              step={1}
              sliderValue={newGroup.max_members}
              setSliderValue={(max_members) => {
                setNewGroup((prev) => ({ ...prev, max_members }));
              }}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faTags} />
            <div className={styles.hoverEl}>
              <p>Tags</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <TagsGenerator
              tags={newGroup.tags}
              setTags={(tags) => {
                console.log(tags, "gddd");

                setNewGroup((prev) => ({ ...prev, tags }));
              }}
              maxTags={10}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faLock} />
            <div className={styles.hoverEl}>
              <p>Visibility</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <OptionToggleBtn
              opt1={{ val: 0, name: "PRIVATE" }}
              opt2={{ val: 1, name: "PUBLIC" }}
              value={newGroup.visibility}
              setValue={(visibility) => {
                setNewGroup((prev) => ({ ...prev, visibility }));
              }}
            />
            <div
              className={`${styles.inputArea} ${
                newGroup.visibility ? "" : styles.open
              }`}
            >
              <CustomInput
                input={newGroup.password}
                handleInput={(e) => {
                  const password = e.target.value;
                  setNewGroup((prev) => ({ ...prev, password }));
                }}
                icon={null}
                placeHolder={"Enter Password"}
                type={"text"}
              />
            </div>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faStopwatch} />
            <div className={styles.hoverEl}>
              <p>day Group Goal</p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <SliderAnimation
              min={0}
              max={10}
              step={1}
              sliderValue={newGroup.goal_hr}
              setSliderValue={(goal_hr) => {
                setNewGroup((prev) => ({ ...prev, goal_hr }));
              }}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.iconWrapper}></div>
          <div className={styles.contentWrapper}></div>
        </div>
        <div className={styles.submit}>
          <BlobBtn onClick={submit}>SUBMIT</BlobBtn>
        </div>
      </div>
    </DraggableModal>
  );
}

export default CreateGroupModal;
