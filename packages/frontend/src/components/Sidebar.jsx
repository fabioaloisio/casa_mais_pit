import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaDonate, FaHome, FaIdCard, FaMoneyBillWave, FaPills, FaStethoscope, FaUsers, FaBars, FaTimes, FaUserTie, FaTags } from 'react-icons/fa';
import './Sidebar.css';
import Logo from './logo';

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMedicamentosOpen, setIsMedicamentosOpen] = useState(false);
  const [isDespesasOpen, setIsDespesasOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button className="menu-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <Logo />
        </div>
        <Nav className="flex-column menu">
          <Nav.Link as={Link} to="/dashboard" onClick={closeSidebar}
            className={location.pathname === '/' || location.pathname === '/dashboard' ? 'active' : ''}>
            <FaHome /> Dashboard
          </Nav.Link>

          <div className="menu-section">
            <div className="menu-section-title">Gestão de Pessoas</div>
            <Nav.Link as={Link} onClick={closeSidebar} to="/usuarios"
              className={location.pathname.includes('/usuarios') ? 'active' : ''}>
              <FaUsers /> Gestão de Usuários
            </Nav.Link>
            <Nav.Link as={Link} onClick={closeSidebar} to="/assistidas"
              className={location.pathname.includes('/assistidas') ? 'active' : ''}>
              <FaIdCard /> Gestão de Assistidas
            </Nav.Link>
            <Nav.Link as={Link} onClick={closeSidebar} to="/doadores"
              className={location.pathname.includes('/doadores') ? 'active' : ''}>
              <FaUserTie /> Gestão de Doadores
            </Nav.Link>
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Atendimento e Saúde</div>
            <Nav.Link as={Link} onClick={closeSidebar} to="/consultas"
              className={location.pathname.includes('/consultas') ? 'active' : ''}>
              <FaStethoscope /> Gestão de Consultas
            </Nav.Link>

            <Nav.Link onClick={() => setIsMedicamentosOpen(!isMedicamentosOpen)} className={isMedicamentosOpen ? 'active' : ''}>
              <FaPills /> Gestão de Medicamentos
            </Nav.Link>

            {isMedicamentosOpen && (
              <div className="submenu">
                <Nav.Link as={Link} onClick={closeSidebar} to="/medicamentos">
                  <FaPills /> Gerenciar Medicamentos
                </Nav.Link>
                <Nav.Link as={Link} onClick={closeSidebar} to="/unidades-medida">
                  <FaPills /> Gerenciar Unidades de Medida
                </Nav.Link>
              </div>
            )}
          </div>

          <div className="menu-section">
            <div className="menu-section-title">Controle Financeiro</div>
            <Nav.Link as={Link} onClick={closeSidebar} to="/doacoes"
              className={location.pathname.includes('/doacoes') ? 'active' : ''}>
              <FaDonate /> Gestão de Doações
            </Nav.Link>
            
            <Nav.Link onClick={() => setIsDespesasOpen(!isDespesasOpen)} className={isDespesasOpen ? 'active' : ''}>
              <FaMoneyBillWave /> Gestão de Despesas
            </Nav.Link>

            {isDespesasOpen && (
              <div className="submenu">
                <Nav.Link as={Link} onClick={closeSidebar} to="/despesas">
                  <FaMoneyBillWave /> Gerenciar Despesas
                </Nav.Link>
                <Nav.Link as={Link} onClick={closeSidebar} to="/tipos-despesas">
                  <FaTags /> Gerenciar Tipos de Despesas
                </Nav.Link>
              </div>
            )}
          </div>
        </Nav>
      </aside>
    </>
  );
}

export default Sidebar;