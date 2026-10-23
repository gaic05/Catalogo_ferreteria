import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Carrito from "../componentes/Carrito.jsx";

function renderizar(items = [], props = {}) {
  const acciones = { actualizarCarrito: vi.fn(), setSeccion: vi.fn() };
  render(<Carrito itemsCarrito={items} {...acciones} {...props} />);
  return acciones;
}

describe("Carrito", () => {
  it("muestra el estado vacío y permite volver al catálogo", () => {
    const { setSeccion } = renderizar([]);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Ver catálogo"));
    expect(setSeccion).toHaveBeenCalledWith("catalogo");
  });

  it("lista los productos y calcula el resumen", () => {
    renderizar([{ codigo: "FM-0001", cantidad: 2 }]);
    expect(screen.getByText("Cemento Portland 25 kg")).toBeInTheDocument();
    const resumen = screen.getByRole("complementary", { name: "Resumen del pedido" });
    expect(within(resumen).getByText("2 productos")).toBeInTheDocument();
    expect(within(resumen).getAllByText("$11.980")).toHaveLength(2); // subtotal y total
  });

  it("el botón + aumenta la cantidad en 1", () => {
    const { actualizarCarrito } = renderizar([{ codigo: "FM-0001", cantidad: 2 }]);
    fireEvent.click(screen.getByRole("button", { name: "Aumentar cantidad de Cemento Portland 25 kg" }));
    expect(actualizarCarrito).toHaveBeenCalledWith([{ codigo: "FM-0001", cantidad: 3 }]);
  });

  it("no deja superar el stock disponible", () => {
    // FM-0301 (Taladro) tiene stock 12: aunque el carrito diga 50, se limita a 12
    renderizar([{ codigo: "FM-0301", cantidad: 50 }]);
    expect(screen.getByLabelText("Cantidad de Taladro percutor 650 W 13 mm")).toHaveValue("12");
    expect(screen.getByRole("button", { name: "Aumentar cantidad de Taladro percutor 650 W 13 mm" })).toBeDisabled();
  });

  it("no deja bajar de 1 unidad", () => {
    renderizar([{ codigo: "FM-0001", cantidad: 1 }]);
    expect(screen.getByRole("button", { name: "Disminuir cantidad de Cemento Portland 25 kg" })).toBeDisabled();
  });

  it("'Quitar del carrito' elimina el producto", () => {
    const { actualizarCarrito } = renderizar([
      { codigo: "FM-0001", cantidad: 1 },
      { codigo: "FM-0201", cantidad: 1 },
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Quitar Cemento Portland 25 kg del carrito" }));
    expect(actualizarCarrito).toHaveBeenCalledWith([{ codigo: "FM-0201", cantidad: 1 }]);
  });

  it("'Vaciar carrito' pide confirmación antes de vaciar", () => {
    const { actualizarCarrito } = renderizar([{ codigo: "FM-0001", cantidad: 1 }]);
    const confirmar = vi.spyOn(window, "confirm");

    confirmar.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));
    expect(actualizarCarrito).not.toHaveBeenCalled();

    confirmar.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));
    expect(actualizarCarrito).toHaveBeenCalledWith([]);
    confirmar.mockRestore();
  });

  it("'Ir a pagar' navega a la vista de pago", () => {
    const { setSeccion } = renderizar([{ codigo: "FM-0001", cantidad: 1 }]);
    fireEvent.click(screen.getByRole("button", { name: "Ir a pagar" }));
    expect(setSeccion).toHaveBeenCalledWith("pago");
  });
});
