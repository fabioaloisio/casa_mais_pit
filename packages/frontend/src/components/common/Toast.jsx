import { useState, useEffect } from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const Toast = ({ show, onClose, message, type = 'success', duration = 3000 }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-success" />;
      case 'danger':
      case 'error':
        return <FaTimesCircle className="text-danger" />;
      case 'warning':
        return <FaExclamationTriangle className="text-warning" />;
      case 'info':
        return <FaInfoCircle className="text-info" />;
      default:
        return <FaCheckCircle className="text-success" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'light';
      case 'danger':
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'light';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999
      }}
    >
      <BootstrapToast
        show={visible}
        onClose={() => {
          setVisible(false);
          onClose && onClose();
        }}
        bg={getVariant()}
        className="d-flex align-items-center"
      >
        <BootstrapToast.Body className="d-flex align-items-center gap-2">
          {getIcon()}
          <span>{message}</span>
        </BootstrapToast.Body>
      </BootstrapToast>
    </div>
  );
};

export default Toast;