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

export const GET_COLECCIONES = gql`
  query obtenerColecciones {
    listarColecciones(
    $titulo: String
    $descripcion: String
    $tipo_algoritmo: String
    $fuente_id: String) {
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
    ){
      titulo
      descripcion
      id_coleccion
      hechos{
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

export const GET_COLECCION_ID = gql`
  query obtenerColeccionPorID($coleccionID: ID!) {
    obtenerColeccionPorId(coleccionID: $coleccionID) {
        id_coleccion
        titulo
        descripcion
        cantidadHechos
        fuentes
        tipoDeAlgoritmo
        hechos{
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
        $modoNavegacion: String
        $fecha_reporte_desde: String
        $fecha_reporte_hasta: String
        $fecha_acontecimiento_desde: String
        $fecha_acontecimiento_hasta: String
        $provincia: String
        $fuenteTipo: String
        $q: String
        $page: Int
        $size: Int
    ){
        listarHechosSegun(
            modoNavegacion: $modoNavegacion
            fecha_reporte_desde: $fecha_reporte_desde
            fecha_reporte_hasta: $fecha_reporte_hasta
            fecha_acontecimiento_desde: $fecha_acontecimiento_desde
            fecha_acontecimiento_hasta: $fecha_acontecimiento_hasta
            provincia: $provincia
            fuenteTipo: $fuenteTipo
            q: $q
            page: $page
            size: $size
        ){
            content {
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
            totalPages
            page
            size
        }
    }
`;