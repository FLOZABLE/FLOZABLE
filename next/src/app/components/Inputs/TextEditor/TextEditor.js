import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./TextEditor.module.css";
import DropDownButton from "../../Buttons/DropDownButton/DropDownButton";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faListOl,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";

const MenuOption = ({ onClick, children }) => {
  return (
    <button className={styles.MenuOption} onClick={onClick}>
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
      >
        <FontAwesomeIcon icon={faItalic} />
      </MenuOption>
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleBold().run();
        }}
      >
        <FontAwesomeIcon icon={faBold} />
      </MenuOption>
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleOrderedList().run();
        }}
      >
        <FontAwesomeIcon icon={faListOl} />
      </MenuOption>
      <MenuOption
        onClick={() => {
          editor.chain().focus().toggleBulletList().run();
        }}
      >
        <FontAwesomeIcon icon={faListUl} />
      </MenuOption>
    </div>
  );
};

export default function TextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      /* Document, // Top-level 'doc' node
      Paragraph, // Default 'p' tag for paragraphs
      Text, // Basic text node */
    ],
    content: "<p>Hello World! 🌎️</p>",
    immediatelyRender: false,
  });

  return (
    <div className={styles.TextEditor}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className={styles.EditorContent} />
    </div>
  );
}
