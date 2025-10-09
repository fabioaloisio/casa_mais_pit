import { Card, Row, Col } from 'react-bootstrap'
import { FaUsers, FaUserFriends, FaCalendarCheck, FaPills, FaHandHoldingHeart, FaChartLine } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import PendingApprovals from '../components/approval/PendingApprovals'
import './Dashboard.css'
import './Doacoes.css'

function Dashboard() {
  const { isAdmin } = useAuth()
  return (
    <div className="conteudo">
      <div className="topo">
        <h1>Dashboard</h1>
        <p>Visão geral das atividades da organização</p>
      </div>
      
      <Row className="mt-4">
        <Col md={4} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6>Usuários Ativos</h6>
                  <h3>12</h3>
                </div>
                <FaUsers size={40} className="text-primary opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6>Assistidas Ativas</h6>
                  <h3>34</h3>
                </div>
                <FaUserFriends size={40} className="text-success opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6>Consultas Hoje</h6>
                  <h3>5</h3>
                </div>
                <FaCalendarCheck size={40} className="text-info opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={4} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6>Medicamentos</h6>
                  <h3>128</h3>
                </div>
                <FaPills size={40} className="text-warning opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6>Doações Mês</h6>
                  <h3>15</h3>
                </div>
                <FaHandHoldingHeart size={40} className="text-danger opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6>Meta Mensal</h6>
                  <h3>78%</h3>
                </div>
                <FaChartLine size={40} className="text-success opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Seção de aprovações pendentes - apenas para administradores */}
      {isAdmin() && (
        <Row className="mt-4">
          <Col>
            <PendingApprovals />
          </Col>
        </Row>
      )}
    </div>
  )
}

export default Dashboard