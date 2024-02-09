import React from "react";
import { useState, useEffect } from 'react';
import styles from "./SubjectToolManager.module.css";

function SubjectToolManager({ subject, isSubjectToolManager }) {

    return (
        <div className={styles.SubjectToolManager}>
            <div className={isSubjectToolManager ? styles.open : styles.hidden}>
                Manage!!
            </div>
        </div>
    );
}

export default SubjectToolManager;