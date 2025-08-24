import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Form } from 'react-bootstrap'
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa'
import { toast } from 'react-toastify'
import UsuarioModal from '../components/usuarios/UsuarioModal'
import ConfirmModal from '../components/common/ConfirmModal'
import usuarioService from '../services/usuarioService'
import { useAuth } from '../contexts/AuthContext'
import { mapUserType } from '../utils/userTypes'
import './Usuarios.css'
import './Doacoes.css'

function Usuarios() {
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null)
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <div className="text-muted">Carregando...</div>
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
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
                    <span className={`status ${mapUserType(usuario.tipo) === 'Administrador' ? 'ativa' : 'tratamento'}`}>
                      {mapUserType(usuario.tipo)}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        className="d-flex align-items-center gap-1 btn-outline-custom btn-sm fs-7"
                        onClick={() => handleShow(usuario)}
                      >
                        <FaEdit /> Editar
                      </Button>
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
    </div>
  )
}

export default Usuarios