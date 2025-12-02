import React from 'react';
import { Row, Col, Card, Table, Dropdown, ButtonGroup, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaClipboard, FaCogs, FaDoorOpen, FaFileAlt, FaPen, FaRedoAlt, FaSignOutAlt, FaTrashAlt, FaUndoAlt } from 'react-icons/fa';
import { BsHospital, BsDropletHalf, BsCapsule } from 'react-icons/bs';
import '../components/assistidas/style/Assistidas.css';
import { useParams, useNavigate } from 'react-router-dom';
import { calcularDiasInternacao } from '../utils/calcularDiasDeInternacao';

// Função de formatação de data
const formatarData = (data) => {
  if (!data) return '-';
  const dt = new Date(data);
  return dt.toLocaleDateString('pt-BR');
};

const LinhaDoTempo = ({ hprList, saidaList = [], internacoesList = [], onEditHPR, onDeleteHPR }) => {

  const { id } = useParams();

  const internacoesFiltradas = internacoesList.filter((internacao) => internacao.assistidaId === parseInt(id));

  const dataEntrada = internacoesFiltradas.length > 0 ? internacoesFiltradas[0].dataEntrada : ' '

  const saidas = Array.isArray(saidaList) ? saidaList : [];


  const dataPrimeiraInternacao = internacoesList
    .filter(i => i.assistidaId === parseInt(id))
    .sort((a, b) => new Date(a.dataEntrada) - new Date(b.dataEntrada))[0]
    ?.dataEntrada || null;


  const eventos = [
    ...hprList.map(hpr => ({
      ...hpr,
      tipo: 'hpr',
      data: dataPrimeiraInternacao ? new Date(dataPrimeiraInternacao) : null
    }))
    ,
    ...saidas.map(saida => ({
      ...saida,
      tipo: 'saida',
      data: new Date(saida.dataSaida)
    })),
    ...internacoesList.map(internacao => ({
      ...internacao,
      tipo: internacao.modoRetorno ? 'retorno' : 'entrada',
      data: new Date(internacao.dataEntrada)
    }))
  ];

  const eventosOrdenados = eventos.sort((a, b) => {

    const diff = b.data - a.data;
    if (diff !== 0) return diff;

    const prioridade = { retorno: 4, entrada: 3, saida: 2, hpr: 1 };
    return (prioridade[b.tipo] || 0) - (prioridade[a.tipo] || 0);
  });

  const navigate = useNavigate();

  function obterUltimoEvento(internacoesList = [], saidasList = []) {
    const eventos = [];

    // ENTRADAS e RETORNOS
    internacoesList.forEach(i => {
      eventos.push({
        tipo: i.modoRetorno ? "retorno" : "entrada",
        data: new Date(i.dataEntrada),
        raw: i
      });
    });

    // SAÍDAS
    saidasList.forEach(s => {
      eventos.push({
        tipo: "saida",
        data: new Date(s.dataSaida),
        raw: s
      });
    });

    // Ordenar do mais recente → mais antigo
    eventos.sort((a, b) => b.data - a.data);

    return eventos[0] || null; // retorna só o último
  }

  const historicoInternacoes = internacoesList.filter(i => i.assistidaId === parseInt(id));
  const historicoSaidas = saidaList.filter(s => s.assistidaId === parseInt(id));

  const ultimo = obterUltimoEvento(historicoInternacoes, historicoSaidas);

  return (
    <div className="timeline-container">
      {eventosOrdenados.map((evento, idx) => {

        const isUltimo = ultimo && evento.tipo === ultimo.tipo;

        if (evento.tipo === 'retorno' && evento.dataEntrada && evento.assistidaId === parseInt(id)) {
          return (
            <div key={idx} className="timeline-item retorno">
              <h4>
                <div className='d-flex justify-content-between align-items-center'>

                  <Card.Header className='d-flex align-items-center gap-1'>
                    <FaRedoAlt className="me-2" /> A assistida retornou para a instituição em  {new Date(evento.dataEntrada).toLocaleDateString('pt-BR')}
                  </Card.Header>
                  {isUltimo && (
                    <FaPen className='pen' onClick={() => {
                      navigate('/internacoes', {
                        // seta editMode para lógica de edição
                        state: {
                          openModalEntrada: true,
                          editMode: true,
                          // passa os dados da intenação
                          internacao: {
                            id: evento.id,
                            assistida_id: evento.assistidaId || evento.assistida_id,
                            motivo: evento.motivo,
                            observacoes: evento.observacoes,
                            dataEntrada: evento.dataEntrada,
                            modo_retorno: evento.modoRetorno
                          }
                        }
                      });
                    }} />
                  )}

                </div>
              </h4>

              <div className="timeline-line"></div>

              <div className="timeline-date">
                <span>{formatarData(evento.dataEntrada)}</span>
              </div>

              <div className="hpr d-flex mt-4 informacoes">
                <div className="item">
                  <p><strong>Motivo do Retorno: </strong>{evento.motivo || '-'}</p>
                </div>
                <div className="item">
                  {evento.observacoes && (
                    <p>
                      <strong>Observações: </strong>
                      {evento.observacoes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        } else if (evento.tipo === 'entrada' && evento.dataEntrada && evento.assistidaId === parseInt(id)) {
          return (
            <div key={idx} className="timeline-item entrada">
              <h4>
                <div className='d-flex justify-content-between align-items-center'>

                  <Card.Header className='d-flex align-items-center gap-1' >
                    <FaDoorOpen className="me-2" /> A assistida entrou na instituição em  {new Date(evento.dataEntrada).toLocaleDateString('pt-BR')}
                  </Card.Header>
                  {isUltimo && (
                    <FaPen className='pen' onClick={() =>
                      navigate('/internacoes', {
                        // seta editMode para lógica de edição
                        state: {
                          openModalEntrada: true,
                          editMode: true,
                          // passa os dados da intenação
                          internacao: {
                            id: evento.id,
                            assistida_id: evento.assistidaId || evento.assistida_id,
                            motivo: evento.motivo,
                            observacoes: evento.observacoes,
                            dataEntrada: evento.dataEntrada
                          }
                        }
                      })
                    } />
                  )}

                </div>
              </h4>

              <div className="timeline-line"></div>

              <div className="timeline-date">
                <span>{formatarData(evento.dataEntrada)}</span>
              </div>

              <div className="hpr d-flex mt-4 informacoes ">
                <div className="item">
                  <p><strong>Motivo da Internação: </strong>{evento.motivo || '-'}</p>
                </div>
                {evento.observacoes && (
                  <div className="item">
                    <p><strong>Observações: </strong>{evento.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        } else if (evento.tipo === 'hpr') {
          return (
            <div key={idx} className={`timeline-item ${evento.deleted_flag ? 'hpr-deleted' : ''}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span className='mb-4'><FaCogs className="me-2" /> Gerenciamento da HPR </span>
                <Dropdown as={ButtonGroup}>
                  <Dropdown.Toggle className='mb-4' size='sm' />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => onEditHPR(evento)}>
                      <FaPen className="me-2" /> Editar
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => onDeleteHPR(evento.id)}>
                      <FaTrashAlt className="me-2" /> Excluir
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>

              <div className="timeline-line"></div>

              <div className="timeline-date">
                {/* {evento.data == 'Invalid Date' ?
                  ' '
                  :
                } */}
                <span>{formatarData(evento.data)}</span>
              </div>

              <div className="hpr">
                <Row className="mb-4">
                  <Col md={5}>
                    <Card>
                      <Card.Header>
                        <FaCalendarAlt className="me-2" /> Informações de Atendimento
                      </Card.Header>
                      <Card.Body>
                        <p className='text'><strong >Data do Último Atendimento:</strong> {formatarData(evento.data_atendimento)}</p>
                        <p className='text'><strong >Hora:</strong> {evento.hora || '-'}</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={7}>
                    <Card>
                      <Card.Header><FaFileAlt className="me-2" /> História Patológica</Card.Header>
                      <Card.Body className='text'>
                        <p ><strong >História Patológica Regressa:</strong></p>
                        <p className="p-3 bg-light rounded">{evento.historia_patologica || 'Não informado'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col md={7}>
                    <Card>
                      <Card.Header><BsDropletHalf className="me-2" /> Substâncias Utilizadas</Card.Header>
                      <Card.Body>
                        {evento.drogas?.length > 0 ? (
                          <Table striped bordered size="sm" className='tabela-substancias'>
                            <thead >
                              <tr>
                                <th>Substância</th>
                                <th>Idade de Início</th>
                                <th>Tempo de Uso</th>
                                <th>Tempo sem Uso</th>
                                <th>Intensidade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {evento.drogas.map((d, idx) => (
                                <tr key={idx}>
                                  <td>{d.tipo}</td>
                                  <td>{d.idade_inicio} anos</td>
                                  <td>{d.tempo_uso}</td>
                                  <td>{evento.tempo_sem_uso}</td>
                                  <td>{d.intensidade}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <p className="text-muted mb-0">Sem uso de substâncias declarado.</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={5}>
                    <Card>
                      <Card.Header><BsCapsule className="me-2" /> Medicamentos Utilizados</Card.Header>
                      <Card.Body>
                        {evento.medicamentos?.length > 0 ? (
                          <Table striped bordered size="sm" className='tabela-medicamentos'>
                            <thead >
                              <tr>
                                <th>Nome</th>
                                <th>Dosagem</th>
                                <th>Frequência</th>
                              </tr>
                            </thead>
                            <tbody>
                              {evento.medicamentos.map((med, idx) => (
                                <tr key={idx}>
                                  <td>{med.nome}</td>
                                  <td>{med.dosagem || '-'}</td>
                                  <td>{med.frequencia || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <p className="text-muted mb-0">Sem medicamentos registrados.</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <Card>
                      <Card.Header><BsHospital className="me-2" /> Internações</Card.Header>
                      <Card.Body>
                        {evento.internacoes?.length > 0 ? (
                          <Table striped bordered size="sm" className='tabela-internacoes'>
                            <thead >
                              <tr>
                                <th>Local</th>
                                <th>Duração</th>
                                <th>Data</th>
                              </tr>
                            </thead>
                            <tbody>
                              {evento.internacoes.map((i, idx) => (
                                <tr key={idx}>
                                  <td>{i.local}</td>
                                  <td>{i.duracao}</td>
                                  <td>{formatarData(i.data)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="3"><strong className='text' >Motivação:</strong> {evento.motivacao_internacoes}</td>
                              </tr>
                            </tfoot>
                          </Table>
                        ) : (
                          <p className="text-muted mb-0">Sem internações registradas.</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header><FaClipboard className="me-2" /> Observações</Card.Header>
                      <Card.Body>
                        {evento.fatos_marcantes && <p className='text'><strong >Fatos Marcantes:</strong> {evento.fatos_marcantes}</p>}
                        {evento.infancia && <p className='text'><strong >Infância:</strong> {evento.infancia}</p>}
                        {evento.adolescencia && <p className='text'><strong >Adolescência:</strong> {evento.adolescencia}</p>}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </div>
          );
        } else if (evento.tipo === 'saida' && evento.dataSaida && evento.assistidaId === parseInt(id)) {
          return (
            <div key={idx} className="timeline-item saida">
              <h4>
                <div className='d-flex justify-content-between align-items-center'>
                  <Card.Header className='d-flex align-items-center gap-1'>
                    <FaSignOutAlt className="me-2" /> A assistida saiu da instituição em {new Date(evento.dataSaida).toLocaleDateString('pt-BR')}
                  </Card.Header>


                  {isUltimo && (
                    <FaPen className='pen' onClick={() => {
                      navigate('/internacoes', {
                        // seta editMode para lógica de edição
                        state: {
                          openModalSaida: true,
                          editMode: true,
                          // passa os dados da saida
                          saida: {
                            id: evento.id,
                            assistida_id: evento.assistidaId || evento.assistida_id,
                            motivoSaida: evento.motivoSaida,
                            observacoes: evento.observacoesSaida,
                            dataSaida: evento.dataSaida,
                            dataEntrada: dataEntrada
                          }
                        }
                      });
                    }} />
                  )}
                </div>
              </h4>
              <div className="timeline-line"></div>
              <div className="timeline-date">
                <span>{formatarData(evento.dataSaida)}</span>
              </div>

              <div className="hpr d-flex mt-4 informacoes">
                <div className="item">
                  <p><strong>Dias de Internação:</strong> {calcularDiasInternacao(dataEntrada, evento.dataSaida)} dias</p>
                </div>
                <div className="item">
                  <p><strong>Motivo da Saída:</strong> {evento.motivoSaida}</p>
                </div>
                <div className="item">
                  {evento.observacoesSaida && <p><strong>Observações:</strong> {evento.observacoesSaida}</p>}
                </div>
              </div>
            </div>
          );
        }
      })}

    </div>
  );
};

export default LinhaDoTempo;
