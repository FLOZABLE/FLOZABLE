"use client";

import React, { useCallback, useState, useContext } from "react";
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
import { GroupsContext } from "@/app/utils/Contexts";
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
import ModalLayer from "../ModalLayer/ModalLayer";
import { MittInstance } from "@/app/utils/mittInstance";

function CreateGroupModal({ isOpen, setIsOpen }) {
  const { setGroups } = useContext(GroupsContext);

  const [newGroup, setNewGroup] = useState(DEFAULT_GROUP);

  const [isSelectColor, setIsSelectColor] = useState(false);

  const submit = useCallback(async () => {
    try {
      const response = await putGroup(newGroup);
      if (!response.success) return;

      const { data } = response;

      setIsOpen(false);
      setNewGroup(DEFAULT_GROUP);
      setGroups((prev) => [...prev, data.group]);

      setTimeout(() => {
        MittInstance.emit("moveMyGroupsViewer");
      }, 100);
    } catch (err) {
      console.log(err);
    }
  }, [newGroup]);

  return (
    <div className={styles.CreateGroupModal}>
      <DraggableModal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className={`${styles.inner} customScroll`}>
          <ModalLayer>
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
          </ModalLayer>
          <ModalLayer
            hoverText={"Description"}
            icon={<FontAwesomeIcon icon={faFileLines} />}
          >
            <TextEditor
              setValue={(description) => {
                setNewGroup((prev) => ({ ...prev, description }));
              }}
              value={newGroup.description}
            />
          </ModalLayer>
          <ModalLayer
            hoverText={"Color"}
            icon={<FontAwesomeIcon icon={faPalette} />}
          >
            <ColorPalette
              setSelectedColor={(color) => {
                setNewGroup((prev) => ({ ...prev, color }));
              }}
              selectedColor={newGroup.color}
              isSelectColor={isSelectColor}
              setIsSelectColor={setIsSelectColor}
            />
          </ModalLayer>
          <ModalLayer
            hoverText={"Max Members"}
            icon={<FontAwesomeIcon icon={faUserGroup} />}
          >
            <SliderAnimation
              min={0}
              max={100}
              step={1}
              sliderValue={newGroup.max_members}
              setSliderValue={(max_members) => {
                setNewGroup((prev) => ({ ...prev, max_members }));
              }}
            />
          </ModalLayer>
          <ModalLayer
            hoverText={"Tags"}
            icon={<FontAwesomeIcon icon={faTags} />}
          >
            <TagsGenerator
              tags={newGroup.tags}
              setTags={(tags) => {
                setNewGroup((prev) => ({ ...prev, tags }));
              }}
              maxTags={10}
            />
          </ModalLayer>
          <ModalLayer
            hoverText={"Visibility"}
            icon={<FontAwesomeIcon icon={faLock} />}
          >
            <OptionToggleBtn
              opt1={{ val: 0, name: "PRIVATE" }}
              opt2={{ val: 1, name: "PUBLIC" }}
              value={newGroup.visibility}
              setValue={(visibility) => {
                setNewGroup((prev) => ({ ...prev, visibility }));
              }}
              id="80w9er8w9"
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
          </ModalLayer>
          <ModalLayer
            hoverText={"Group's Goal"}
            icon={<FontAwesomeIcon icon={faStopwatch} />}
          >
            <SliderAnimation
              min={0}
              max={10}
              step={1}
              sliderValue={newGroup.goal_hr}
              setSliderValue={(goal_hr) => {
                setNewGroup((prev) => ({ ...prev, goal_hr }));
              }}
            />
          </ModalLayer>
          <div className={styles.buttons}>
            <BlobBtn onClick={submit}>SUBMIT</BlobBtn>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}

export default CreateGroupModal;
