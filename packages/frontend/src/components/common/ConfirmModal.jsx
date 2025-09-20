import { Alert } from 'react-bootstrap'
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTrash } from 'react-icons/fa'
import PropTypes from 'prop-types'
import BaseModal from './BaseModal'

const variantIcons = {
  danger: FaExclamationTriangle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
  success: FaCheckCircle,
  delete: FaTrash
}

function ConfirmModal({
  show,
  onHide,
  onConfirm,
  title = 'Confirmar Ação',
  message,
  variant = 'warning',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  details = null
}) {
  const Icon = variantIcons[variant] || variantIcons.info
  const alertVariant = variant === 'delete' ? 'danger' : variant

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title={title}
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn"
            onClick={onHide}
            disabled={loading}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '6px'
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn"
            onClick={onConfirm}
            disabled={loading}
            style={{
              backgroundColor: variant === 'delete' ? '#dc3545' : '#0d6efd',
              color: 'white',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '6px'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processando...
              </>
            ) : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="text-center mb-3">
        <Icon
          size={64}
          className={`text-${alertVariant} mb-3`}
        />
      </div>

      {message && (
        <Alert variant={alertVariant} className="mb-3">
          {message}
        </Alert>
      )}

      {details && (
        <div className="bg-light p-3 rounded">
          {details}
        </div>
      )}
    </BaseModal>
  )
}

ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'info', 'success', 'delete']),
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  loading: PropTypes.bool,
  details: PropTypes.node
}

export default ConfirmModal
