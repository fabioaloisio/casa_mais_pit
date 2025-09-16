import React from 'react';
import { Badge } from 'react-bootstrap';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'pendente': {
        bg: 'warning',
        text: 'Pendente',
        icon: '⏳'
      },
      'aprovado': {
        bg: 'info',
        text: 'Aprovado',
        icon: '✅'
      },
      'ativo': {
        bg: 'success',
        text: 'Ativo',
        icon: '🟢'
      },
      'rejeitado': {
        bg: 'danger',
        text: 'Rejeitado',
        icon: '❌'
      },
      'bloqueado': {
        bg: 'dark',
        text: 'Bloqueado',
        icon: '🔒'
      },
      'suspenso': {
        bg: 'secondary',
        text: 'Suspenso',
        icon: '⏸️'
      },
      'inativo': {
        bg: 'light',
        text: 'Inativo',
        icon: '💤',
        textColor: 'dark'
      }
    };

    return configs[status] || {
      bg: 'secondary',
      text: status || 'Indefinido',
      icon: '❓'
    };
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      bg={config.bg}
      text={config.textColor}
      className="d-flex align-items-center gap-1"
      style={{ fontSize: '0.8rem' }}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </Badge>
  );
};

export default StatusBadge;