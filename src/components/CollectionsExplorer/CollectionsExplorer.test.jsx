import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CollectionsExplorer } from './CollectionsExplorer'

jest.mock('../MapPreview/MapPreview', () => ({
  MapPreview: () => <div>Mapa mock</div>,
}))

jest.mock('../HechoList/HechoList', () => ({
  HechoList: () => <div>Lista mock</div>,
}))

jest.mock('../../helpers/collections', () => ({
  buildMarkers: jest.fn(() => []),
}))

test('muestra loading cuando loading es true', () => {
  render(<CollectionsExplorer loading />)

  expect(
    screen.getByText('Cargando colecciones...')
  ).toBeInTheDocument()
})

test('no renderiza nada si collections está vacío', () => {
  const { container } = render(
    <CollectionsExplorer collections={[]} />
  )

  expect(container.firstChild).toBeNull()
})

test('renderiza una pestaña por colección', () => {
  render(
    <CollectionsExplorer
      collections={[
        {
          id: 1,
          titulo: 'Colección A',
          totalHechos: 2,
          hechos: [],
          fuentes: [],
          consenso: 'Alto',
          estado: 'Activa',
          descripcion: '',
        },
        {
          id: 2,
          titulo: 'Colección B',
          totalHechos: 5,
          hechos: [],
          fuentes: [],
          consenso: 'Medio',
          estado: 'Cerrada',
          descripcion: '',
        },
      ]}
    />
  )

  expect(
    screen.getByRole('button', { name: /Colección A/i })
  ).toBeInTheDocument()

  expect(
    screen.getByRole('button', { name: /Colección B/i })
  ).toBeInTheDocument()
})

test('muestra botón Cerrar y ejecuta onClose', async () => {
  const onClose = jest.fn()

  render(
  <CollectionsExplorer
    collections={[{ id: 1, titulo: 'Colección', hechos: [], fuentes: [] }]}
    onClose={onClose}
  />
)
  await userEvent.click(screen.getByText('Cerrar'))

  expect(onClose).toHaveBeenCalled()
})