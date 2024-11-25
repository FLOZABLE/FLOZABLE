import React from "react";
//import ReactQuill from "react-quill";
import styles from "./TextEditor.module.css";
import "react-quill/dist/quill.snow.css";
import styled from "@emotion/styled";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

const StyleWrapper = styled.div`
  .ql-container {
    max-height: 15.625rem;
    overflow-y: auto;
    border-bottom-right-radius: 0.625rem;
    border-bottom-left-radius: 0.625rem;
  }
  .ql-toolbar {
    border-top-right-radius: 0.625rem;
    border-top-left-radius: 0.625rem;
  }
  .ql-container::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, 0.3);
    border-radius: 0.625rem;
  }

  .ql-container::-webkit-scrollbar {
    width: 0.75rem;
  }

  .ql-container::-webkit-scrollbar-thumb {
    border-radius: 0.625rem;
    -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, 0.3);
    background-color: #555555;
  }
`;
function TextEditor({ value, setValue }) {
  return (
    <div className={styles.TextEditor}>
      <StyleWrapper>
        {/* <ReactQuill theme="snow" onChange={setValue} value={value} /> */}
      </StyleWrapper>
    </div>
  );
}

export default TextEditor;
