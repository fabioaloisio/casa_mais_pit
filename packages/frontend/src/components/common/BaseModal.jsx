import { Modal, Button, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'

function BaseModal({ 
  show, 
  onHide, 
  title, 
  children, 
  size = 'md',
  centered = true,
  footer,
  primaryAction,
  primaryLabel = 'Salvar',
  primaryVariant = 'primary',
  cancelLabel = 'Cancelar',
  loading = false,
  closeButton = true,
  backdrop = true,
  keyboard = true,
  className = ''
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={backdrop}
      keyboard={keyboard}
      className={className}
    >
      <Modal.Header closeButton={closeButton}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {children}
      </Modal.Body>

      {(footer !== false) && (
        <Modal.Footer>
          {footer || (
            <>
              <Button 
                variant="secondary" 
                onClick={onHide}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              {primaryAction && (
                <Button 
                  variant={primaryVariant}
                  onClick={primaryAction}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Processando...
                    </>
                  ) : primaryLabel}
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      )}
    </Modal>
  )
}

BaseModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  centered: PropTypes.bool,
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
  primaryAction: PropTypes.func,
  primaryLabel: PropTypes.string,
  primaryVariant: PropTypes.string,
  cancelLabel: PropTypes.string,
  loading: PropTypes.bool,
  closeButton: PropTypes.bool,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  keyboard: PropTypes.bool,
  className: PropTypes.string
}

export default BaseModal