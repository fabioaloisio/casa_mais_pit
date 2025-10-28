import { Modal, Button, Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaUserSlash, FaUserCheck } from 'react-icons/fa';

function ReactivationConfirmDialog({ show, onHide, onConfirm, inactiveUser, newUserData, loading }) {
  if (!inactiveUser) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title>
          <FaExclamationTriangle className="me-2" />
          Email Já Cadastrado
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>
            <FaUserSlash className="me-2" />
            Usuário Inativo Encontrado
          </Alert.Heading>
          <p className="mb-0">
            O email <strong>{inactiveUser.inactiveUserEmail}</strong> pertence a um usuário que foi desativado anteriormente.
          </p>
        </Alert>

        <div className="row">
          <div className="col-md-6">
            <div className="card border-danger mb-3">
              <div className="card-header bg-danger text-white">
                <strong>Dados Atuais (Inativo)</strong>
              </div>
              <div className="card-body">
                <p><strong>Nome:</strong> {inactiveUser.inactiveUserName}</p>
                <p><strong>Email:</strong> {inactiveUser.inactiveUserEmail}</p>
                <p className="mb-0"><strong>Tipo:</strong> {inactiveUser.inactiveUserType}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-success mb-3">
              <div className="card-header bg-success text-white">
                <strong>Novos Dados</strong>
              </div>
              <div className="card-body">
                <p><strong>Nome:</strong> {newUserData.nome}</p>
                <p><strong>Email:</strong> {newUserData.email}</p>
                <p className="mb-0"><strong>Tipo:</strong> {newUserData.tipo}</p>
              </div>
            </div>
          </div>
        </div>

        <Alert variant="info" className="mt-3">
          <p className="mb-2">
            <FaUserCheck className="me-2" />
            <strong>O que acontecerá ao confirmar a reativação:</strong>
          </p>
          <ul className="mb-0">
            <li>O usuário será reativado no sistema</li>
            <li>Os dados serão atualizados com as novas informações</li>
            <li>Um email será enviado para que o usuário defina uma nova senha</li>
            <li>O histórico anterior do usuário será preservado</li>
          </ul>
        </Alert>

        <Alert variant="warning" className="mt-3 mb-0">
          <strong>Atenção:</strong> Esta ação não pode ser desfeita automaticamente.
          O usuário receberá um email e terá acesso ao sistema após definir uma nova senha.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          {loading ? 'Reativando...' : 'Reativar Usuário'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ReactivationConfirmDialog;
