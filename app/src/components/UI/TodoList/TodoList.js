import React from "react";
import styles from "./TodoList.module.css";

function TodoList() {
  return (
    <div className={styles.TodoListContainer}>
      <div className={styles.wrapper}>
        <div className={styles.taskInput}>
          <ion-icon name="create-outline" />
          <input type="text" placeholder="Add a New Task + Enter" />
        </div>
        <div className={styles.controls}>
          <div className={styles.filters}>
            <span className={styles.active} id={styles.all}>
              All
            </span>
            <span id={styles.pending}>Pending</span>
            <span id={styles.completed}>Completed</span>
          </div>
          <button className={styles.clearBtn} id={styles.active}>
            Clear All
          </button>
        </div>
        <ul className={styles.taskBox}>
          <li className={styles.task}>
            <label htmlFor={0}>
              <input
                onClick="updateStatus(this)"
                type="checkbox"
                id={0}
                defaultChecked=""
              />

              <p className={styles.checked}>ddd</p>
            </label>
            <div className={styles.settings}>
              <i
                onClick="showMenu(this)"
                className={`uil uil-ellipsis-h ${styles.originalClass}`}
              />

              <ul className={styles.taskMenu}>
                <li onClick='editTask(0, "ddd")'>
                  <i className={`uil uil-pen ${styles.originalClass}`} />
                  Edit
                </li>
                <li onClick='deleteTask(0, "all")'>
                  <i className={`uil uil-trash ${styles.originalClass}`} />
                  Delete
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TodoList;
