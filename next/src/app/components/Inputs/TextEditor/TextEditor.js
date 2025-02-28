import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./TextEditor.module.css";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faListOl,
  faListUl,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import Underline from "@tiptap/extension-underline";

const MenuOption = ({ onClick, children, mode, editor }) => {
  return (
    <button
      className={`${styles.MenuOption} ${
        editor.isActive(mode) ? styles.active : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const MenuBar = ({ editor }) => {
  const [textMode, setTextMode] = useState(0);

  useEffect(() => {
    if (!editor) return;

    if (textMode === 0) {
      editor.chain().focus().setNode("paragraph").run();
    } else {
      editor.chain().focus().toggleHeading({ level: textMode }).run();
    }
  }, [textMode, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.MenuBar}>
      <DropDownButton
        options={[
          { name: "Heading 1", value: 1 },
          { name: "Heading 2", value: 2 },
          { name: "Heading 3", value: 3 },
          { name: "Paragraph", value: 0 },
        ]}
        setValue={setTextMode}
        value={textMode}
      />
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleItalic().run();
        }}
        editor={editor}
        mode={"italic"}
      >
        <FontAwesomeIcon icon={faItalic} />
      </MenuOption>
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleBold().run();
        }}
        editor={editor}
        mode={"bold"}
      >
        <FontAwesomeIcon icon={faBold} />
      </MenuOption>
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleOrderedList().run();
        }}
        editor={editor}
        mode={"italic"}
      >
        <FontAwesomeIcon icon={faListOl} />
      </MenuOption>
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleUnderline().run();
        }}
        editor={editor}
        mode={"orderedList"}
      >
        <FontAwesomeIcon icon={faUnderline} />
      </MenuOption>
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
        editor={editor}
        mode={"bulletList"}
      >
        <FontAwesomeIcon icon={faListUl} />
      </MenuOption>
    </div>
  );
};

export default function TextEditor({ value, setValue }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
    content: value,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className={styles.TextEditor}>
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className={styles.EditorContent}
        content={value}
      />
    </div>
  );
}
