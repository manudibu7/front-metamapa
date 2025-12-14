import React from 'react';

export const CollectionForm = ({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitting,
  fuentesDisponibles, // Array {nombre, tipo}
  categoriasOptions,
  errorMsg
}) => {

  const algoritmosDisponibles = [
    { label: "Mayoría Simple", value: "MAYORIA_SIMPLE" },
    { label: "Absoluta", value: "ABSOLUTA" },
    { label: "Default", value: "DEFAULT" },
    { label: "Múltiples Menciones", value: "MULTIPLES_MENCIONES" }
  ];

  const configCriterios = {
    fechaAntes: { inputType: 'date', options: [] },
    fechaDespues: { inputType: 'date', options: [] },
    categoria: { inputType: 'select', options: categoriasOptions },
    etiqueta: { inputType: 'text', options: [] },
    titulo: { inputType: 'text', options: [] }
  };

  const criterioTipos = Object.keys(configCriterios);

  // --- Handlers internos ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFuenteSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    setForm((prev) => ({
      ...prev,
      fuentes: [...(prev.fuentes || []), val]
    }));
    e.target.selectedIndex = 0;
  };

  const removeFuente = (fuenteName) => {
    setForm((prev) => ({
      ...prev,
      fuentes: prev.fuentes.filter(f => f !== fuenteName)
    }));
  };

  const handleCriterioChange = (index, field, value) => {
    setForm((prev) => {
      const nuevos = [...prev.criterios];
      nuevos[index] = { ...nuevos[index], [field]: value };
      return { ...prev, criterios: nuevos };
    });
  };

  const addCriterio = () => {
    setForm((prev) => ({
      ...prev,
      criterios: [...prev.criterios, { tipo: "", valor: "" }],
    }));
  };

  const removeCriterio = (index) => {
    setForm((prev) => ({
      ...prev,
      criterios: prev.criterios.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      {errorMsg && <div className="modal-toast">{errorMsg}</div>}

      <label>
        Título
        <input
          type="text"
          name="titulo"
          value={form.titulo}
          onChange={handleInputChange}
          required
          maxLength={200}
        />
      </label>
      
      <label>
        Descripción
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleInputChange}
          rows={3}
        />
      </label>

      <label>
        Algoritmo de concenso
        <select
          name="algoritmoConcenso"
          value={form.algoritmoConcenso}
          onChange={handleInputChange}
        >
          <option value="">Selecciona un algoritmo</option>
          {algoritmosDisponibles.map(alg => (
            <option key={alg.value} value={alg.value}>{alg.label}</option>
          ))}
        </select>
      </label>

      {/* SECCIÓN FUENTES */}
      <fieldset className="gestion-colecciones__fuentes">
        <label>Fuente
          <select onChange={handleFuenteSelect} defaultValue="">
            <option value="">Agregar fuente...</option>
            {fuentesDisponibles.map((fObj) => {
              const isSelected = form.fuentes.includes(fObj.nombre);
              return (
                <option
                  key={fObj.nombre}
                  value={fObj.nombre}
                  disabled={isSelected}
                  style={isSelected ? { color: '#999', fontStyle: 'italic', background: '#f5f5f5' } : {}}
                >
                  {fObj.nombre} ({fObj.tipo}) {isSelected ? '(Seleccionado)' : ''}
                </option>
              );
            })}
          </select>
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          {form.fuentes.map((nombreFuente) => {
            const fuenteData = fuentesDisponibles.find(item => item.nombre === nombreFuente);
            const tipoMostrado = fuenteData ? fuenteData.tipo : '';

            return (
              <span key={nombreFuente} style={{ background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {nombreFuente}
                {tipoMostrado && <span style={{ fontSize: '0.8em', color: '#666' }}>({tipoMostrado})</span>}
                <button
                  type="button"
                  onClick={() => removeFuente(nombreFuente)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </fieldset>

      {/* SECCIÓN CRITERIOS */}
      <fieldset className="gestion-colecciones__criterios">
        <legend>Criterios / Condiciones de Pertenencia</legend>
        {form.criterios.map((criterio, idx) => {
          const config = configCriterios[criterio.tipo] || { inputType: 'text', options: [] };
          const isExisting = !!criterio.id;
          const isDate = config.inputType === 'date';
          const showAsLabel = isExisting && !isDate;
          const existeCategoria = form.criterios.some(c => c.tipo === 'categoria');
          const existeFechaAntes = form.criterios.some(c => c.tipo === 'fechaAntes');
          const existeFechaDespues = form.criterios.some(c => c.tipo === 'fechaDespues');

          if (showAsLabel) {
            return (
              <div key={idx} className="gestion-colecciones__criterio-row criterio-label-mode">
                <span className="criterio-label-text">
                  <strong>{criterio.tipo}:</strong> {criterio.valor}
                </span>
                <span title="Condición guardada (Solo lectura)" style={{ cursor: 'help', marginRight: 'auto', marginLeft: '8px' }}></span>
                <button type="button" className="btn btn--icon" onClick={() => removeCriterio(idx)}>✕</button>
              </div>
            );
          }
          return (
            <div key={idx} className="gestion-colecciones__criterio-row">
              <select
                value={criterio.tipo}
                disabled={isExisting}
                onChange={(e) => {
                  handleCriterioChange(idx, 'tipo', e.target.value);
                  handleCriterioChange(idx, 'valor', '');
                }}
              >
                <option value="" disabled>Seleccionar criterio...</option>
                {criterioTipos.map((tipo) => (
                  <option
                    key={tipo}
                    value={tipo}
                    disabled={
                      (tipo === 'categoria' && existeCategoria && criterio.tipo !== 'categoria') ||
                      (tipo === 'fechaAntes' && existeFechaAntes && criterio.tipo !== 'fechaAntes') ||
                      (tipo === 'fechaDespues' && existeFechaDespues && criterio.tipo !== 'fechaDespues')
                    }
                  >
                    {tipo}
                  </option>
                ))}
              </select>

              {config.inputType === 'select' ? (
                <select
                  value={criterio.valor}
                  onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                >
                  <option value="" disabled>Seleccionar...</option>
                  {config.options.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={config.inputType}
                  placeholder="Valor"
                  value={criterio.valor}
                  onChange={(e) => handleCriterioChange(idx, 'valor', e.target.value)}
                />
              )}
              <button type="button" className="btn btn--icon" onClick={() => removeCriterio(idx)}>✕</button>
            </div>
          );
        })}
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => addCriterio()}
        >
          + Agregar criterio
        </button>
      </fieldset>

      <div className="gestion-colecciones__modal-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};