import ConfirmModal from '../common/ConfirmModal';

const ModalExclusaoUnidadeMedida = ({ unidadeMedida, onClose, onConfirm }) => {
  return (
    <ConfirmModal
      show={true}
      onHide={onClose}
      onConfirm={onConfirm}
      title="Confirmar Exclusão"
      message={`Tem certeza que deseja excluir "${unidadeMedida?.nome}"? Esta ação não pode ser desfeita.`}
      variant="delete"
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
    />
  );
};

export default ModalExclusaoUnidadeMedida;