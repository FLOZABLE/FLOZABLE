"use client";

import React, { useCallback, useState, useContext, useEffect } from "react";
import styles from "./EditGroupModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faPalette,
  faFileLines,
  faTags,
  faLock,
  faStopwatch,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { GroupsContext, ModalsContext } from "@/app/utils/Contexts";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import TextEditor from "@/app/components/Inputs/TextEditor/TextEditor";
import ColorPalette from "@/app/components/Inputs/ColorPalette/ColorPalette";
import SliderAnimation from "@/app/components/Inputs/SliderAnimation/SliderAnimation";
import OptionToggleBtn from "@/app/components/Buttons/OptionToggleBtn/OptionToggleBtn";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import DraggableModal from "../DraggableModal/DraggableModal";
import TagsGenerator from "../../Inputs/TagsGenerator/TagsGenerator";
import { deleteGroup, patchGroup } from "@/Api/groupsApi";
import { DEFAULT_GROUP } from "@/app/utils/Constant";
import ModalLayer from "../ModalLayer/ModalLayer";

function EditGroupModal() {
  const { editGroupModal, setEditGroupModal } = useContext(ModalsContext);
  const { groups, setGroups } = useContext(GroupsContext);

  const [newGroup, setNewGroup] = useState(DEFAULT_GROUP);

  const [isSelectColor, setIsSelectColor] = useState(false);

  const onSubmit = useCallback(async () => {
    try {
      const response = await patchGroup(newGroup);
      if (!response.success) return;

      setEditGroupModal({ group_id: null, opened: false });
      const newGroups = [...groups];
      const groupIndex = newGroups.findIndex(
        (group) => group.group_id === newGroup.group_id
      );
      if (groupIndex === -1) return;
      newGroups[groupIndex] = newGroup;
      setGroups(newGroups);
    } catch (err) {
      console.log(err);
    }
  }, [newGroup, groups]);

  const onDelete = useCallback(async () => {
    try {
      const groupId = newGroup.group_id;
      const response = await deleteGroup(groupId);
      if (!response.success) return;

      setEditGroupModal({ group_id: null, opened: false });
      const newGroups = groups.filter((group) => group.group_id !== groupId);
      setGroups(newGroups);
    } catch (err) {
      console.log(err);
    }
  }, [newGroup, groups]);

  useEffect(() => {
    if (!editGroupModal.group_id) return;

    const newGroup = groups.find(
      (group) => group.group_id === editGroupModal.group_id
    );
    if (!newGroup) return;

    setNewGroup((prev) => ({ ...prev, ...newGroup }));
  }, [editGroupModal.group_id, groups]);

  return (
    <div className={styles.EditGroupModal}>
      <DraggableModal
        isOpen={editGroupModal.opened}
        setIsOpen={() => {
          setEditGroupModal(false);
        }}
      >
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
            <BlobBtn onClick={onSubmit}>SUBMIT</BlobBtn>
            <BlobBtn onClick={onDelete}>
              <FontAwesomeIcon icon={faTrashCan} />
            </BlobBtn>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}

export default EditGroupModal;
