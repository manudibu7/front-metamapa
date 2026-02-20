import { gql } from '@apollo/client';

export const GET_CATEGORIAS = gql`
  query obtenerCategorias {
    listarCategorias {
      nombre
    }
  }
`;

export const GET_PROVINCIAS = gql`
  query obtenerProvincias {
    listarProvincias {
      nombre
    }
  }
`;

// CORREGIDO: Se agregaron las definiciones de variables ($titulo: String, etc.)
export const GET_COLECCIONES = gql`
  query obtenerColecciones(
    $titulo: String
    $descripcion: String
    $tipo_algoritmo: String
    $fuente_id: [String] 
  ) {
    listarColecciones(
      titulo: $titulo
      descripcion: $descripcion
      tipo_algoritmo: $tipo_algoritmo
      fuente_id: $fuente_id
    ) {
      id_coleccion
      titulo
      descripcion
      cantidadHechos
      fuentes
      tipoDeAlgoritmo
    }
  }
`;

export const GET_HECHOS_COLECCION = gql`
  query obtenerHechosDeColeccion(
    $coleccionID: ID!
    $modoNavegacion: String
    $fecha_reporte_desde: String
    $fecha_reporte_hasta: String
    $fecha_acontecimiento_desde: String
    $fecha_acontecimiento_hasta: String
    $provincia: String
    $fuenteTipo: String
    $q: String
  ) {
    listarHechosDeUnaColeccion(
      coleccionID: $coleccionID
      modoNavegacion: $modoNavegacion
      fecha_reporte_desde: $fecha_reporte_desde
      fecha_reporte_hasta: $fecha_reporte_hasta
      fecha_acontecimiento_desde: $fecha_acontecimiento_desde
      fecha_acontecimiento_hasta: $fecha_acontecimiento_hasta
      provincia: $provincia
      fuenteTipo: $fuenteTipo
      q: $q
    ) {
      titulo
      descripcion
      id_coleccion
      hechos {
        id_hecho
        titulo
        descripcion
        categoria
        fecha
        fechaDeCarga
        etiqueta
        tipoHecho
        fuente
        ubicacion {
          latitud
          longitud
          provincia
          pais
        }
        adjuntos {
          url
          tipoMedia
        }
      }
    }
  }
`;

// CORREGIDO: Se agregó la llave de cierre "}" faltante y se corrigió el nombre del campo (ID mayúscula)
export const GET_COLECCION_ID = gql`
  query obtenerColeccionPorID($coleccionID: ID!) {
    obtenerColeccionPorID(coleccionID: $coleccionID) {
      id_coleccion
      titulo
      descripcion
      cantidadHechos
      fuentes
      tipoDeAlgoritmo
      hechos {
        id_hecho
        titulo
        descripcion
        categoria
        fecha
        fechaDeCarga
        etiqueta
        tipoHecho
        fuente
        ubicacion {
          latitud
          longitud
          provincia
          pais
        }
        adjuntos {
          url
          tipoMedia
        }
      }
    }
  }
`;

export const GET_HECHO = gql`
  query obtenerHecho($id: ID!) {
    obtenerHecho(id: $id) {
      id_hecho
      titulo
      descripcion
      categoria
      fecha
      fechaDeCarga
      etiqueta
      tipoHecho
      fuente
      ubicacion {
        latitud
        longitud
        provincia
        pais
      }
      adjuntos {
        url
        tipoMedia
      }
    }
  }
`;

export const GET_HECHOS_FILTRADOS = gql`
  query obtenerHechosFiltrados(
    $fecha_reporte_desde: String
    $fecha_reporte_hasta: String
    $fecha_acontecimiento_desde: String
    $fecha_acontecimiento_hasta: String
    $provincia: String
    $fuenteTipo: String
    $q: String
    $page: Int
    $size: Int
    $categoria: String
  ) {
    listarHechosSegun(
      fecha_reporte_desde: $fecha_reporte_desde
      fecha_reporte_hasta: $fecha_reporte_hasta
      fecha_acontecimiento_desde: $fecha_acontecimiento_desde
      fecha_acontecimiento_hasta: $fecha_acontecimiento_hasta
      provincia: $provincia
      fuenteTipo: $fuenteTipo
      q: $q
      page: $page
      size: $size
      categoria: $categoria
    ) {
      content {
        id_hecho
        titulo
        descripcion
        categoria
        fecha
        fuente
        ubicacion {
          provincia
        }
      }
      totalPages
      totalElements
    }
  }
`;