import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

export const DeleteModal = ({
  title,
  children,
  isOpen,
  isLoading,
  onClose,
  onDelete,
}: {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onClose: () => void;
  isOpen: boolean;
  onDelete: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Anuluj
          </Button>
          <Button isLoading={isLoading} colorScheme="red" onClick={onDelete}>
            Usuń
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
