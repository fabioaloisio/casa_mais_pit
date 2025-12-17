import { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { MedicamentoService } from '../../services/MedicamentoService';
import './SeletorMedicamento.css';

const SeletorMedicamento = ({
  value,
  onChange,
  placeholder = 'Busque e selecione o medicamento',
  disabled = false,
  required = false,
  className = ''
}) => {
  const [busca, setBusca] = useState('');
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [todosCarregados, setTodosCarregados] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Carregar todos os medicamentos uma vez
  const carregarTodosMedicamentos = useCallback(async () => {
    if (todosCarregados) return;

    try {
      setLoading(true);
      const dados = await MedicamentoService.obterTodos();
      setMedicamentos(dados);
      setTodosCarregados(true);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    } finally {
      setLoading(false);
    }
  }, [todosCarregados]);

  // Filtrar medicamentos localmente
  const medicamentosFiltrados = medicamentos.filter(med => {
    if (!busca || busca.length < 2) return true;
    const termoBusca = busca.toLowerCase();
    return (
      med.nome?.toLowerCase().includes(termoBusca) ||
      med.forma_farmaceutica?.toLowerCase().includes(termoBusca)
    );
  }).slice(0, 20); // Limitar a 20 resultados

  // Carregar medicamentos quando o componente montar
  useEffect(() => {
    carregarTodosMedicamentos();
  }, [carregarTodosMedicamentos]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowDropdown(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < medicamentosFiltrados.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && medicamentosFiltrados[highlightedIndex]) {
          selecionarMedicamento(medicamentosFiltrados[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    const valor = e.target.value;
    setBusca(valor);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const selecionarMedicamento = (medicamento) => {
    onChange({
      id: medicamento.id,
      nome: medicamento.nome,
      forma_farmaceutica: medicamento.forma_farmaceutica,
      unidade_medida_sigla: medicamento.unidade_sigla || ''
    });
    setBusca('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const limparSelecao = () => {
    onChange(null);
    setBusca('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  // Se já tem um valor selecionado, mostrar ele
  if (value && value.id) {
    return (
      <div className={`seletor-medicamento ${className}`}>
        <div className="seletor-medicamento-selected">
          <span className="seletor-medicamento-value">
            {value.nome}
            {value.forma_farmaceutica && (
              <span className="seletor-medicamento-forma">
                {' '}({value.forma_farmaceutica})
              </span>
            )}
          </span>
          {!disabled && (
            <button
              type="button"
              className="seletor-medicamento-clear"
              onClick={limparSelecao}
              aria-label="Limpar seleção"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`seletor-medicamento ${className}`}>
      <div className="seletor-medicamento-input-wrapper">
        <FaSearch className="seletor-medicamento-search-icon" />
        <Form.Control
          ref={inputRef}
          type="text"
          value={busca}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value}
          className="seletor-medicamento-input"
          autoComplete="off"
        />
        {loading && (
          <Spinner
            animation="border"
            size="sm"
            className="seletor-medicamento-spinner"
          />
        )}
      </div>

      {showDropdown && !disabled && (
        <div ref={dropdownRef} className="seletor-medicamento-dropdown">
          {loading ? (
            <div className="seletor-medicamento-loading">
              Carregando medicamentos...
            </div>
          ) : medicamentosFiltrados.length === 0 ? (
            <div className="seletor-medicamento-empty">
              {busca.length < 2
                ? 'Digite ao menos 2 caracteres para buscar'
                : 'Nenhum medicamento encontrado'
              }
            </div>
          ) : (
            <ul className="seletor-medicamento-list">
              {medicamentosFiltrados.map((med, index) => (
                <li
                  key={med.id}
                  className={`seletor-medicamento-item ${
                    index === highlightedIndex ? 'highlighted' : ''
                  }`}
                  onClick={() => selecionarMedicamento(med)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="seletor-medicamento-item-nome">
                    {med.nome}
                  </span>
                  <span className="seletor-medicamento-item-forma">
                    {med.forma_farmaceutica}
                    {med.unidade_sigla && ` (${med.unidade_sigla})`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SeletorMedicamento;
