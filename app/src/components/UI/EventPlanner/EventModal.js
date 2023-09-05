import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

export default function EventModal({
  title = "Title",
  isOpen,
  toggle,
  onCancel,
  cancelText,
  onSubmit,
  submitText,
  onDelete,
  deleteText,
  children
}) {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        {/* {state.clickInfo && (
          <Button color="primary" onClick={handleDelete}>
            Delete
          </Button>
        )}
        {state.clickInfo && (
          <Button color="secondary" onClick={handleEdit}>
            Edit
          </Button>
        )} */}
        {onCancel && (
          <Button color="secondary" onClick={onCancel}>
            {cancelText || "Cancel"}
          </Button>
        )}
        {onDelete && (
          <Button color="primary" onClick={onDelete}>
            {deleteText || "Delete"}
          </Button>
        )}
        {onSubmit && (
          <Button color="primary" onClick={onSubmit}>
            {submitText || "Submit"}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
