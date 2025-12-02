import React, { useState, useEffect } from 'react';
import { Modal, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import StatusBadge from './StatusBadge';
import apiService from '../../services/api';

const StatusHistory = ({ show, onHide, usuarioId, usuarioNome }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && usuarioId) {
      fetchHistory();
    }
  }, [show, usuarioId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiService.get(`/usuarios/${usuarioId}/status-history`);
      setHistory(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';

      // Usar formato mais compatível
      return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função melhorada para parse seguro das observações
  const parseObservacoes = (observacoes) => {
    try {
      // Verificar se observacoes existe e não é null/undefined
      if (!observacoes) return null;

      // Se já é um objeto, retornar diretamente
      if (typeof observacoes === 'object' && observacoes !== null) {
        return observacoes;
      }

      // Se é string, verificar se pode ser JSON
      if (typeof observacoes === 'string') {
        const trimmed = observacoes.trim();

        // Verificar se parece com JSON
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            const parsed = JSON.parse(trimmed);
            return parsed;
          } catch (parseError) {
            console.warn('Erro ao fazer parse do JSON das observações:', parseError);
            // Se falhar o parse, retornar como texto
            return { texto: observacoes };
          }
        }

        // Se não parece JSON, retornar como texto simples
        return { texto: observacoes };
      }

      // Para outros tipos, converter para string
      return { texto: String(observacoes) };
    } catch (error) {
      console.warn('Erro inesperado ao processar observações:', error);
      return { texto: 'Erro ao processar observações' };
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Histórico de Status - {usuarioNome}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center p-3">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Carregando histórico...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!loading && !error && history.length === 0 && (
          <Alert variant="info">
            Nenhum histórico de alteração de status encontrado.
          </Alert>
        )}

        {!loading && !error && history.length > 0 && (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Data</th>
                <th>Status Anterior</th>
                <th>Status Novo</th>
                <th>Alterado Por</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => {
                const observacoes = parseObservacoes(item.observacoes);

                return (
                  <tr key={index}>
                    <td className="text-nowrap">
                      {formatDate(item.data_alteracao)}
                    </td>
                    <td>
                      <StatusBadge status={item.status_anterior} />
                    </td>
                    <td>
                      <StatusBadge status={item.status_novo} />
                    </td>
                    <td>
                      {item.alterado_por_nome || 'Sistema'}
                    </td>
                    <td>
                      {(() => {
                        try {
                          if (!observacoes) return null;

                          return (
                            <div>
                              {typeof observacoes === 'string' ? (
                                <span>{observacoes}</span>
                              ) : (
                                <>
                                  {observacoes.texto && (
                                    <div>{observacoes.texto}</div>
                                  )}
                                  {observacoes.motivo && (
                                    <div>
                                      <strong>Motivo:</strong> {observacoes.motivo}
                                    </div>
                                  )}
                                  {observacoes.data_fim && (
                                    <div>
                                      <strong>Data Fim:</strong> {formatDate(observacoes.data_fim)}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        } catch (renderError) {
                          console.warn('Erro ao renderizar observações:', renderError);
                          return <div className="text-muted">Erro ao exibir observações</div>;
                        }
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default StatusHistory;