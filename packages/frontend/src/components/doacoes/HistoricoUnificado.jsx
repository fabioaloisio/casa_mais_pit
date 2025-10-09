import { useState, useEffect } from 'react';
import { Modal, Table, Button, Badge, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import { FaTimes, FaBoxOpen, FaDollarSign, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import doadoresService from '../../services/doadoresService';
import { formatCurrency } from '@casa-mais/shared';

const HistoricoUnificado = ({ show, onHide, doadorId, doadorNome }) => {
  const [historico, setHistorico] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && doadorId) {
      loadHistoricoUnificado();
      loadEstatisticas();
    }
  }, [show, doadorId]);

  const loadHistoricoUnificado = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await doadoresService.getHistoricoUnificado(doadorId);
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao carregar histórico unificado:', error);
      setError('Erro ao carregar histórico de doações. Tente novamente.');
      setHistorico([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      const data = await doadoresService.getEstatisticasConsolidadas(doadorId);
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'item' ? 
      <FaBoxOpen className="me-2 text-primary" /> : 
      <FaDollarSign className="me-2 text-success" />;
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'item' ? 
      <Badge bg="primary" className="me-2">Item</Badge> : 
      <Badge bg="success" className="me-2">Monetária</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderDetalhes = (item) => {
    if (item.tipo_doacao === 'item' && item.detalhes_item) {
      return (
        <div className="text-muted small">
          {item.detalhes_item.medicamento_nome && (
            <div>Medicamento: {item.detalhes_item.medicamento_nome}</div>
          )}
          {item.detalhes_item.quantidade && (
            <div>Quantidade: {item.detalhes_item.quantidade}</div>
          )}
          {item.detalhes_item.lote && (
            <div>Lote: {item.detalhes_item.lote}</div>
          )}
          {item.detalhes_item.validade && (
            <div>Validade: {formatDate(item.detalhes_item.validade)}</div>
          )}
        </div>
      );
    }

    if (item.tipo_doacao === 'monetaria' && item.detalhes_monetaria) {
      return (
        <div className="text-muted small">
          {item.detalhes_monetaria.forma_pagamento && (
            <div>Forma: {item.detalhes_monetaria.forma_pagamento}</div>
          )}
          {item.detalhes_monetaria.numero_recibo && (
            <div>Recibo: {item.detalhes_monetaria.numero_recibo}</div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderEstatisticas = () => {
    if (!estatisticas) return null;

    return (
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center">
              <FaBoxOpen className="me-2 text-primary" />
              <strong>Doações de Itens</strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Total:</strong> {estatisticas.doacoes_itens?.total || 0} doações
              </div>
              <div className="mb-2">
                <strong>Valor:</strong> {formatCurrency(estatisticas.doacoes_itens?.valor_total || 0)}
              </div>
              {estatisticas.doacoes_itens?.primeira_doacao && (
                <div className="mb-2">
                  <strong>Primeira:</strong> {formatDate(estatisticas.doacoes_itens.primeira_doacao)}
                </div>
              )}
              {estatisticas.doacoes_itens?.ultima_doacao && (
                <div>
                  <strong>Última:</strong> {formatDate(estatisticas.doacoes_itens.ultima_doacao)}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center">
              <FaDollarSign className="me-2 text-success" />
              <strong>Doações Monetárias</strong>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Total:</strong> {estatisticas.doacoes_monetarias?.total || 0} doações
              </div>
              <div className="mb-2">
                <strong>Valor:</strong> {formatCurrency(estatisticas.doacoes_monetarias?.valor_total || 0)}
              </div>
              {estatisticas.doacoes_monetarias?.primeira_doacao && (
                <div className="mb-2">
                  <strong>Primeira:</strong> {formatDate(estatisticas.doacoes_monetarias.primeira_doacao)}
                </div>
              )}
              {estatisticas.doacoes_monetarias?.ultima_doacao && (
                <div>
                  <strong>Última:</strong> {formatDate(estatisticas.doacoes_monetarias.ultima_doacao)}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderResumoGeral = () => {
    if (!estatisticas?.consolidado) return null;

    return (
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <FaChartLine className="me-2" />
          <strong>Resumo Geral</strong>
        </div>
        <Row>
          <Col md={3}>
            <div><strong>Total Geral:</strong></div>
            <div>{estatisticas.consolidado.total_geral} doações</div>
          </Col>
          <Col md={3}>
            <div><strong>Valor Total:</strong></div>
            <div>{formatCurrency(estatisticas.consolidado.valor_total_geral)}</div>
          </Col>
          {estatisticas.consolidado.primeira_doacao_geral && (
            <Col md={3}>
              <div><strong>Primeira Doação:</strong></div>
              <div>{formatDate(estatisticas.consolidado.primeira_doacao_geral)}</div>
            </Col>
          )}
          {estatisticas.consolidado.ultima_doacao_geral && (
            <Col md={3}>
              <div><strong>Última Doação:</strong></div>
              <div>{formatDate(estatisticas.consolidado.ultima_doacao_geral)}</div>
            </Col>
          )}
        </Row>
      </Alert>
    );
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      backdrop="static"
      className="modal-historico-unificado"
    >
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <FaCalendarAlt className="me-2" />
          Histórico Unificado de Doações - {doadorNome}
        </Modal.Title>
        <Button 
          variant="outline-light" 
          size="sm" 
          onClick={onHide}
          className="ms-auto"
        >
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {renderResumoGeral()}
        {renderEstatisticas()}

        <div className="mb-3">
          <h6>Histórico Cronológico Completo</h6>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="me-2" />
            <span>Carregando histórico...</span>
          </div>
        ) : historico.length === 0 ? (
          <Alert variant="info" className="text-center">
            <FaCalendarAlt className="me-2" />
            Nenhuma doação encontrada para este doador.
          </Alert>
        ) : (
          <Table hover responsive className="table-sm">
            <thead className="table-dark">
              <tr>
                <th>Tipo</th>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item, index) => (
                <tr key={`${item.tipo_doacao}-${item.id}-${index}`}>
                  <td>
                    {getTipoIcon(item.tipo_doacao)}
                    {getTipoBadge(item.tipo_doacao)}
                  </td>
                  <td>
                    <div className="fw-medium">
                      {formatDate(item.data_movimentacao)}
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium">
                      {item.descricao}
                    </div>
                  </td>
                  <td>
                    <div className={`fw-bold ${
                      item.tipo_doacao === 'item' ? 'text-primary' : 'text-success'
                    }`}>
                      {formatCurrency(item.valor)}
                    </div>
                  </td>
                  <td>
                    {renderDetalhes(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div className="text-muted">
          {historico.length > 0 && (
            <small>
              Total de {historico.length} doações encontradas
            </small>
          )}
        </div>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HistoricoUnificado;