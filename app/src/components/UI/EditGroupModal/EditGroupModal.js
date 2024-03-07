import React, { useCallback, useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import styles from "./EditGroupModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faUserGroup,
  faPalette,
  faFileLines,
  faTags,
  faLock,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import SliderAnimation from "../SliderAnimation/SliderAnimation";
import TextEditor from "../TextEditor/TextEditor";
import CustomInput from "../CustomInput/CustomInput";
import BlobBtn from "../BlobBtn/BlobBtn";
import ColorPalette from "../ColorPalette/ColorPalette";
import TagContainerGen from "../TagContainerGen/TagContainerGen";
import OptionToggleBtn from "../OptionToggleBtn/OptionToggleBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function EditGroupModal({ isOpen, setIsOpen, setCreateGroupResponse }) {
  const [name, setName] = useState("");
  const [submit, setSubmit] = useState(false);
  const [maxMembers, setMaxMembers] = useState(10);
  const [color, setColor] = useState("");
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(1);
  const [password, setPassword] = useState("");
  const [goalHr, setGoalHr] = useState(3);
  const [groupId, setGroupId] = useState(null);
  const modalRef = useRef(null);

  const handleNameInput = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const handlePwInput = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleCreatedTagsChange = useCallback((tags) => {
    setTags(tags);
  }, []);

  useEffect(() => {
    if (submit && groupId) {
      fetch(`${serverOrigin}/groups/modify`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: groupId,
          name: name,
          color: color,
          tags: tags,
          explanation: description,
          max_members: maxMembers,
          visibility: visibility,
          password: password,
          goal_hr: goalHr,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setCreateGroupResponse(data);
          if (data.success) {
            setIsOpen(false);
            setName("");
            setMaxMembers(10);
            setColor("");
            setIsSelectColor(false);
            setTags([]);
            setDescription("");
            setVisibility(1);
            setPassword("");
            setGoalHr(3);
          };
        })
        .catch((error) => console.error(error));
    }
  }, [submit, groupId,]);

  useEffect(() => {
    if (!isOpen) return;

    const { name, max_members, color, tags, explanation, visibility, goal_hr, group_id } = isOpen;

    setGroupId(group_id);
    setName(name);
    setMaxMembers(max_members);
    setColor(color);
    setTags(JSON.parse(tags));
    setDescription(explanation);
    setVisibility(visibility);
    setGoalHr(goal_hr);
  }, [isOpen]);

  return (
    <Draggable nodeRef={modalRef} handle=".header">
      <div className={`${styles.EditGroupModal} modal ${isOpen ? "open" : ""}`}
        ref={modalRef}>
        <div className={`${styles.header} header`}>
          <i
            className={styles.closeBtn}
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <div className={`${styles.container} customScroll`}>
          <div className={`${styles.wrapper} ${styles.title}`}>
            <div className={styles.iconWrapper}></div>
            <div className={styles.contentWrapper}>
              <CustomInput
                input={name}
                handleInput={handleNameInput}
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
                setDescription={setDescription}
                description={description}
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
                setSelectedColor={setColor}
                selectedColor={color}
                isSelectColor={isSelectColor}
                setIsSelectColor={setIsSelectColor}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon icon={faUserGroup} />
              <div className={styles.hoverEl}>
                <p>Max maxMembers</p>
              </div>
            </div>
            <div className={styles.contentWrapper}>
              <SliderAnimation
                min={0}
                max={100}
                step={1}
                sliderValue={maxMembers}
                setSliderValue={setMaxMembers}
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
              <TagContainerGen
                maxTags={10}
                setTags={setTags}
                handleCreatedTagsChange={handleCreatedTagsChange}
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
                value={visibility}
                setValue={setVisibility}
                id={1}
              />
              <div
                className={`${styles.inputArea} ${visibility ? "" : styles.open}`}
              >
                <CustomInput
                  input={password}
                  handleInput={handlePwInput}
                  icon={null}
                  placeHolder={isOpen.visibility === 0 ? "Change Password" : "Enter Password"}
                  type={"text"}
                />
              </div>
            </div>
          </div>
          <div className={styles.wrapper}>
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon icon={faStopwatch} />
              <div className={styles.hoverEl}>
                <p>Daily Group Goal</p>
              </div>
            </div>
            <div className={styles.contentWrapper}>
              <SliderAnimation
                min={0}
                max={10}
                step={1}
                sliderValue={goalHr}
                setSliderValue={setGoalHr}
              />
            </div>
          </div>
          <div className={styles.wrapper}>
            <div className={styles.iconWrapper}></div>
            <div className={styles.contentWrapper}></div>
          </div>
          <div className={styles.submit}>
            <BlobBtn
              name={"SUBMIT"}
              setClicked={setSubmit}
              color1={"#fff"}
              color2={"var(--pink)"}
              delay={2000}
            />
          </div>
        </div>
      </div>
    </Draggable>
  );
}

export default EditGroupModal;