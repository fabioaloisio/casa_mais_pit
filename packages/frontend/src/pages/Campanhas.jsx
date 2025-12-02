import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, ProgressBar, Row, Tab, Table, Tabs } from 'react-bootstrap';
import { FaBullseye, FaCalendarAlt, FaChartBar, FaDonate, FaPlus, FaStop, FaTrophy, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import campanhaService from '../services/campanhaService';
import doadoresService from '../services/doadoresService';
import InfoTooltip from '../utils/tooltip';

const Campanhas = () => {
  const { user } = useAuth();
  const [campanhas, setCampanhas] = useState([]);
  const [campanhasFiltradas, setCampanhasFiltradas] = useState([]);
  const [campanhaDetalhes, setCampanhaDetalhes] = useState(null);
  const [doadores, setDoadores] = useState([]);
  const [doadoresCampanha, setDoadoresCampanha] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [activeTab, setActiveTab] = useState('lista');

  // Modais
  const [showModalNova, setShowModalNova] = useState(false);
  const [showModalDoacao, setShowModalDoacao] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [showModalEncerrar, setShowModalEncerrar] = useState(false);
  const [campanhaParaEncerrar, setCampanhaParaEncerrar] = useState(null);

  // Formulários
  const [novaCampanha, setNovaCampanha] = useState({
    nome: '',
    descricao: '',
    meta_valor: '',
    data_inicio: '',
    data_fim: '',
    tipo: ''
  });

  const [novaDoacao, setNovaDoacao] = useState({
    doador_id: '',
    valor_doado: '',
    forma_pagamento: 'Dinheiro',
    recibo_numero: '',
    anonimo: false,
    mensagem: ''
  });

  // Verificação de permissões
  const podeGerenciar = user && ['Administrador', 'Financeiro'].includes(user.tipo);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarCampanhas();
  }, [campanhas, filtroStatus]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        carregarCampanhas(),
        carregarDoadores(),
        carregarRanking()
      ]);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const carregarCampanhas = async () => {
    try {
      const response = await campanhaService.listarCampanhas();
      setCampanhas(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar campanhas:', err);
      toast.error('Erro ao carregar campanhas');
    }
  };

  const carregarDoadores = async () => {
    if (!podeGerenciar) return;

    try {
      const response = await doadoresService.getAll();
      setDoadores(response || []);
    } catch (err) {
      console.error('Erro ao carregar doadores:', err);
    }
  };

  const carregarRanking = async () => {
    try {
      const response = await campanhaService.obterRankingCampanhas();
      // A resposta já vem com success e data
      if (response && response.success) {
        setRanking(response.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
    }
  };

  const filtrarCampanhas = () => {
    if (filtroStatus === 'todas') {
      setCampanhasFiltradas(campanhas);
    } else {
      setCampanhasFiltradas(campanhas.filter(c =>
        c.status.toLowerCase() === filtroStatus.toLowerCase()
      ));
    }
  };

  const handleNovaCampanha = async (e) => {
    e.preventDefault();

    try {
      await campanhaService.criarCampanha(novaCampanha);
      toast.success('Campanha criada com sucesso!');
      setShowModalNova(false);
      setNovaCampanha({
        nome: '',
        descricao: '',
        meta_valor: '',
        data_inicio: '',
        data_fim: '',
        tipo: ''
      });

      // Atualizar todos os dados sem refresh
      await Promise.all([
        carregarCampanhas(),
        carregarRanking()
      ]);

      // Re-filtrar campanhas após atualização
      filtrarCampanhas();
    } catch (err) {
      console.error('Erro ao criar campanha:', err);
      toast.error(err.response?.data?.message || 'Erro ao criar campanha');
    }
  };

  const handleNovaDoacao = async (e) => {
    e.preventDefault();

    if (!campanhaDetalhes) return;

    try {
      setLoadingUpdate(true);
      await campanhaService.associarDoadorCampanha(campanhaDetalhes.id, novaDoacao);
      toast.success('Doação registrada com sucesso!');
      setShowModalDoacao(false);
      setNovaDoacao({
        doador_id: '',
        valor_doado: '',
        forma_pagamento: 'Dinheiro',
        recibo_numero: '',
        anonimo: false,
        mensagem: ''
      });

      // Atualizar todos os dados sem refresh
      await Promise.all([
        carregarCampanhas(),
        carregarRanking(),
        carregarDetalhes(campanhaDetalhes.id)
      ]);

      // Re-filtrar campanhas após atualização
      filtrarCampanhas();
    } catch (err) {
      console.error('Erro ao registrar doação:', err);
      toast.error(err.response?.data?.message || 'Erro ao registrar doação');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const carregarDetalhes = async (campanhaId) => {
    try {
      const [campanha, stats] = await Promise.all([
        campanhaService.obterCampanha(campanhaId),
        campanhaService.obterEstatisticasCampanha(campanhaId)
      ]);

      setCampanhaDetalhes(campanha.data);
      setEstatisticas(stats.data);

      if (podeGerenciar) {
        const doadoresResp = await campanhaService.listarDoadoresCampanha(campanhaId);
        setDoadoresCampanha(doadoresResp.data || []);
      }

      setShowModalDetalhes(true);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
      toast.error('Erro ao carregar detalhes da campanha');
    }
  };

  const handleAbrirModalEncerrar = (campanha) => {
    setCampanhaParaEncerrar(campanha);
    setShowModalEncerrar(true);
  };

  const handleConfirmarEncerramento = async () => {
    if (!campanhaParaEncerrar) return;

    try {
      setLoadingUpdate(true);
      await campanhaService.encerrarCampanha(campanhaParaEncerrar.id, 'Encerrada manualmente');
      toast.success('Campanha encerrada com sucesso!');
      setShowModalEncerrar(false);
      setCampanhaParaEncerrar(null);

      // Atualizar todos os dados sem refresh
      await Promise.all([
        carregarCampanhas(),
        carregarRanking()
      ]);

      // Re-filtrar campanhas após atualização
      filtrarCampanhas();
    } catch (err) {
      console.error('Erro ao encerrar campanha:', err);
      toast.error('Erro ao encerrar campanha');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const getProgressVariant = (percentual) => {
    if (percentual >= 100) return 'success';
    if (percentual >= 75) return 'info';
    if (percentual >= 50) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2><FaBullseye /> Campanhas de Arrecadação</h2>
          <p className="text-muted">
            Gerencie campanhas e acompanhe doações
            {loadingUpdate && <span className="ms-2 text-primary">(Atualizando...)</span>}
          </p>
        </Col>
        <Col xs="auto">
          {podeGerenciar && (
            <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => setShowModalNova(true)}>
              <FaPlus /> Nova Campanha
              <InfoTooltip
                texto="Crie uma nova campanha de arrecadação. Informe nome, descrição, meta de valor, datas de início e fim, e tipo de campanha. Campanhas ajudam a organizar e acompanhar as arrecadações para objetivos específicos."
              />
            </Button>
          )}
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="lista" title={<><FaCalendarAlt /> Campanhas</>}>
          {/* Filtros */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todas">Todas as Campanhas</option>
                <option value="ativa">Ativas</option>
                <option value="planejada">Planejadas</option>
                <option value="encerrada">Encerradas</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Lista de Campanhas */}
          <Row>
            {campanhasFiltradas.map(campanha => (
              <Col md={6} lg={4} key={campanha.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5>{campanha.nome}</h5>
                      <Badge bg={campanhaService.getStatusClass(campanha.status)}>
                        {campanha.status}
                      </Badge>
                    </div>

                    <p className="text-muted small">{campanha.descricao}</p>

                    {campanha.meta_valor > 0 && (
                      <>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small">
                            <span>Meta:</span>
                            <strong>{campanhaService.formatarValorMonetario(campanha.meta_valor)}</strong>
                          </div>
                          <div className="d-flex justify-content-between small">
                            <span>Arrecadado:</span>
                            <strong>{campanhaService.formatarValorMonetario(campanha.total_arrecadado || 0)}</strong>
                          </div>
                        </div>

                        <ProgressBar
                          now={campanha.percentual_meta || 0}
                          variant={getProgressVariant(campanha.percentual_meta || 0)}
                          label={`${campanha.percentual_meta || 0}%`}
                          className="mb-3"
                        />
                      </>
                    )}

                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <span><FaUsers /> {campanha.total_doadores || 0} doadores</span>
                      <span><FaDonate /> {campanha.total_doacoes || 0} doações</span>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => carregarDetalhes(campanha.id)}
                        className="flex-fill"
                      >
                        <FaChartBar /> Detalhes
                      </Button>
                      {podeGerenciar && (campanha.status === 'ativa' || campanha.status === 'planejada') && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setCampanhaDetalhes(campanha);
                            setShowModalDoacao(true);
                          }}
                          className="flex-fill"
                        >
                          <FaDonate /> Registrar Doação
                        </Button>
                      )}
                      {podeGerenciar && campanha.status === 'ativa' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleAbrirModalEncerrar(campanha)}
                          className="flex-fill"
                        >
                          <FaStop /> Encerrar
                        </Button>
                      )}
                    </div>
                  </Card.Body>

                  {campanha.data_fim && (
                    <Card.Footer className="text-muted small">
                      {campanhaService.calcularDiasRestantes(campanha.data_fim) > 0
                        ? `${campanhaService.calcularDiasRestantes(campanha.data_fim)} dias restantes`
                        : 'Encerrada'}
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          {campanhasFiltradas.length === 0 && (
            <Alert variant="info">
              Nenhuma campanha encontrada para o filtro selecionado.
            </Alert>
          )}
        </Tab>

        <Tab eventKey="ranking" title={<><FaTrophy /> Ranking</>}>
          <Card>
            <Card.Body>
              <h4 className="mb-3">Top Campanhas por Arrecadação</h4>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Campanha</th>
                    <th>Meta</th>
                    <th>Arrecadado</th>
                    <th>Progresso</th>
                    <th>Doadores</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((campanha, index) => (
                    <tr key={campanha.id}>
                      <td>
                        {index + 1}
                        {index < 3 && <FaTrophy className="ms-2 text-warning" />}
                      </td>
                      <td>{campanha.nome}</td>
                      <td>{campanhaService.formatarValorMonetario(campanha.meta_valor || 0)}</td>
                      <td className="fw-bold text-success">
                        {campanhaService.formatarValorMonetario(campanha.total_arrecadado || 0)}
                      </td>
                      <td>
                        <div style={{ minWidth: '150px' }}>
                          <ProgressBar
                            now={campanha.percentual_meta || 0}
                            variant={getProgressVariant(campanha.percentual_meta || 0)}
                            label={`${campanha.percentual_meta || 0}%`}
                          />
                        </div>
                      </td>
                      <td>{campanha.total_doadores || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {ranking.length === 0 && (
                <Alert variant="info">Nenhuma campanha com arrecadação ainda.</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal Nova Campanha */}
      <Modal show={showModalNova} onHide={() => setShowModalNova(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nova Campanha</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleNovaCampanha}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome da Campanha *</Form.Label>
                  <Form.Control
                    type="text"
                    value={novaCampanha.nome}
                    onChange={(e) => setNovaCampanha({...novaCampanha, nome: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={novaCampanha.descricao}
                    onChange={(e) => setNovaCampanha({...novaCampanha, descricao: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Meta de Arrecadação (R$)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={novaCampanha.meta_valor}
                    onChange={(e) => setNovaCampanha({...novaCampanha, meta_valor: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    value={novaCampanha.tipo}
                    onChange={(e) => setNovaCampanha({...novaCampanha, tipo: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="sazonal">Sazonal</option>
                    <option value="emergencia">Emergência</option>
                    <option value="projeto">Projeto</option>
                    <option value="continua">Contínua</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Início *</Form.Label>
                  <Form.Control
                    type="date"
                    value={novaCampanha.data_inicio}
                    onChange={(e) => setNovaCampanha({...novaCampanha, data_inicio: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Término</Form.Label>
                  <Form.Control
                    type="date"
                    value={novaCampanha.data_fim}
                    onChange={(e) => setNovaCampanha({...novaCampanha, data_fim: e.target.value})}
                    min={novaCampanha.data_inicio}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalNova(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              <FaPlus /> Criar Campanha
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Registrar Doação */}
      <Modal show={showModalDoacao} onHide={() => setShowModalDoacao(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Doação - {campanhaDetalhes?.nome}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleNovaDoacao}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Doador *</Form.Label>
              <Form.Select
                value={novaDoacao.doador_id}
                onChange={(e) => setNovaDoacao({...novaDoacao, doador_id: e.target.value})}
                required
              >
                <option value="">Selecione um doador...</option>
                {doadores.map(doador => (
                  <option key={doador.id} value={doador.id}>
                    {doador.nome} - {doador.documento}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valor (R$) *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={novaDoacao.valor_doado}
                onChange={(e) => setNovaDoacao({...novaDoacao, valor_doado: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Forma de Pagamento</Form.Label>
              <Form.Select
                value={novaDoacao.forma_pagamento}
                onChange={(e) => setNovaDoacao({...novaDoacao, forma_pagamento: e.target.value})}
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão">Cartão</option>
                <option value="Transferência">Transferência</option>
                <option value="Boleto">Boleto</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Número do Recibo</Form.Label>
              <Form.Control
                type="text"
                value={novaDoacao.recibo_numero}
                onChange={(e) => setNovaDoacao({...novaDoacao, recibo_numero: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Doação anônima"
                checked={novaDoacao.anonimo}
                onChange={(e) => setNovaDoacao({...novaDoacao, anonimo: e.target.checked})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mensagem do Doador (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={novaDoacao.mensagem}
                onChange={(e) => setNovaDoacao({...novaDoacao, mensagem: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalDoacao(false)}>
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              <FaDonate /> Registrar Doação
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Detalhes da Campanha */}
      <Modal show={showModalDetalhes} onHide={() => setShowModalDetalhes(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{campanhaDetalhes?.nome}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {campanhaDetalhes && estatisticas && (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>{campanhaService.formatarValorMonetario(estatisticas.estatisticas.total_arrecadado)}</h5>
                      <p className="text-muted">Total Arrecadado</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>{estatisticas.estatisticas.total_doadores}</h5>
                      <p className="text-muted">Doadores</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>{estatisticas.estatisticas.total_doacoes}</h5>
                      <p className="text-muted">Doações</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>{campanhaService.formatarValorMonetario(estatisticas.estatisticas.valor_medio)}</h5>
                      <p className="text-muted">Valor Médio</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {estatisticas.topDoadores.length > 0 && (
                <>
                  <h5 className="mb-3"><FaTrophy /> Top Doadores</h5>
                  <Table hover responsive className="mb-4">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Doador</th>
                        <th>Total Doado</th>
                        <th>Qtd. Doações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estatisticas.topDoadores.map((doador, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{doador.doador_nome}</td>
                          <td className="fw-bold">
                            {campanhaService.formatarValorMonetario(doador.total_doado)}
                          </td>
                          <td>{doador.quantidade_doacoes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}

              {podeGerenciar && doadoresCampanha.length > 0 && (
                <>
                  <h5 className="mb-3"><FaUsers /> Todas as Doações</h5>
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Doador</th>
                        <th>Valor</th>
                        <th>Forma Pgto</th>
                        <th>Recibo</th>
                        <th>Mensagem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doadoresCampanha.map(doacao => (
                        <tr key={doacao.id}>
                          <td>{new Date(doacao.data_contribuicao).toLocaleDateString('pt-BR')}</td>
                          <td>{doacao.doador_nome}</td>
                          <td className="fw-bold">
                            {campanhaService.formatarValorMonetario(doacao.valor_doado)}
                          </td>
                          <td>{doacao.forma_pagamento}</td>
                          <td>{doacao.recibo_numero || '-'}</td>
                          <td>{doacao.mensagem || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDetalhes(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar Encerramento */}
      <Modal show={showModalEncerrar} onHide={() => setShowModalEncerrar(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaStop className="me-2" />
            Encerrar Campanha
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {campanhaParaEncerrar && (
            <>
              <div className="text-center mb-3">
                <FaStop size={48} className="text-danger mb-3" />
                <h5>Confirmar Encerramento</h5>
              </div>

              <Alert variant="warning" className="mb-3">
                <strong>Atenção!</strong> Esta ação não pode ser desfeita.
              </Alert>

              <p className="mb-3">
                Você está prestes a encerrar a campanha:
              </p>

              <Card className="mb-3">
                <Card.Body>
                  <h6 className="card-title text-primary">{campanhaParaEncerrar.nome}</h6>
                  <p className="card-text text-muted small">
                    {campanhaParaEncerrar.descricao}
                  </p>
                  <div className="row text-center">
                    <div className="col">
                      <small className="text-muted">Meta</small>
                      <div className="fw-bold">
                        {campanhaService.formatarValorMonetario(campanhaParaEncerrar.meta_valor || 0)}
                      </div>
                    </div>
                    <div className="col">
                      <small className="text-muted">Arrecadado</small>
                      <div className="fw-bold text-success">
                        {campanhaService.formatarValorMonetario(campanhaParaEncerrar.total_arrecadado || 0)}
                      </div>
                    </div>
                    <div className="col">
                      <small className="text-muted">Progresso</small>
                      <div className="fw-bold">
                        {campanhaParaEncerrar.percentual_meta || 0}%
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className="bg-light p-3 rounded">
                <h6 className="mb-2">O que acontece ao encerrar:</h6>
                <ul className="mb-0 small">
                  <li>A campanha não poderá mais receber doações</li>
                  <li>O status mudará para "Encerrada"</li>
                  <li>Os dados e estatísticas serão preservados</li>
                  <li>A campanha continuará visível nos relatórios</li>
                </ul>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalEncerrar(false)}
            disabled={loadingUpdate}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmarEncerramento}
            disabled={loadingUpdate}
          >
            {loadingUpdate ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                Encerrando...
              </>
            ) : (
              <>
                <FaStop className="me-2" />
                Confirmar Encerramento
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Campanhas;
