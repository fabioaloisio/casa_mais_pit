import ConfirmModal from '../common/ConfirmModal';
import PropTypes from 'prop-types';
import '../assistidas/assistidas.css';

const ConfirmDeleteModal = ({ show, onHide, onConfirm, substancia, loading }) => {
  if (!substancia) return null;

  const detailsContent = (
    <div>
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '10px'
        }}
      >
        <strong>{substancia.nome}</strong><br />
        <small className="text-muted">Categoria: {substancia.categoria}</small><br />
        {substancia.descricao && (
          <small className="text-muted">Descrição: {substancia.descricao}</small>
        )}
      </div>
    </div>
  );

  return (
    <ConfirmModal
      show={show}
      onHide={onHide}
      onConfirm={onConfirm}
      title="Confirmar Exclusão"
      message={`Tem certeza que deseja excluir a substância "${substancia.nome}"? Esta ação não pode ser desfeita.`}
      variant="delete"
      confirmLabel="Excluir Substância"
      cancelLabel="Cancelar"
      loading={loading}
      details={detailsContent}
    />
  );
};

ConfirmDeleteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  substancia: PropTypes.object,
  loading: PropTypes.bool
};

ConfirmDeleteModal.defaultProps = {
  substancia: null,
  loading: false
};

export default ConfirmDeleteModal;
