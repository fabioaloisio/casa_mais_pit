import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Form } from 'react-bootstrap'
import { FaEdit, FaTrash, FaPlus, FaSearch, FaLock, FaUnlock } from 'react-icons/fa'
import { toast } from 'react-toastify'
import UsuarioModal from '../components/usuarios/UsuarioModal'
import StatusBadge from '../components/usuarios/StatusBadge'
import StatusActions from '../components/usuarios/StatusActions'
import StatusHistory from '../components/usuarios/StatusHistory'
import ConfirmModal from '../components/common/ConfirmModal'
import usuarioService from '../services/usuarioService'
import apiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { mapUserType } from '../utils/userTypes'
import './Usuarios.css'
import './Doacoes.css'

function Usuarios() {
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showStatusHistory, setShowStatusHistory] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null)
  const [usuarioParaBloquear, setUsuarioParaBloquear] = useState(null)
  const [usuarioHistorico, setUsuarioHistorico] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAdmin } = useAuth()

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await usuarioService.listarTodos()
      if (response.success) {
        setUsuarios(response.data)
      } else {
        toast.error('Erro ao carregar usuários')
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      if (error.status === 403) {
        toast.error('Apenas administradores podem acessar esta funcionalidade')
      } else {
        toast.error('Erro ao carregar usuários')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin()) {
      carregarUsuarios()
    } else {
      setLoading(false)
    }
  }, [])

  const handleClose = () => {
    setShowModal(false)
    setUsuarioSelecionado(null)
  }

  const handleShow = (usuario = null) => {
    if (!isAdmin()) {
      toast.error('Apenas administradores podem gerenciar usuários')
      return
    }
    setUsuarioSelecionado(usuario)
    setShowModal(true)
  }

  const handleSave = async (formData) => {
    try {
      let response
      if (usuarioSelecionado) {
        response = await usuarioService.atualizarUsuario(usuarioSelecionado.id, formData)
        toast.success('Usuário atualizado com sucesso!')
      } else {
        response = await usuarioService.criarUsuario(formData)
        toast.success('Usuário cadastrado com sucesso!')
      }
      
      if (response.success) {
        await carregarUsuarios()
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      
      // Verificar se o erro tem uma mensagem específica
      if (error.message) {
        toast.error(error.message)
      } else if (error.status === 400) {
        toast.error('Dados inválidos - verifique os campos obrigatórios')
      } else if (error.status === 403) {
        toast.error('Permissão negada - apenas administradores podem criar usuários')
      } else {
        toast.error('Erro ao salvar usuário - tente novamente')
      }
    }
  }

  const handleDeleteClick = (usuario) => {
    if (!isAdmin()) {
      toast.error('Apenas administradores podem excluir usuários')
      return
    }
    setUsuarioParaExcluir(usuario)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await usuarioService.excluirUsuario(usuarioParaExcluir.id)
      if (response.success) {
        toast.success('Usuário removido com sucesso!')
        await carregarUsuarios()
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      
      if (error.status === 400) {
        toast.error('Você não pode excluir sua própria conta')
      } else {
        toast.error('Erro ao excluir usuário')
      }
    } finally {
      setShowDeleteModal(false)
      setUsuarioParaExcluir(null)
    }
  }

  const handleBlockClick = (usuario) => {
    if (!isAdmin()) {
      toast.error('Apenas administradores podem bloquear/desbloquear usuários')
      return
    }
    setUsuarioParaBloquear(usuario)
    setShowBlockModal(true)
  }

  const handleBlockConfirm = async () => {
    try {
      const novoStatus = !usuarioParaBloquear.ativo
      const response = await usuarioService.alterarStatus(usuarioParaBloquear.id, novoStatus)
      
      if (response.success) {
        toast.success(`Usuário ${novoStatus ? 'desbloqueado' : 'bloqueado'} com sucesso!`)
        await carregarUsuarios()
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      
      if (error.status === 400) {
        toast.error('Você não pode bloquear sua própria conta')
      } else {
        toast.error('Erro ao alterar status do usuário')
      }
    } finally {
      setShowBlockModal(false)
      setUsuarioParaBloquear(null)
    }
  }

  // Nova função para lidar com mudanças de status
  const handleStatusChange = async (usuarioId, action, payload = {}) => {
    try {
      const data = await apiService.post(`/usuarios/${usuarioId}/${action}`, payload)

      toast.success(data.message || 'Status alterado com sucesso!')
      await carregarUsuarios()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      throw error
    }
  }

  // Função para mostrar histórico de status
  const handleShowHistory = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId)
    setUsuarioHistorico(usuario)
    setShowStatusHistory(true)
  }

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.email.toLowerCase().includes(filtro.toLowerCase())
  )

  if (!isAdmin()) {
    return (
      <div className="conteudo">
        <div className="topo">
          <h1>Acesso Negado</h1>
          <p>Apenas administradores podem acessar a gestão de usuários.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Gestão de Usuários</h1>
        <p>
          Gerencie os usuários do sistema, seus perfis de acesso e permissões. 
          Aqui você pode adicionar, editar ou remover usuários.
        </p>
      </div>

      <div className="filtros mb-4">
        <Button 
          className="azul d-flex align-items-center gap-2"
          onClick={() => handleShow()}
        >
          <FaPlus /> Novo Usuário
        </Button>

        <div className="d-flex align-items-center gap-2">
          <FaSearch className="text-muted" />
          <Form.Control
            type="text"
            placeholder="Filtrar por nome ou e-mail..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            id="filtroUsuario"
          />
        </div>
      </div>

      <div className="tabela-container">
        <Table className="tabela-assistidas" hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Informações Adicionais</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">Carregando...</div>
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">
                    <p className="mb-0">Nenhum usuário encontrado</p>
                    <small>Clique em "Novo Usuário" para começar</small>
                  </div>
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map(usuario => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td className="fw-medium">{usuario.nome}</td>
                  <td className="text-muted">{usuario.email}</td>
                  <td>
                    <span className={`status ${
                      mapUserType(usuario.tipo) === 'Administrador' ? 'ativa' :
                      mapUserType(usuario.tipo) === 'Financeiro' ? 'inativa' :
                      'tratamento'
                    }`}>
                      {mapUserType(usuario.tipo)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={usuario.status} />
                  </td>
                  <td>
                    <div className="text-small text-muted">
                      {usuario.status === 'pendente' && (
                        <div>Aguardando aprovação</div>
                      )}
                      {usuario.status === 'aprovado' && (
                        <div>
                          Aprovado por: {usuario.aprovado_por_nome || 'N/A'}
                          {usuario.data_aprovacao && (
                            <div>Em: {new Date(usuario.data_aprovacao).toLocaleDateString('pt-BR')}</div>
                          )}
                        </div>
                      )}
                      {usuario.status === 'bloqueado' && (
                        <div>
                          {usuario.motivo_bloqueio && (
                            <div>Motivo: {usuario.motivo_bloqueio}</div>
                          )}
                          {usuario.bloqueado_por_nome && (
                            <div>Por: {usuario.bloqueado_por_nome}</div>
                          )}
                        </div>
                      )}
                      {usuario.status === 'suspenso' && (
                        <div>
                          {usuario.data_fim_suspensao && (
                            <div>Até: {new Date(usuario.data_fim_suspensao).toLocaleDateString('pt-BR')}</div>
                          )}
                          {usuario.suspenso_por_nome && (
                            <div>Por: {usuario.suspenso_por_nome}</div>
                          )}
                        </div>
                      )}
                      {usuario.data_ultimo_acesso && (
                        <div>Último acesso: {new Date(usuario.data_ultimo_acesso).toLocaleDateString('pt-BR')}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-1 align-items-center">
                      <Button
                        className="d-flex align-items-center gap-1 btn-outline-custom btn-sm fs-7"
                        onClick={() => handleShow(usuario)}
                      >
                        <FaEdit /> Editar
                      </Button>

                      <StatusActions
                        usuario={usuario}
                        onStatusChange={handleStatusChange}
                        onShowHistory={handleShowHistory}
                      />

                      <Button
                        className="d-flex align-items-center gap-1 btn-sm fs-7"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(usuario)}
                      >
                        <FaTrash /> Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <UsuarioModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        usuario={usuarioSelecionado}
      />

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        variant="delete"
        confirmLabel="Excluir"
        details={usuarioParaExcluir && (
          <>
            <p className="mb-1"><strong>Nome:</strong> {usuarioParaExcluir.nome}</p>
            <p className="mb-1"><strong>E-mail:</strong> {usuarioParaExcluir.email}</p>
            <p className="mb-0"><strong>Tipo:</strong> {mapUserType(usuarioParaExcluir.tipo)}</p>
          </>
        )}
      />

      <ConfirmModal
        show={showBlockModal}
        onHide={() => setShowBlockModal(false)}
        onConfirm={handleBlockConfirm}
        title={usuarioParaBloquear?.ativo !== false ? "Bloquear Usuário" : "Desbloquear Usuário"}
        message={
          usuarioParaBloquear?.ativo !== false 
            ? "Tem certeza que deseja bloquear este usuário? O usuário não poderá acessar o sistema." 
            : "Tem certeza que deseja desbloquear este usuário? O usuário voltará a ter acesso ao sistema."
        }
        variant={usuarioParaBloquear?.ativo !== false ? "warning" : "success"}
        confirmLabel={usuarioParaBloquear?.ativo !== false ? "Bloquear" : "Desbloquear"}
        details={usuarioParaBloquear && (
          <>
            <p className="mb-1"><strong>Nome:</strong> {usuarioParaBloquear.nome}</p>
            <p className="mb-1"><strong>E-mail:</strong> {usuarioParaBloquear.email}</p>
            <p className="mb-1"><strong>Tipo:</strong> {mapUserType(usuarioParaBloquear.tipo)}</p>
            <p className="mb-0"><strong>Status Atual:</strong> {usuarioParaBloquear.ativo !== false ? 'Ativo' : 'Bloqueado'}</p>
          </>
        )}
      />

      <StatusHistory
        show={showStatusHistory}
        onHide={() => {
          setShowStatusHistory(false)
          setUsuarioHistorico(null)
        }}
        usuarioId={usuarioHistorico?.id}
        usuarioNome={usuarioHistorico?.nome}
      />
    </div>
  )
}

export default Usuarios