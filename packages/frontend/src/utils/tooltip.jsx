import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaInfoCircle } from 'react-icons/fa';

const InfoTooltip = ({
  texto,
  posicao = 'bottom',

  // Layout
  minLargura = '240px',
  maxLargura = '420px',
  tamanhoFonte = '13px',
  padding = '15px 14px',

  // Offset fino
  offset = { x: 0, y: 0 },

  // Aparência
  iconeSize = 15,
  corFundo = '#1a365d',
  corTexto = '#ffffff'
}) => {
  const [visivel, setVisivel] = useState(false);
  const [posicaoFinal, setPosicaoFinal] = useState(posicao);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const posicoesBase = {
    top: { arrowBottom: '-6px' },
    bottom: { arrowTop: '-6px' },
    left: { arrowRight: '-6px' },
    right: { arrowLeft: '-6px' }
  };

  const calcularPosicao = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const margin = 25;

    let novaPosicao = posicao;
    let top = 0;
    let left = 0;

    const espacoAbaixo = window.innerHeight - trigger.bottom;
    const espacoAcima = trigger.top;
    const espacoDireita = window.innerWidth - trigger.right;
    const espacoEsquerda = trigger.left;

    if (posicao === 'bottom' && espacoAbaixo < tooltip.height + margin) {
      novaPosicao = 'top';
    } else if (posicao === 'top' && espacoAcima < tooltip.height + margin) {
      novaPosicao = 'bottom';
    } else if (posicao === 'right' && espacoDireita < tooltip.width + margin) {
      novaPosicao = 'left';
    } else if (posicao === 'left' && espacoEsquerda < tooltip.width + margin) {
      novaPosicao = 'right';
    }

    switch (novaPosicao) {
      case 'top':
        top = trigger.top - tooltip.height - margin;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;

      case 'bottom':
        top = trigger.bottom + margin;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;

      case 'left':
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.left - tooltip.width - margin;
        break;

      case 'right':
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.right + margin;
        break;
    }

    setCoords({
      top: top + offset.y,
      left: left + offset.x
    });

    setPosicaoFinal(novaPosicao);
  };

  useEffect(() => {
    if (!visivel) return;

    calcularPosicao();
    window.addEventListener('scroll', calcularPosicao, true);
    window.addEventListener('resize', calcularPosicao);

    return () => {
      window.removeEventListener('scroll', calcularPosicao, true);
      window.removeEventListener('resize', calcularPosicao);
    };
  }, [visivel, posicao, offset]);

  const base = posicoesBase[posicaoFinal];

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisivel(true)}
      onMouseLeave={() => setVisivel(false)}
      onFocus={() => setVisivel(true)}
      onBlur={() => setVisivel(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Informação: ${texto}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'help',
          padding: 0,
          margin: "5px 0 5px 0",
          display: 'inline-flex',
          alignItems: 'center'
        }}
      >
        <FaInfoCircle size={iconeSize} color="#66b3ff" />
      </button>

      {visivel && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,

            backgroundColor: corFundo,
            color: corTexto,
            padding,
            borderRadius: '10px',
            fontSize: tamanhoFonte,

            minWidth: minLargura,
            maxWidth: "300px",
            width: 'max-content',

            lineHeight: '1.5',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textAlign: 'left',

            zIndex: 10000,
            boxShadow: '0 8px 20px rgba(0,0,0,.35)',
            pointerEvents: 'auto'
          }}
        >
          {texto}

          {/* Setinha */}
          <span
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              backgroundColor: corFundo,

              ...(base.arrowTop && {
                top: base.arrowTop,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)'
              }),
              ...(base.arrowBottom && {
                bottom: base.arrowBottom,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)'
              }),
              ...(base.arrowLeft && {
                left: base.arrowLeft,
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)'
              }),
              ...(base.arrowRight && {
                right: base.arrowRight,
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)'
              })
            }}
          />
        </div>
      )}
    </span>
  );
};

InfoTooltip.propTypes = {
  texto: PropTypes.string.isRequired,
  posicao: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  offset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  minLargura: PropTypes.string,
  maxLargura: PropTypes.string,
  tamanhoFonte: PropTypes.string,
  padding: PropTypes.string,
  iconeSize: PropTypes.number,
  corFundo: PropTypes.string,
  corTexto: PropTypes.string
};

export default InfoTooltip;
