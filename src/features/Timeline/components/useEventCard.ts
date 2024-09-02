import { useState } from "react";

export default function useEventCard(id: string, onDeletePostClick: Function) {
  const [openModal, setOpenModal] = useState(false);

  const onModalOpen = () => {
    setOpenModal(true);
  };
  const onDeleteClick = () => {
    onDeletePostClick(id);
  }

  const onModalClose = () => {
    setOpenModal(false);
  }
  return {
    openModal,
    onDeleteClick,
    onModalOpen,
    onModalClose
  };
}