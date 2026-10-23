import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Catalogo from "../componentes/Catalogo.jsx";

const productos = [
  { codigo: "T-1", categoria: "Herramientas", subcategoria: "Martillos", nombre: "Martillo", marca: "Stanley", unidad: "un", precioVenta: 9990, stock: 10, stockMinimo: 3, imagen: "" },
  { codigo: "T-2", categoria: "Herramientas", subcategoria: "Sierras", nombre: "Sierra", marca: "DeWalt", unidad: "un", precioVenta: 119990, stock: 0, stockMinimo: 2, imagen: "" },
  { codigo: "P-1", categoria: "Pinturas", subcategoria: "Látex", nombre: "Látex blanco", marca: "Ceresita", unidad: "galón", precioVenta: 17990, stock: 5, stockMinimo: 2, imagen: "" },
];

const formatearPrecio = (p) => `$${p}`;

function renderizar(props = {}) {
  return render(
    <Catalogo
      productos={productos}
      formatearPrecio={formatearPrecio}
      agregarAlCarrito={vi.fn(() => ({ ok: true, mensaje: "Agregado" }))}
      mostrarAviso={vi.fn()}
      {...props}
    />
  );
}

const nombresVisibles = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("Catalogo", () => {
  it("muestra todos los productos y el contador de resultados", () => {
    renderizar();
    expect(screen.getByText("Mostrando 3 productos")).toBeInTheDocument();
    expect(nombresVisibles()).toEqual(["Látex blanco", "Martillo", "Sierra"]); // orden A-Z
  });

  it("filtra por texto de búsqueda (nombre, marca o código)", () => {
    renderizar();
    fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "dewalt" } });
    expect(screen.getByText("Mostrando 1 producto")).toBeInTheDocument();
    expect(nombresVisibles()).toEqual(["Sierra"]);
  });

  it("filtra por categoría al hacer click en un chip", () => {
    renderizar();
    const chip = screen.getByRole("button", { name: /^Pinturas/ });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Mostrando 1 producto")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Látex blanco" })).toBeInTheDocument();
  });

  it("'Solo con stock' oculta los productos agotados", () => {
    renderizar();
    fireEvent.click(screen.getByLabelText("Solo con stock"));
    expect(screen.queryByRole("heading", { name: "Sierra" })).not.toBeInTheDocument();
    expect(screen.getByText("Mostrando 2 productos")).toBeInTheDocument();
  });

  it("ordena por precio de mayor a menor", () => {
    renderizar();
    fireEvent.change(screen.getByLabelText("Ordenar por"), { target: { value: "precio-desc" } });
    expect(nombresVisibles()).toEqual(["Sierra", "Látex blanco", "Martillo"]);
  });

  it("deshabilita el botón de un producto agotado", () => {
    renderizar();
    expect(screen.getByRole("button", { name: "Sin stock" })).toBeDisabled();
  });

  it("'Agregar al carrito' llama a agregarAlCarrito y muestra el aviso", () => {
    const agregarAlCarrito = vi.fn(() => ({ ok: true, mensaje: "Agregado al carrito: Martillo" }));
    const mostrarAviso = vi.fn();
    renderizar({ agregarAlCarrito, mostrarAviso });

    const tarjeta = screen.getByRole("heading", { name: "Martillo" }).closest("article");
    fireEvent.click(within(tarjeta).getByRole("button", { name: "Agregar al carrito" }));

    expect(agregarAlCarrito).toHaveBeenCalledWith("T-1", 1);
    expect(mostrarAviso).toHaveBeenCalledWith("Agregado al carrito: Martillo", true);
  });

  it("muestra un mensaje cuando no hay resultados", () => {
    renderizar();
    fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: "zzzz" } });
    expect(screen.getByText(/No se encontraron productos/)).toBeInTheDocument();
  });
});
