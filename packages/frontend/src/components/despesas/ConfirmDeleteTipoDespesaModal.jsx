import ConfirmModal from '../common/ConfirmModal';

const ConfirmDeleteTipoDespesaModal = ({ show, onHide, onConfirm, tipoDespesa, loading = false }) => {
  const details = tipoDespesa ? (
    <>
      <p className="mb-1"><strong>Nome:</strong> {tipoDespesa.nome}</p>
      {tipoDespesa.descricao && (
        <p className="mb-1"><strong>Descrição:</strong> {tipoDespesa.descricao}</p>
      )}
      <p className="mb-0"><strong>Status:</strong> {tipoDespesa.ativo ? 'Ativo' : 'Inativo'}</p>
    </>
  ) : null;

  return (
    <ConfirmModal
      show={show}
      onHide={onHide}
      onConfirm={onConfirm}
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir este tipo de despesa? Esta ação não pode ser desfeita."
      variant="delete"
      confirmLabel="Excluir"
      details={details}
      loading={loading}
    />
  );
};

export default ConfirmDeleteTipoDespesaModal;