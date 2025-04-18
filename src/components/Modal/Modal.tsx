import React from "react";
import styles from "./Modal.module.css";
import { Button } from "../";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "default" | "delete";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  type = "default",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBody}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <Button 
            onClick={onClose} 
            className={styles.modalClose}
            variant="text"
            startIcon={<FaTimes size={16} />}
            title="Закрыть"
          />
        </div>
        <div className={styles.modalContent}>{children}</div>
        {onConfirm && (
          <div className={styles.modalFooter}>
            <Button 
              onClick={onClose} 
              className={styles.cancelButton}
              variant="secondary"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={styles.confirmButton}
              variant={type === "delete" ? "danger" : "primary"}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
