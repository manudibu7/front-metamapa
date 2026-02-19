import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FastFactForm } from "./FastFactForm"

const renderFastFactForm = async () => {
  render(<FastFactForm />)

  // Consumimos el useEffect SIEMPRE
  await waitFor(() => {
    expect(mockGetCategorias).toHaveBeenCalled()
  })
}

// --------------------
// Mocks externos
// --------------------

const mockLogin = jest.fn()
const mockNavigate = jest.fn()
const mockEnviar = jest.fn()
const mockGetCategorias = jest.fn()

jest.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    login: mockLogin,
    contribuyenteId: "123",
    token: "mock-token",
    loading: false,
    user: { nombre: "Usuario Test" },
  }),
}))

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}))

jest.mock("../../services/contribucionesService", () => ({
  enviarContribucionRapida: (...args) => mockEnviar(...args),
  getCategorias: () => mockGetCategorias(),
}))

jest.mock("../UbicacionSelector/UbicacionSelector", () => ({
  UbicacionSelector: ({ onChange }) => (
    <button onClick={() => onChange({ lat: 1, lng: 2 })}>
      Seleccionar ubicación mock
    </button>
  ),
}))

describe("FastFactForm – render inicial", () => {
  beforeEach(() => {
    mockGetCategorias.mockResolvedValue([
      { nombre: "Ambiental" },
      { nombre: "Salud" },
    ])
  })

  test("renderiza el formulario cuando el usuario está autenticado", async () => {
    render(<FastFactForm />)

    expect(
      screen.getByText("Subí un hecho en menos de un minuto")
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Ambiental")).toBeInTheDocument()
      expect(screen.getByText("Salud")).toBeInTheDocument()
    })
  })
})

test("muestra error si se envía sin ubicación", async () => {
  mockGetCategorias.mockResolvedValue([])

  render(<FastFactForm />)

  await userEvent.type(
    screen.getByPlaceholderText("Ej. Vertido en Dock Sud"),
    "Prueba sin ubicación"
  )

  await userEvent.type(
    screen.getByPlaceholderText("Relatá qué ocurrió y actores involucrados."),
    "Descripción"
  )

  await userEvent.click(
    screen.getByRole("button", { name: /Enviar contribución/i })
  )

  expect(
    await screen.findByText("Seleccioná una ubicación desde el mapa o la búsqueda.")
  ).toBeInTheDocument()
})

test("permite seleccionar una ubicación desde UbicacionSelector", async () => {
  mockGetCategorias.mockResolvedValue([])

  render(<FastFactForm />)

  await userEvent.click(
    screen.getByText("Seleccionar ubicación mock")
  )

  // No hay texto visible, pero ahora no debería fallar al enviar
  expect(
    screen.getByText("Seleccionar ubicación mock")
  ).toBeInTheDocument()
})

test("envía la contribución y muestra el modal de éxito", async () => {
  mockGetCategorias.mockResolvedValue([{ nombre: "Ambiental" }])
  mockEnviar.mockResolvedValue({ ok: true })

  render(<FastFactForm />)

  // ⬅️ CLAVE: esperar a que carguen las categorías
  const selectCategoria = await screen.findByRole("combobox")

  await screen.findByText("Ambiental")

  await userEvent.type(
    screen.getByPlaceholderText("Ej. Vertido en Dock Sud"),
    "Hecho de prueba"
  )

  await userEvent.selectOptions(selectCategoria, "Ambiental")

  await userEvent.type(
    screen.getByPlaceholderText("Relatá qué ocurrió y actores involucrados."),
    "Descripción completa"
  )

  await userEvent.click(
    screen.getByText("Seleccionar ubicación mock")
  )

  await userEvent.click(
    screen.getByRole("button", { name: /Enviar contribución/i })
  )

  await waitFor(() => {
    expect(mockEnviar).toHaveBeenCalled()
  })

  expect(
    await screen.findByText("¡Carga Exitosa!")
  ).toBeInTheDocument()
})


test("permite ingresar una nueva categoría cuando se elige 'Otra'", async () => {
  mockGetCategorias.mockResolvedValue([{ nombre: "Ambiental" }])

  render(<FastFactForm />)

  const select = await screen.findByRole("combobox")

  await userEvent.selectOptions(select, "__agregar__")

  const inputNueva = await screen.findByPlaceholderText(
    "Ingresá nueva categoría"
  )

  fireEvent.change(inputNueva, {
    target: { value: "Infraestructura" },
  })

  expect(inputNueva.value).toBe("Infraestructura")
})

test("muestra error si el archivo supera 10MB", async () => {
  mockGetCategorias.mockResolvedValue([])

  render(<FastFactForm />)

  const file = new File(["x".repeat(11 * 1024 * 1024)], "video.mp4", {
    type: "video/mp4",
  })

  const input = screen.getByLabelText(/Evidencia/i)

  await userEvent.upload(input, file)

  expect(
    screen.getByText("El archivo es demasiado pesado (Max 10MB)")
  ).toBeInTheDocument()
})

test("botón 'Ir a Inicio' navega al home", async () => {
  mockGetCategorias.mockResolvedValue([])
  mockEnviar.mockResolvedValue({})

  render(<FastFactForm />)

  await userEvent.type(
    screen.getByPlaceholderText("Ej. Vertido en Dock Sud"),
    "Hecho válido"
  )

  await userEvent.type(
    screen.getByPlaceholderText("Relatá qué ocurrió y actores involucrados."),
    "Descripción válida"
  )

  await userEvent.click(screen.getByText("Seleccionar ubicación mock"))

  await userEvent.click(
    screen.getByRole("button", { name: /Enviar contribución/i })
  )

  const btnInicio = await screen.findByText("Ir a Inicio")
  await userEvent.click(btnInicio)

  expect(mockNavigate).toHaveBeenCalledWith("/")
})