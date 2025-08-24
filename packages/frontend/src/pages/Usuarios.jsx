import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Form } from 'react-bootstrap'
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa'
import UsuarioModal from '../components/usuarios/UsuarioModal'
import ConfirmModal from '../components/common/ConfirmModal'
import './Usuarios.css'
import './Doacoes.css'

function Usuarios() {
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null)

  const [usuarios] = useState([
    {
      id: 1,
      nome: 'Juliano Campos',
      email: 'juliano.kampus@gmail.com',
      tipo: 'Administrador'
    },
    {
      id: 2,
      nome: 'Aldruin Bonfim de Lima Souza',
      email: 'aldruin.lima@gmail.com',
      tipo: 'Administrador'
    },
    {
      id: 3,
      nome: 'Fabio Aloisio Gonçalves',
      email: 'fabio.aloisio@gmail.com',
      tipo: 'Administrador'
    }
  ])

  const handleClose = () => {
    setShowModal(false)
    setUsuarioSelecionado(null)
  }

  const handleShow = (usuario = null) => {
    setUsuarioSelecionado(usuario)
    setShowModal(true)
  }

  const handleSave = async (formData) => {
    if (usuarioSelecionado) {
      console.log('Atualizar usuário:', usuarioSelecionado.id, formData)
    } else {
      console.log('Cadastrar usuário:', formData)
    }
  }

  const handleDeleteClick = (usuario) => {
    setUsuarioParaExcluir(usuario)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    console.log('Excluir usuário:', usuarioParaExcluir.id)
    setShowDeleteModal(false)
    setUsuarioParaExcluir(null)
  }

  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.email.toLowerCase().includes(filtro.toLowerCase())
  )

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
            {usuariosFiltrados.length === 0 ? (
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
                    <span className={`status ${usuario.tipo === 'Administrador' ? 'ativa' : 'tratamento'}`}>
                      {usuario.tipo}
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
            <p className="mb-0"><strong>Tipo:</strong> {usuarioParaExcluir.tipo}</p>
          </>
        )}
      />
    </div>
  )
}

export default Usuarios