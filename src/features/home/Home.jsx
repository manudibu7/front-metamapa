import { useNavigate } from 'react-router-dom';
import './Home.css';
import { Hero } from '../../components/Hero/Hero';
import { ServiceOverview } from '../../components/ServiceOverview/ServiceOverview';
import { AccionesRapidas } from '../../components/AccionesRapidas/AccionesRapidas';
import { TableroHechos } from '../../components/TableroHechos/TableroHechos';
import { ColeccionesDestacadas } from '../../components/ColeccionesDestacadas/ColeccionesDestacadas';
import { useCollectionsContext } from '../../context/CollectionsContext';

export const Home = ({ onLogin, isAuthenticated }) => {
  const { collections, isLoading } = useCollectionsContext();
  const navigate = useNavigate();

  const handleExplore = () => navigate('/colecciones');

  return (
    <div className="home">
      <Hero onExplore={handleExplore} onLogin={onLogin} isAuthenticated={isAuthenticated} />
      <AccionesRapidas onVerColecciones={handleExplore} />
      <TableroHechos />
      <ColeccionesDestacadas colecciones={collections} cargando={isLoading} onExplorar={handleExplore} />
      <ServiceOverview />
    </div>
  );
};
