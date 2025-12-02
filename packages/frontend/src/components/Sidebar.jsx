import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  FaDonate,
  FaHome,
  FaIdCard,
  FaMoneyBillWave,
  FaPills,
  FaStethoscope,
  FaUsers,
  FaBars,
  FaTimes,
  FaUserTie,
  FaTags,
  FaSignOutAlt,
  FaUserCircle,
  FaGripHorizontal,
  FaFlask,
  FaBed,
  FaMoneyBillWave as FaCash,
  FaFileAlt,
  FaBullseye,
  FaUserMd
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';
import Logo from './logo';

function Sidebar() {
  const location = useLocation();
  const { logout, user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMedicamentosOpen, setIsMedicamentosOpen] = useState(false);
  const [isDespesasOpen, setIsDespesasOpen] = useState(false);
  const [isConsultasOpen, setIsConsultasOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

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

          {(hasPermission('RF_B9') || hasPermission('RF_B1') || hasPermission('RF_B3')) && (
            <div className="menu-section">
              <div className="menu-section-title">Gestão de Pessoas</div>
              {hasPermission('RF_B9') && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/usuarios"
                  className={location.pathname.includes('/usuarios') ? 'active' : ''}>
                  <FaUsers /> Gestão de Usuários
                </Nav.Link>
              )}
              {hasPermission('RF_B1') && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/assistidas"
                  className={location.pathname.includes('/assistidas') ? 'active' : ''}>
                  <FaIdCard /> Gestão de Assistidas
                </Nav.Link>
              )}
              {hasPermission('RF_B3') && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/doadores"
                  className={location.pathname.includes('/doadores') ? 'active' : ''}>
                  <FaUserTie /> Gestão de Doadores
                </Nav.Link>
              )}
            </div>
          )}

          {(hasPermission('RF_B10') || hasPermission('RF_B11') || hasPermission('RF_B2') || hasPermission('RF_B4') || hasPermission('RF_B5')) && (
            <div className="menu-section">
              <div className="menu-section-title">Atendimento e Saúde</div>
              {hasPermission('RF_B10') && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/internacoes"
                  className={location.pathname.includes('/internacoes') ? 'active' : ''}>
                  <FaBed /> Gestão de Internações
                </Nav.Link>
              )}
              
              {hasPermission('RF_B11') && (
                <Nav.Link onClick={() => setIsConsultasOpen(!isConsultasOpen)} className={isConsultasOpen ? 'active' : ''}>
                  <FaStethoscope /> Gestão de Consultas
                </Nav.Link>
              )}
              {isConsultasOpen && hasPermission('RF_B11') && (
                <div className="submenu">
                  <Nav.Link as={Link} onClick={closeSidebar} to="/medicos">
                    <FaUserMd /> Gerenciar Médicos
                  </Nav.Link>
                  <Nav.Link as={Link} onClick={closeSidebar} to="/consultas">
                    <FaStethoscope /> Gerenciar Consultas
                  </Nav.Link>
                </div>
              )}

              {hasPermission('RF_B2') && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/substancias-psicoativas"
                  className={location.pathname.includes('/substancias-psicoativas') ? 'active' : ''}>
                  <FaFlask /> Gerenciar Tipos de Substâncias Psicoativas
                </Nav.Link>
              )}

              {(hasPermission('RF_B4') || hasPermission('RF_B5')) && (
                <Nav.Link onClick={() => setIsMedicamentosOpen(!isMedicamentosOpen)} className={isMedicamentosOpen ? 'active' : ''}>
                  <FaPills /> Gestão de Medicamentos
                </Nav.Link>
              )}

              {isMedicamentosOpen && (hasPermission('RF_B4') || hasPermission('RF_B5')) && (
                <div className="submenu">
                  {hasPermission('RF_B4') && (
                    <Nav.Link as={Link} onClick={closeSidebar} to="/medicamentos">
                      <FaPills /> Gerenciar Medicamentos
                    </Nav.Link>
                  )}
                  {hasPermission('RF_B5') && (
                    <Nav.Link as={Link} onClick={closeSidebar} to="/unidades-medida">
                      <FaPills /> Gerenciar Unidades de Medida
                    </Nav.Link>
                  )}
                </div>
              )}
            </div>
          )}

          {(hasPermission('RF_B12') || hasPermission('RF_B6') || hasPermission('RF_B8') || hasPermission('RF_B7')) && (
            <div className="menu-section">
              <div className="menu-section-title">Controle Financeiro</div>
              {hasPermission('RF_B12') && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/caixa"
                  className={location.pathname.includes('/caixa') ? 'active' : ''}>
                  <FaCash /> Caixa Financeiro
                </Nav.Link>
              )}
              {(hasPermission('RF_B12') || hasPermission('RF_B6')) && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/campanhas"
                  className={location.pathname.includes('/campanhas') ? 'active' : ''}>
                  <FaBullseye /> Campanhas de Arrecadação
                </Nav.Link>
              )}
              {hasPermission('RF_B6') && (
                <Nav.Link as={Link} onClick={closeSidebar} to="/doacoes"
                  className={location.pathname.includes('/doacoes') ? 'active' : ''}>
                  <FaDonate /> Gestão de Doações
                </Nav.Link>
              )}

              {(hasPermission('RF_B8') || hasPermission('RF_B7')) && (
                <Nav.Link onClick={() => setIsDespesasOpen(!isDespesasOpen)} className={isDespesasOpen ? 'active' : ''}>
                  <FaMoneyBillWave /> Gestão de Despesas
                </Nav.Link>
              )}

              {isDespesasOpen && (hasPermission('RF_B8') || hasPermission('RF_B7')) && (
                <div className="submenu">
                  {hasPermission('RF_B8') && (
                    <Nav.Link as={Link} onClick={closeSidebar} to="/despesas">
                      <FaMoneyBillWave /> Gerenciar Despesas
                    </Nav.Link>
                  )}
                  {hasPermission('RF_B7') && (
                    <Nav.Link as={Link} onClick={closeSidebar} to="/tipos-despesas">
                      <FaTags /> Gerenciar Tipos de Despesas
                    </Nav.Link>
                  )}
                </div>
              )}
            </div>
          )}

          {hasPermission('RF_B4') && (
            <div className="menu-section">
              <div className="menu-section-title">Produção & Vendas</div>
              <Nav.Link as={Link} onClick={closeSidebar} to="/materias-primas"
                className={location.pathname.includes('/materias-primas') ? 'active' : ''}>
                <FaFlask /> Gerenciar Matérias-Primas
              </Nav.Link>
              <Nav.Link as={Link} onClick={closeSidebar} to="/receitas"
                className={location.pathname.includes('/receitas') ? 'active' : ''}>
                <FaGripHorizontal /> Gerenciar Receitas
              </Nav.Link>
              <Nav.Link as={Link} onClick={closeSidebar} to="/produtos"
                className={location.pathname.includes('/produtos') ? 'active' : ''}>
                <FaTags /> Gerenciar Produtos
              </Nav.Link>
              <Nav.Link as={Link} onClick={closeSidebar} to="/vendas"
                className={location.pathname.includes('/vendas') ? 'active' : ''}>
                <FaMoneyBillWave /> Gerenciar Vendas
              </Nav.Link>
            </div>
          )}

          {hasPermission('RF_I2') && (
            <div className="menu-section">
              <div className="menu-section-title">Relatórios e Análises</div>
              <Nav.Link as={Link} onClick={closeSidebar} to="/relatorios"
                className={location.pathname.includes('/relatorios') ? 'active' : ''}>
                <FaFileAlt /> Relatórios
              </Nav.Link>
            </div>
          )}

          <div className="sidebar-user-info">
            {user && (
              <div className="user-info-section">
                <div className="user-name">Olá, {user.nome}</div>
                <div className="user-email">{user.email}</div>
              </div>
            )}
            <Nav.Link as={Link} to="/perfil" onClick={closeSidebar}
              className={location.pathname === '/perfil' ? 'active profile-link' : 'profile-link'}>
              <FaUserCircle /> Meu Perfil
            </Nav.Link>
            <Nav.Link onClick={handleLogout} className="logout-button">
              <FaSignOutAlt /> Sair
            </Nav.Link>
          </div>
        </Nav>
      </aside>
    </>
  );
}

export default Sidebar;
