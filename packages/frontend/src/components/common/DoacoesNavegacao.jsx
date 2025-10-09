import { Alert, Button, Row, Col } from 'react-bootstrap';
import { FaDollarSign, FaBoxOpen, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const DoacoesNavegacao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnDoacoesPage = location.pathname === '/doacoes';
  const isOnCaixaPage = location.pathname === '/caixa';

  if (!isOnDoacoesPage && !isOnCaixaPage) {
    return null;
  }

  const handleNavigateTo = (path) => {
    navigate(path);
  };

  const renderDoacoesInfo = () => (
    <Alert variant="info" className="mb-4" style={{ borderLeft: '4px solid #0d6efd' }}>
      <div className="d-flex align-items-center mb-2">
        <FaInfoCircle className="me-2" />
        <strong>Tipos de Doação Disponíveis</strong>
      </div>
      <Row className="align-items-center">
        <Col md={8}>
          <div className="mb-2">
            <strong>📦 Doações de Itens:</strong> Medicamentos, materiais e produtos doados
          </div>
          <div>
            <strong>💰 Doações Monetárias:</strong> Valores em dinheiro registrados no caixa
          </div>
        </Col>
        <Col md={4} className="text-end">
          <Button 
            variant="outline-success"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={() => handleNavigateTo('/caixa')}
          >
            <FaDollarSign /> Lançar Doação Monetária
          </Button>
        </Col>
      </Row>
    </Alert>
  );

  const renderCaixaInfo = () => (
    <Alert variant="success" className="mb-4" style={{ borderLeft: '4px solid #198754' }}>
      <div className="d-flex align-items-center mb-2">
        <FaInfoCircle className="me-2" />
        <strong>Módulo Financeiro - Doações Monetárias</strong>
      </div>
      <Row className="align-items-center">
        <Col md={8}>
          <div className="mb-2">
            <strong>🏦 Controle de Caixa:</strong> Registre entradas de doações em dinheiro
          </div>
          <div>
            <strong>📊 Fluxo Financeiro:</strong> Acompanhe saldo e movimentações monetárias
          </div>
        </Col>
        <Col md={4} className="text-end">
          <Button 
            variant="outline-primary"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={() => handleNavigateTo('/doacoes')}
          >
            <FaBoxOpen /> Gerenciar Doações de Itens
          </Button>
        </Col>
      </Row>
    </Alert>
  );

  return (
    <>
      {isOnDoacoesPage && renderDoacoesInfo()}
      {isOnCaixaPage && renderCaixaInfo()}
    </>
  );
};

export default DoacoesNavegacao;