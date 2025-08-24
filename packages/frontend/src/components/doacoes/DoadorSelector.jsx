import { useState, useEffect } from 'react';
import { Form, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import doadoresService from '../../services/doadoresService';

const DoadorSelector = ({ 
  selectedDoador, 
  onDoadorSelect, 
  tipoDoador = 'PF',
  onTipoChange,
  required = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doadores, setDoadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');

  // Buscar doadores quando o tipo muda ou quando há termo de busca
  useEffect(() => {
    if (searchTerm.length >= 2) {
      buscarDoadores();
    } else {
      setDoadores([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, tipoDoador]);

  const buscarDoadores = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filtros = {
        tipo_doador: tipoDoador,
        search: searchTerm,
        ativo: true
      };

      const resultado = await doadoresService.search(filtros);
      setDoadores(resultado);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar doadores:', error);
      setError('Erro ao buscar doadores');
      setDoadores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Se limpar o campo, limpar seleção
    if (!value) {
      onDoadorSelect(null);
      setShowSuggestions(false);
    }
  };

  const handleDoadorSelect = (doador) => {
    setSearchTerm(`${doador.nome} - ${formatarDocumento(doador.documento, doador.tipo_doador)}`);
    setShowSuggestions(false);
    onDoadorSelect(doador);
  };

  const handleTipoChange = (e) => {
    const novoTipo = e.target.value;
    onTipoChange(novoTipo);
    
    // Limpar seleção atual se mudar o tipo
    if (selectedDoador && selectedDoador.tipo_doador !== novoTipo) {
      onDoadorSelect(null);
      setSearchTerm('');
    }
  };

  const formatarDocumento = (documento, tipo) => {
    if (tipo === 'PF') {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleNewDoador = () => {
    // Sinal para abrir modal de novo doador
    onDoadorSelect('NEW_DOADOR');
    setShowSuggestions(false);
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Tipo de Doador {required && '*'}</Form.Label>
            <Form.Select
              value={tipoDoador}
              onChange={handleTipoChange}
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group className="position-relative">
            <Form.Label>
              Buscar Doador {required && '*'}
              <small className="text-muted ms-2">
                (digite nome ou documento)
              </small>
            </Form.Label>
            <Form.Control
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={`Busque por nome ou ${tipoDoador === 'PF' ? 'CPF' : 'CNPJ'}`}
              onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
            />
            
            {/* Lista de sugestões */}
            {showSuggestions && (
              <ListGroup 
                className="position-absolute w-100 mt-1" 
                style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
              >
                {loading && (
                  <ListGroup.Item className="text-center">
                    <small>Buscando doadores...</small>
                  </ListGroup.Item>
                )}
                
                {!loading && doadores.length === 0 && searchTerm.length >= 2 && (
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Nenhum doador encontrado para "{searchTerm}"
                      </small>
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={handleNewDoador}
                      >
                        + Cadastrar Doador
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
                
                {!loading && doadores.map(doador => (
                  <ListGroup.Item 
                    key={doador.id}
                    action
                    onClick={() => handleDoadorSelect(doador)}
                    className="cursor-pointer"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{doador.nome}</strong>
                        <br />
                        <small className="text-muted">
                          {formatarDocumento(doador.documento, doador.tipo_doador)}
                          {doador.telefone && ` • ${doador.telefone}`}
                        </small>
                      </div>
                      <Badge bg="secondary">
                        {doador.tipo_doador}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
                
                {!loading && doadores.length > 0 && (
                  <ListGroup.Item className="text-center border-top">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={handleNewDoador}
                    >
                      + Cadastrar Novo Doador
                    </Button>
                  </ListGroup.Item>
                )}
              </ListGroup>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Doador selecionado */}
      {selectedDoador && selectedDoador !== 'NEW_DOADOR' && (
        <Row className="mb-3">
          <Col>
            <div className="p-3 bg-light rounded">
              <h6 className="mb-2">Doador Selecionado:</h6>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{selectedDoador.nome}</strong>
                  <br />
                  <small className="text-muted">
                    {formatarDocumento(selectedDoador.documento, selectedDoador.tipo_doador)}
                    {selectedDoador.email && ` • ${selectedDoador.email}`}
                    {selectedDoador.telefone && ` • ${selectedDoador.telefone}`}
                  </small>
                  {selectedDoador.endereco && (
                    <>
                      <br />
                      <small className="text-muted">
                        {selectedDoador.endereco}
                        {selectedDoador.cidade && `, ${selectedDoador.cidade}`}
                        {selectedDoador.estado && `/${selectedDoador.estado}`}
                        {selectedDoador.cep && ` - ${selectedDoador.cep}`}
                      </small>
                    </>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  onClick={() => {
                    onDoadorSelect(null);
                    setSearchTerm('');
                  }}
                >
                  Remover
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {error && (
        <Row className="mb-3">
          <Col>
            <small className="text-danger">{error}</small>
          </Col>
        </Row>
      )}
    </>
  );
};

export default DoadorSelector;