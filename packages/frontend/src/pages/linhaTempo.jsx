import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { FaCalendarAlt, FaEdge, FaEllipsisH, FaFileAlt, FaOptinMonster, FaPen } from 'react-icons/fa';
import { BsHospital, BsDropletHalf, BsCapsule } from 'react-icons/bs';
import '../components/assistidas/style/Assistidas.css';

import { Dropdown, ButtonGroup } from 'react-bootstrap';
import { FaEllipsisV } from 'react-icons/fa';


// Função de formatação de data
const formatarData = (data) => {
  if (!data) return '-';
  const dt = new Date(data);
  return dt.toLocaleDateString('pt-BR');
};

const LinhaDoTempo = ({ hprList }) => {
  const hprOrdenado = [...hprList].sort((a, b) => {
    const dataA = new Date(a.data_atendimento);
    const dataB = new Date(b.data_atendimento);
    return dataB - dataA; // maior (mais recente) primeiro
  });
  return (
    <div className="timeline-container">

      {hprOrdenado.map((hpr, idx) => (

        <div className="timeline-item" key={idx}>

          <Card.Header className="d-flex justify-content-between align-items-center">
            <span className='mb-4'><FaEllipsisH className="me-2" /> Alteração e Exclusão da HRP</span>

            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle className='mb-4' size='sm' >
                {/* <FaEllipsisV /> */}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleEdit(hpr)}>Editar</Dropdown.Item>
                <Dropdown.Item onClick={() => handleDeleteHPR(hpr.id)}>Excluir</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Card.Header>


          {/* Linha vertical */}
          <div className="timeline-line"></div>

          {/* Data e hora na lateral */}
          <div className="timeline-date">
            <span>{formatarData(hpr.data_atendimento)}</span>
            <span>{hpr.hora || '-'}</span>
          </div>

          {/* Conteúdo do atendimento */}
          <div className="hpr">
            {/* Informações de Atendimento e Internações */}
            <Row className="mb-4">
              <Col md={5}>
                <Card>
                  <Card.Header>
                    <FaCalendarAlt className="me-2" /> Informações de Atendimento
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Data do Último Atendimento:</strong> {formatarData(hpr.data_atendimento)}</p>
                    <p><strong>Hora:</strong> {hpr.hora || '-'}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={7}>
                <Card>
                  <Card.Header><BsHospital className="me-2" /> Internações</Card.Header>
                  <Card.Body>
                    {hpr.internacoes?.length > 0 ? (
                      <Table striped bordered size="sm">
                        <thead>
                          <tr>
                            <th>Local</th>
                            <th>Duração</th>
                            <th>Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hpr.internacoes.map((i, idx) => (
                            <tr key={idx}>
                              <td>{i.local}</td>
                              <td>{i.duracao}</td>
                              <td>{formatarData(i.data)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3"><strong>Motivação:</strong> {hpr.motivacao_internacoes}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    ) : (
                      <p className="text-muted mb-0">Sem internações registradas.</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Drogas e Medicamentos */}
            <Row className="mb-4">
              <Col md={7}>
                <Card>
                  <Card.Header><BsDropletHalf className="me-2" /> Substâncias Utilizadas</Card.Header>
                  <Card.Body>
                    {hpr.drogas?.length > 0 ? (
                      <Table striped bordered size="sm">
                        <thead>
                          <tr>
                            <th>Substância</th>
                            <th>Idade de Início</th>
                            <th>Tempo de Uso</th>
                            <th>Tempo sem Uso</th>
                            <th>Intensidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hpr.drogas.map((d, idx) => (
                            <tr key={idx}>
                              <td>{d.tipo}</td>
                              <td>{d.idade_inicio} anos</td>
                              <td>{d.tempo_uso}</td>
                              <td>{hpr.tempo_sem_uso}</td>
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
                    {hpr.medicamentos?.length > 0 ? (
                      <Table striped bordered size="sm">
                        <thead>
                          <tr>
                            <th >Nome</th>
                            <th>Dosagem</th>
                            <th>Frequência</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hpr.medicamentos.map((med, idx) => (
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

            {/* História Patológica */}
            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Header><FaFileAlt className="me-2" /> História Patológica e Observações</Card.Header>
                  <Card.Body>
                    <p><strong>História Patológica Regressa:</strong></p>
                    <p className="p-3 bg-light rounded">{hpr.historia_patologica || 'Não informado'}</p>

                    {hpr.fatos_marcantes && <p><strong>Fatos Marcantes:</strong> {hpr.fatos_marcantes}</p>}
                    {hpr.infancia && <p><strong>Infância:</strong> {hpr.infancia}</p>}
                    {hpr.adolescencia && <p><strong>Adolescência:</strong> {hpr.adolescencia}</p>}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      ))}
    </div>

  );
};

export default LinhaDoTempo;
