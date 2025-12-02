import { useState, useEffect } from 'react'
import { Card, Table, Button, Badge, Modal, Form, Spinner, Alert } from 'react-bootstrap'
import { FaCheck, FaTimes, FaEnvelope, FaUser } from 'react-icons/fa'
import Toast from '../common/Toast'

function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast] = useState(null)
  
  // Carrega usuários pendentes
  const loadPendingUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('Token não encontrado')
        setToast({
          show: true,
          message: 'Você precisa estar logado para acessar esta funcionalidade',
          type: 'danger'
        })
        setLoading(false)
        return
      }
      
      // Debug: verificar token
      console.log('Token recuperado:', token)
      console.log('Token length:', token?.length)
      console.log('Token starts with Bearer:', token?.startsWith('Bearer'))
      
      const response = await fetch('http://localhost:3003/api/approval/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data.data || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao carregar usuários pendentes')
      }
    } catch (error) {
      console.error('Erro:', error)
      setToast({
        show: true,
        message: 'Erro ao carregar usuários pendentes',
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadPendingUsers()
  }, [])
  
  // Aprovar usuário
  const handleApprove = async (user) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setToast({
          show: true,
          message: 'Você precisa estar logado para aprovar usuários',
          type: 'danger'
        })
        return
      }
      
      const response = await fetch(`http://localhost:3003/api/approval/${user.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setToast({
          show: true,
          message: `Usuário ${user.nome} aprovado com sucesso! Email de ativação enviado.`,
          type: 'success'
        })
        loadPendingUsers() // Recarrega lista
      } else {
        throw new Error('Erro ao aprovar usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      setToast({
        show: true,
        message: 'Erro ao aprovar usuário',
        type: 'danger'
      })
    }
  }
  
  // Abrir modal de rejeição
  const handleRejectClick = (user) => {
    setSelectedUser(user)
    setRejectReason('')
    setShowRejectModal(true)
  }
  
  // Rejeitar usuário
  const handleReject = async () => {
    if (!selectedUser) return
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setToast({
          show: true,
          message: 'Você precisa estar logado para rejeitar usuários',
          type: 'danger'
        })
        return
      }
      
      const response = await fetch(`http://localhost:3003/api/approval/${selectedUser.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo: rejectReason })
      })
      
      if (response.ok) {
        setToast({
          show: true,
          message: `Usuário ${selectedUser.nome} rejeitado.`,
          type: 'info'
        })
        setShowRejectModal(false)
        loadPendingUsers()
      } else {
        throw new Error('Erro ao rejeitar usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      setToast({
        show: true,
        message: 'Erro ao rejeitar usuário',
        type: 'danger'
      })
    }
  }
  
  // Reenviar email de ativação
  const handleResendEmail = async (user) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setToast({
          show: true,
          message: 'Você precisa estar logado para reenviar emails',
          type: 'danger'
        })
        return
      }
      
      const response = await fetch(`http://localhost:3003/api/approval/${user.id}/resend-activation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setToast({
          show: true,
          message: `Email de ativação reenviado para ${user.nome}`,
          type: 'success'
        })
      } else {
        throw new Error('Erro ao reenviar email')
      }
    } catch (error) {
      console.error('Erro:', error)
      setToast({
        show: true,
        message: 'Erro ao reenviar email',
        type: 'danger'
      })
    }
  }
  
  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Carregando usuários pendentes...</p>
        </Card.Body>
      </Card>
    )
  }
  
  return (
    <>
      <Card>
        <Card.Header className="bg-warning text-dark">
          <h5 className="mb-0">
            <FaUser className="me-2" />
            Usuários Pendentes de Aprovação
            {pendingUsers.length > 0 && (
              <Badge bg="danger" className="ms-2">{pendingUsers.length}</Badge>
            )}
          </h5>
        </Card.Header>
        <Card.Body>
          {pendingUsers.length === 0 ? (
            <Alert variant="info" className="mb-0">
              <FaCheck className="me-2" />
              Não há usuários pendentes de aprovação no momento.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Data Cadastro</th>
                  <th>Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.data_cadastro).toLocaleDateString('pt-BR')}</td>
                    <td>
                      {user.status === 'pendente' && (
                        <Badge bg="warning" text="dark">Pendente</Badge>
                      )}
                      {user.status === 'aprovado' && (
                        <Badge bg="info">Aprovado - Aguardando Ativação</Badge>
                      )}
                    </td>
                    <td className="text-center">
                      {user.status === 'pendente' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApprove(user)}
                            title="Aprovar usuário"
                          >
                            <FaCheck />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectClick(user)}
                            title="Rejeitar usuário"
                          >
                            <FaTimes />
                          </Button>
                        </>
                      )}
                      {user.status === 'aprovado' && (
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleResendEmail(user)}
                          title="Reenviar email de ativação"
                        >
                          <FaEnvelope />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de Rejeição */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rejeitar Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja rejeitar o usuário <strong>{selectedUser?.nome}</strong>?</p>
          <Form.Group>
            <Form.Label>Motivo da rejeição (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Informe o motivo da rejeição..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Confirmar Rejeição
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Toast de notificação */}
      {toast && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}

export default PendingApprovals