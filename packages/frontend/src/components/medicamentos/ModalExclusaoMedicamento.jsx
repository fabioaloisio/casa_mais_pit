import ConfirmModal from '../common/ConfirmModal';

const ModalExclusaoMedicamento = ({ medicamento, onClose, onConfirm }) => {
  return (
    <ConfirmModal
      show={true}
      onHide={onClose}
      onConfirm={onConfirm}
      title="Confirmar Exclusão"
      message={`Tem certeza que deseja excluir "${medicamento?.nome}"? Esta ação não pode ser desfeita.`}
      variant="delete"
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
    />
  );
};

export default ModalExclusaoMedicamento;