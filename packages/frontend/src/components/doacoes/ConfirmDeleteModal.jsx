import ConfirmModal from '../common/ConfirmModal';

const ConfirmDeleteModal = ({ show, onHide, onConfirm, doacao }) => {
  const details = doacao ? (
    <>
      <p className="mb-1"><strong>Doador:</strong> {doacao.nomeDoador}</p>
      <p className="mb-1"><strong>Valor:</strong> R$ {doacao.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      <p className="mb-0"><strong>Data:</strong> {new Date(doacao.dataDoacao).toLocaleDateString('pt-BR')}</p>
    </>
  ) : null;

  return (
    <ConfirmModal
      show={show}
      onHide={onHide}
      onConfirm={onConfirm}
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita."
      variant="delete"
      confirmLabel="Excluir"
      details={details}
    />
  );
};

export default ConfirmDeleteModal;