import ConfirmModal from '../common/ConfirmModal';
import { formatMoney } from '../../utils/masks';

const ConfirmDeleteModal = ({ show, onHide, onConfirm, despesa, loading = false }) => {
  const details = despesa ? (
    <>
      <p className="mb-1"><strong>Descrição:</strong> {despesa.descricao}</p>
      <p className="mb-1"><strong>Categoria:</strong> {despesa.categoria}</p>
      <p className="mb-1"><strong>Valor:</strong> {formatMoney(despesa.valor)}</p>
      <p className="mb-1"><strong>Data:</strong> {new Date(despesa.data_despesa).toLocaleDateString('pt-BR')}</p>
      {despesa.fornecedor && (
        <p className="mb-0"><strong>Fornecedor:</strong> {despesa.fornecedor}</p>
      )}
    </>
  ) : null;

  return (
    <ConfirmModal
      show={show}
      onHide={onHide}
      onConfirm={onConfirm}
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
      variant="delete"
      confirmLabel="Excluir"
      details={details}
      loading={loading}
    />
  );
};

export default ConfirmDeleteModal;