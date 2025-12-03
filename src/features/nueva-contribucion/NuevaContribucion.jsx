import { useNavigate } from 'react-router-dom';
import './NuevaContribucion.css';
import { FastFactForm } from '../../components/FastFactForm/FastFactForm';

export const NuevaContribucion = () => {
  const navigate = useNavigate();

  return (
    <div className="nueva-contribucion">
      <button type="button" className="nueva-contribucion__volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>
      <FastFactForm />
    </div>
  );
};
