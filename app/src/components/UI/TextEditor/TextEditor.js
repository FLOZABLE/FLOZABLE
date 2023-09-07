import React from "react";
import ReactQuill from "react-quill";
import styles from "./TextEditor.module.css";
import 'react-quill/dist/quill.snow.css';
import styled from "@emotion/styled";
const StyleWrapper = styled.div`
.ql-container {
  max-height: 250px;
  overflow-y: auto;
}
.ql-container::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	border-radius: 10px;

}

.ql-container::-webkit-scrollbar
{
	width: 12px;

}

.ql-container::-webkit-scrollbar-thumb
{
	border-radius: 10px;
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
	background-color: #555555;
}

`;
function TextEditor() {
  return (
    <div className={styles.TextEditor}>
      <StyleWrapper>
        <ReactQuill theme="snow" />
      </StyleWrapper>
    </div>
  );
};

export default TextEditor;