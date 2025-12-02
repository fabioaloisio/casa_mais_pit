import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaInfoCircle } from 'react-icons/fa';

/**
 * Componente de Tooltip Informativo
 *
 * @param {string} texto - Texto explicativo que será exibido no tooltip
 * @param {string} posicao - Posição do tooltip: 'top', 'bottom', 'left', 'right' (padrão: 'bottom')
 * @returns {JSX.Element} Componente de tooltip com ícone de informação
 */
const InfoTooltip = ({ texto, posicao = 'bottom' }) => {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);

  const posicoesTooltip = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '8px',
      arrowBottom: '-6px',
      arrowLeft: '50%',
      arrowTransform: 'translateX(-50%) rotate(45deg)'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '8px',
      arrowTop: '-6px',
      arrowLeft: '50%',
      arrowTransform: 'translateX(-50%) rotate(45deg)'
    },
    left: {
      top: '50%',
      right: '100%',
      transform: 'translateY(-50%)',
      marginRight: '8px',
      arrowRight: '-6px',
      arrowTop: '50%',
      arrowTransform: 'translateY(-50%) rotate(45deg)'
    },
    right: {
      top: '50%',
      left: '100%',
      transform: 'translateY(-50%)',
      marginLeft: '8px',
      arrowLeft: '-6px',
      arrowTop: '50%',
      arrowTransform: 'translateY(-50%) rotate(45deg)'
    }
  };

  const estiloTooltip = posicoesTooltip[posicao] || posicoesTooltip.bottom;

  return (
    <span
      className="info-tooltip-container"
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <button
        type="button"
        className="info-tooltip-trigger"
        aria-label={`Informação: ${texto}`}
        onMouseEnter={() => setMostrarTooltip(true)}
        onMouseLeave={() => setMostrarTooltip(false)}
        onFocus={() => setMostrarTooltip(true)}
        onBlur={() => setMostrarTooltip(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setMostrarTooltip(false);
          }
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'help',
          display: 'inline-flex',
          alignItems: 'center',
          marginLeft: '6px'
        }}
      >
        <FaInfoCircle
          style={{ color: '#66b3ff' }}
          size={15}
        />
      </button>
      {mostrarTooltip && (
        <div
          className="info-tooltip"
          style={{
            position: 'absolute',
            ...estiloTooltip,
            backgroundColor: '#1a365d',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: '1.5',
            whiteSpace: 'normal',
            maxWidth: '280px',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'none',
            fontWeight: '400',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {texto}
          <span
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              backgroundColor: '#1a365d',
              ...(estiloTooltip.arrowBottom !== undefined && {
                bottom: estiloTooltip.arrowBottom,
                left: estiloTooltip.arrowLeft,
                transform: estiloTooltip.arrowTransform
              }),
              ...(estiloTooltip.arrowTop !== undefined && {
                top: estiloTooltip.arrowTop,
                left: estiloTooltip.arrowLeft,
                transform: estiloTooltip.arrowTransform
              }),
              ...(estiloTooltip.arrowRight !== undefined && {
                right: estiloTooltip.arrowRight,
                top: estiloTooltip.arrowTop,
                transform: estiloTooltip.arrowTransform
              }),
              ...(estiloTooltip.arrowLeft !== undefined && {
                left: estiloTooltip.arrowLeft,
                top: estiloTooltip.arrowTop,
                transform: estiloTooltip.arrowTransform
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
  posicao: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

export default InfoTooltip;

