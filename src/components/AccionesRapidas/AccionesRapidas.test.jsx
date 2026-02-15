import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccionesRapidas } from './AccionesRapidas'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('AccionesRapidas', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  // ----------------------------
  // RENDER
  // ----------------------------

  test('renderiza el título y subtítulo de la sección', () => {
    render(<AccionesRapidas />)

    expect(screen.getByText('Barra rápida')).toBeInTheDocument()
    expect(
      screen.getByText('Acciones inmediatas sobre el agregador')
    ).toBeInTheDocument()
  })

  test('renderiza las 4 acciones rápidas', () => {
    render(<AccionesRapidas />)

    const botones = screen.getAllByRole('button')
    expect(botones).toHaveLength(4)
  })

  test('muestra correctamente los textos de cada acción', () => {
    render(<AccionesRapidas />)

    expect(screen.getByText('Mapa Leaflet')).toBeInTheDocument()
    expect(screen.getByText('Colecciones curadas')).toBeInTheDocument()
    expect(screen.getByText('Subir contribución')).toBeInTheDocument()
    expect(screen.getByText('Panel de estadísticas')).toBeInTheDocument()
  })

  // ----------------------------
  // INTERACCIONES
  // ----------------------------

  test('ejecuta onVerColecciones cuando se hace click en "Abrir tablero"', () => {
    const onVerColecciones = jest.fn()

    render(<AccionesRapidas onVerColecciones={onVerColecciones} />)

    userEvent.click(screen.getByText('Abrir tablero'))

    expect(onVerColecciones).toHaveBeenCalledTimes(1)
  })

  test('no rompe si onVerColecciones no está definido', () => {
    render(<AccionesRapidas />)

    expect(() => {
      userEvent.click(screen.getByText('Abrir tablero'))
    }).not.toThrow()
  })

  test('navega a /contribuir al hacer click en "Completar formulario"', () => {
    render(<AccionesRapidas />)

    userEvent.click(screen.getByText('Completar formulario'))

    expect(mockNavigate).toHaveBeenCalledWith('/contribuir')
  })

  test('navega a /estadisticas al hacer click en "Ver estadísticas"', () => {
    render(<AccionesRapidas />)

    userEvent.click(screen.getByText('Ver estadísticas'))

    expect(mockNavigate).toHaveBeenCalledWith('/estadisticas')
  })

  // ----------------------------
  // DESPLAZAMIENTO (DOM)
  // ----------------------------

  test('hace scroll al mapa cuando existe el elemento destino', () => {
    const scrollIntoViewMock = jest.fn()

    const mapa = document.createElement('div')
    mapa.id = 'mapa-hechos'
    mapa.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(mapa)

    render(<AccionesRapidas />)

    userEvent.click(screen.getByText('Ir al mapa'))

    expect(scrollIntoViewMock).toHaveBeenCalled()

    document.body.removeChild(mapa)
  })

  test('no falla si el elemento de scroll no existe', () => {
    render(<AccionesRapidas />)

    expect(() => {
      userEvent.click(screen.getByText('Ir al mapa'))
    }).not.toThrow()
  })
})