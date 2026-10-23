import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "../App.jsx";

const contador = () => screen.getByLabelText("productos en el carrito");

function agregarPrimerProducto() {
  fireEvent.click(screen.getByText("Catalogo"));
  fireEvent.click(screen.getAllByRole("button", { name: "Agregar al carrito" })[0]);
}

describe("App (integración de vistas)", () => {
  it("navega entre las vistas del menú", () => {
    render(<App />);
    expect(screen.getByText("Todo para tu obra y tu hogar")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Catalogo"));
    expect(screen.getByRole("heading", { name: "Catálogo de productos" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Carrito"));
    expect(screen.getByRole("heading", { name: "Tu carrito" })).toBeInTheDocument();
  });

  it("agregar desde el catálogo actualiza el contador del header y muestra el aviso", () => {
    render(<App />);
    expect(contador()).toHaveAttribute("hidden");

    agregarPrimerProducto();

    expect(contador()).toHaveTextContent("1");
    expect(screen.getByRole("status")).toHaveTextContent(/Agregado al carrito/);
  });

  it("el carrito se conserva en localStorage al volver a abrir la app", () => {
    const { unmount } = render(<App />);
    agregarPrimerProducto();
    unmount();

    render(<App />);
    expect(contador()).toHaveTextContent("1");
  });

  it("flujo completo: catálogo → carrito → pago → comprobante", () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    render(<App />);

    agregarPrimerProducto();
    fireEvent.click(screen.getByText("Carrito"));
    fireEvent.click(screen.getByRole("button", { name: "Ir a pagar" }));
    expect(screen.getByRole("heading", { name: "Finalizar compra" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Pagar en tienda al retirar"));
    fireEvent.change(screen.getByLabelText("Nombre completo"), { target: { value: "Juan Muñoz" } });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "juan@correo.com" } });
    fireEvent.change(screen.getByLabelText("Teléfono (9 dígitos)"), { target: { value: "912345678" } });
    fireEvent.click(screen.getByRole("button", { name: /^Confirmar pedido/ }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("¡Pedido recibido!")).toBeInTheDocument();
    expect(contador()).toHaveAttribute("hidden"); // el carrito quedó vacío

    fireEvent.click(screen.getByRole("button", { name: "Descargar comprobante" }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Volver al catálogo" }));
    expect(screen.getByRole("heading", { name: "Catálogo de productos" })).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
