//Aldruin Bonfim de Lima Souza - RA 10482416915
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function TitleHandler() {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case '/medicamentos':
        document.title = 'Casa+ Gerenciar Medicamentos';
        break;
      case '/internacoes':
        document.title = 'Casa+ Gestão de Internações';
        break;
      default:
        document.title = 'Casa+ - Instituto Casa de Lazaro de Betânia';
    }
  }, [location.pathname]);

  return null;
}

export default TitleHandler;