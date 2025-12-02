import React, { useState } from 'react';
import { Button, Dropdown, Modal, Form, Alert } from 'react-bootstrap';
import { FaEllipsisV, FaCheck, FaTimes, FaLock, FaLockOpen, FaPause, FaPlay, FaHistory } from 'react-icons/fa';

const StatusActions = ({ usuario, onStatusChange, onShowHistory }) => {
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [motivo, setMotivo] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAvailableActions = (status) => {
    const actions = {
      'pendente': [
        { key: 'approve', label: 'Aprovar', icon: FaCheck, variant: 'success' },
        { key: 'reject', label: 'Rejeitar', icon: FaTimes, variant: 'danger', requiresReason: true }
      ],
      'aprovado': [],
      'ativo': [
        { key: 'block', label: 'Bloquear', icon: FaLock, variant: 'danger', requiresReason: true },
        { key: 'suspend', label: 'Suspender', icon: FaPause, variant: 'warning', requiresReason: true, requiresDate: true }
      ],
      'rejeitado': [],
      'bloqueado': [
        { key: 'unblock', label: 'Desbloquear', icon: FaLockOpen, variant: 'success' }
      ],
      'suspenso': [
        { key: 'reactivate', label: 'Reativar', icon: FaPlay, variant: 'success' },
        { key: 'block', label: 'Bloquear', icon: FaLock, variant: 'danger', requiresReason: true }
      ],
      'inativo': [
        { key: 'reactivate', label: 'Reativar', icon: FaPlay, variant: 'success' }
      ]
    };

    return actions[status] || [];
  };

  const availableActions = getAvailableActions(usuario.status);

  const handleActionClick = (action) => {
    setActionType(action.key);
    setMotivo('');
    setDataFim('');
    setError('');

    if (action.requiresReason || action.requiresDate) {
      setShowModal(true);
    } else {
      // Call handleConfirmAction with the action type directly
      handleConfirmActionDirect(action.key);
    }
  };

  const handleConfirmActionDirect = async (directActionType) => {
    setLoading(true);
    setError('');

    try {
      await onStatusChange(usuario.id, directActionType, {});
      setMotivo('');
      setDataFim('');
    } catch (err) {
      setError(err.message || 'Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    setLoading(true);
    setError('');

    try {
      let payload = {};

      if (['reject', 'block', 'suspend'].includes(actionType)) {
        if (!motivo.trim()) {
          setError('Motivo é obrigatório');
          setLoading(false);
          return;
        }
        payload.motivo = motivo;
      }

      if (actionType === 'suspend') {
        if (!dataFim) {
          setError('Data fim da suspensão é obrigatória');
          setLoading(false);
          return;
        }
        payload.dataFim = dataFim;
      }

      await onStatusChange(usuario.id, actionType, payload);
      setShowModal(false);
      setMotivo('');
      setDataFim('');
    } catch (err) {
      setError(err.message || 'Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    const titles = {
      'approve': 'Aprovar Usuário',
      'reject': 'Rejeitar Usuário',
      'block': 'Bloquear Usuário',
      'unblock': 'Desbloquear Usuário',
      'suspend': 'Suspender Usuário',
      'reactivate': 'Reativar Usuário'
    };

    return titles[actionType] || 'Confirmar Ação';
  };

  const getConfirmationMessage = () => {
    const messages = {
      'approve': `Tem certeza que deseja aprovar o usuário ${usuario.nome}?`,
      'reject': `Tem certeza que deseja rejeitar o usuário ${usuario.nome}?`,
      'block': `Tem certeza que deseja bloquear o usuário ${usuario.nome}?`,
      'unblock': `Tem certeza que deseja desbloquear o usuário ${usuario.nome}?`,
      'suspend': `Tem certeza que deseja suspender o usuário ${usuario.nome}?`,
      'reactivate': `Tem certeza que deseja reativar o usuário ${usuario.nome}?`
    };

    return messages[actionType] || 'Tem certeza que deseja executar esta ação?';
  };

  if (availableActions.length === 0 && !onShowHistory) {
    return null;
  }

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle
          variant="outline-secondary"
          size="sm"
          id={`dropdown-${usuario.id}`}
        >
          <FaEllipsisV />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {availableActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Dropdown.Item
                key={action.key}
                onClick={() => handleActionClick(action)}
                className={`text-${action.variant}`}
              >
                <IconComponent className="me-2" />
                {action.label}
              </Dropdown.Item>
            );
          })}

          {onShowHistory && (
            <>
              {availableActions.length > 0 && <Dropdown.Divider />}
              <Dropdown.Item onClick={() => onShowHistory(usuario.id)}>
                <FaHistory className="me-2" />
                Histórico
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <p>{getConfirmationMessage()}</p>

          {['reject', 'block', 'suspend'].includes(actionType) && (
            <Form.Group className="mb-3">
              <Form.Label>Motivo *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Informe o motivo desta ação..."
              />
            </Form.Group>
          )}

          {actionType === 'suspend' && (
            <Form.Group className="mb-3">
              <Form.Label>Data Fim da Suspensão *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmAction}
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Confirmar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StatusActions;