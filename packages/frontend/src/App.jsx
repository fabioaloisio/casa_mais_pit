import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from 'react-toastify'
import Layout from './components/Layout'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import ActivateAccount from './pages/ActivateAccount'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import CadastroUsuario from './pages/CadastroUsuario'
import Assistidas from './pages/Assistidas'
import DetalhesAssistida from './pages/DetalhesAssistida'
import Consultas from './pages/Consultas'
import AgendarConsulta from './pages/AgendarConsulta'
import Medicamentos from './pages/GerenciarMedicamentos'
import Doadores from './pages/Doadores'
import Doacoes from './pages/Doacoes'
import Despesas from './pages/Despesas'
import LancarDespesa from './pages/LancarDespesa'
import EstoqueEntradas from './pages/EstoqueEntradas'
import EstoqueSaidas from './pages/EstoqueSaidas'
import Unidadesmedida from './pages/GerenciarUnidadesMedida'
import GerenciarTiposDespesas from './pages/GerenciarTiposDespesas'
import Internacoes from './pages/Internacoes'
import Caixa from './pages/Caixa'
import Campanhas from './pages/Campanhas'
import Relatorios from './pages/Relatorios'
import TitleHandler from "./components/TitleHandler";
import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import Substancias from './pages/substancias-psicoativas'

function App() {
  return (
    <AuthProvider>
      <Router>
        <TitleHandler />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/activate/:token" element={<ActivateAccount />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="usuarios/cadastro" element={<CadastroUsuario />} />
            <Route path="assistidas" element={<Assistidas />} />
            <Route path="assistidas/:id/detalhes" element={<DetalhesAssistida />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="substancias-psicoativas" element={<Substancias />} />
            <Route path="consultas/agendar" element={<AgendarConsulta />} />
            <Route path="medicamentos" element={<Medicamentos />} />
            <Route path="unidades-medida" element={<Unidadesmedida />} />
            <Route path="tipos-despesas" element={<GerenciarTiposDespesas />} />
            <Route path="doadores" element={<Doadores />} />
            <Route path="doacoes" element={<Doacoes />} />
            <Route path="despesas" element={<Despesas />} />
            <Route path="despesas/lancar" element={<LancarDespesa />} />
            <Route path="internacoes" element={<Internacoes />} />
            <Route path="caixa" element={<Caixa />} />
            <Route path="campanhas" element={<Campanhas />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="estoque/entradas" element={<EstoqueEntradas />} />
            <Route path="estoque/saidas" element={<EstoqueSaidas />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  )
}

export default App
