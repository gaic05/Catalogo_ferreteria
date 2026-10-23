import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../componentes/Header.jsx";

describe("Header", () => {
  it("oculta el contador cuando el carrito está vacío", () => {
    render(<Header currentSection="inicio" setSection={vi.fn()} cantidadCarrito={0} />);
    expect(screen.getByLabelText("productos en el carrito")).toHaveAttribute("hidden");
  });

  it("muestra la cantidad de productos del carrito", () => {
    render(<Header currentSection="inicio" setSection={vi.fn()} cantidadCarrito={4} />);
    const contador = screen.getByLabelText("productos en el carrito");
    expect(contador).not.toHaveAttribute("hidden");
    expect(contador).toHaveTextContent("4");
  });

  it("navega entre vistas al hacer click en el menú", () => {
    const setSection = vi.fn();
    render(<Header currentSection="inicio" setSection={setSection} cantidadCarrito={0} />);

    fireEvent.click(screen.getByText("Catalogo"));
    fireEvent.click(screen.getByText("Contacto"));
    fireEvent.click(screen.getByText("Carrito"));

    expect(setSection).toHaveBeenNthCalledWith(1, "catalogo");
    expect(setSection).toHaveBeenNthCalledWith(2, "contacto");
    expect(setSection).toHaveBeenNthCalledWith(3, "carrito");
  });
});
