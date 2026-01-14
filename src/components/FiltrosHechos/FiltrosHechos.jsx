import './FiltrosHechos.css';

const opcionesFuente = [
  { value: 'estatica', label: 'Fuente estática' },
  { value: 'dinamica', label: 'Fuente dinámica' },
  { value: 'proxy', label: 'Fuente proxy' },
];

const opcionesModo = [
  { value: 'curado', label: 'Navegación curada' },
  { value: 'irrestricta', label: 'Navegación irrestricta' },
];

export const FiltrosHechos = ({ categorias, provincias, filtros, onChange }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...filtros, [name]: value });
  };

  return (
    <div className="filtros-hechos">

      <div>
        <label>Categoría</label>
        <select name="categoria" value={filtros.categoria ?? ''} onChange={handleChange}>
          <option value="">Todas</option>
          {categorias.map((category, index) => (
            // Usamos index para garantizar unicidad
            <option key={`${category}-${index}`} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Provincia</label>
        <select name="provincia" value={filtros.provincia ?? ''} onChange={handleChange}>
          <option value="">Todas</option>
          {provincias.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Fuente</label>
        <select name="fuenteTipo" value={filtros.fuenteTipo ?? ''} onChange={handleChange}>
          <option value="">Todas</option>
          {opcionesFuente.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Fecha desde</label>
        <input type="date" name="fechaDesde" value={filtros.fechaDesde ?? ''} onChange={handleChange} />
      </div>
      <div>
        <label>Fecha hasta</label>
        <input type="date" name="fechaHasta" value={filtros.fechaHasta ?? ''} onChange={handleChange} />
      </div>
    </div>
  );
};
