import { Form, Alert } from 'react-bootstrap'
import PropTypes from 'prop-types'
import BaseModal from './BaseModal'

function FormModal({
  show,
  onHide,
  onSubmit,
  title,
  children,
  size = 'lg',
  loading = false,
  error = null,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  validated = false
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSubmit(e)
  }

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title={title}
      size={size}
      loading={loading}
      primaryLabel={submitLabel}
      cancelLabel={cancelLabel}
      footer={false}
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {children}

        <div className="d-flex justify-content-end gap-2 mt-4">
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
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              backgroundColor: '#0d6efd',
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
            ) : submitLabel}
          </button>
        </div>
      </Form>
    </BaseModal>
  )
}

FormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  loading: PropTypes.bool,
  error: PropTypes.string,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  validated: PropTypes.bool
}

export default FormModal