import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Pago from "../componentes/Pago.jsx";
import { CLAVE_ULTIMO_PEDIDO } from "../datos/carrito.js";

const ITEMS = [{ codigo: "FM-0001", cantidad: 2 }]; // $11.980

function renderizar(items = ITEMS) {
  const acciones = { vaciarCarrito: vi.fn(), setSeccion: vi.fn() };
  const { unmount } = render(<Pago itemsCarrito={items} {...acciones} />);
  return { ...acciones, unmount };
}

const escribir = (etiqueta, valor) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

const botonPagar = () => screen.getByRole("button", { name: /^Pagar/ });

function llenarContacto() {
  escribir("Nombre completo", "Juan Muñoz");
  escribir("Correo electrónico", "juan@correo.com");
  escribir("Teléfono (9 dígitos)", "912345678");
}

function llenarTarjeta() {
  escribir("Número de tarjeta", "4111111111111111");
  escribir("Nombre del titular", "Juan Munoz");
  escribir("Vencimiento (MM/AA)", "1299");
  escribir("CVV", "737");
}

describe("Pago", () => {
  it("avisa cuando no hay productos para pagar", () => {
    const { setSeccion } = renderizar([]);
    expect(screen.getByText("No hay productos para pagar")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver catálogo" }));
    expect(setSeccion).toHaveBeenCalledWith("catalogo");
  });

  it("muestra el resumen del pedido y el total en el botón de pago", () => {
    renderizar();
    const resumen = screen.getByRole("complementary", { name: "Resumen del pedido" });
    expect(resumen).toHaveTextContent("2 × Cemento Portland 25 kg");
    expect(botonPagar()).toHaveTextContent("Pagar $11.980");
  });

  it("al enviar el formulario vacío muestra errores y enfoca el primer campo inválido", () => {
    renderizar();
    fireEvent.click(botonPagar());

    expect(screen.getByText("Ingresa tu nombre completo.")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un correo válido.")).toBeInTheDocument();
    expect(screen.getByText("El número de tarjeta no es válido.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre completo")).toHaveClass("error");
    expect(screen.getByLabelText("Nombre completo")).toHaveFocus();
  });

  it("da formato a la tarjeta y al vencimiento mientras se escribe", () => {
    renderizar();
    escribir("Número de tarjeta", "4111111111111111");
    escribir("Vencimiento (MM/AA)", "1230");
    expect(screen.getByLabelText("Número de tarjeta")).toHaveValue("4111 1111 1111 1111");
    expect(screen.getByLabelText("Vencimiento (MM/AA)")).toHaveValue("12/30");
  });

  it("rechaza una tarjeta vencida", () => {
    renderizar();
    escribir("Vencimiento (MM/AA)", "0120");
    fireEvent.blur(screen.getByLabelText("Vencimiento (MM/AA)"));
    expect(screen.getByText("La tarjeta está vencida.")).toBeInTheDocument();
  });

  it("el despacho pide dirección, suma el costo y deshabilita el pago en tienda", () => {
    renderizar();
    expect(screen.queryByLabelText("Dirección")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Despacho a domicilio/));

    expect(screen.getByLabelText("Dirección")).toBeInTheDocument();
    expect(screen.getByLabelText("Comuna")).toBeInTheDocument();
    expect(screen.getByLabelText("Pagar en tienda al retirar")).toBeDisabled();
    expect(botonPagar()).toHaveTextContent("Pagar $16.970"); // 11.980 + 4.990
  });

  it("al cambiar a despacho, un pago en tienda ya elegido pasa a tarjeta", () => {
    renderizar();
    fireEvent.click(screen.getByLabelText("Pagar en tienda al retirar"));
    expect(screen.queryByLabelText("Número de tarjeta")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Despacho a domicilio/));
    expect(screen.getByLabelText("Tarjeta de crédito o débito")).toBeChecked();
    expect(screen.getByLabelText("Número de tarjeta")).toBeInTheDocument();
  });

  it("flujo completo: paga con tarjeta, muestra el comprobante y vacía el carrito", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T12:00:00Z"));
    const { vaciarCarrito } = renderizar();

    llenarContacto();
    llenarTarjeta();
    fireEvent.click(botonPagar());

    // Mientras "procesa" el botón queda bloqueado
    expect(screen.getByRole("button", { name: "Procesando…" })).toBeDisabled();
    expect(vaciarCarrito).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("¡Pago realizado con éxito!")).toBeInTheDocument();
    expect(screen.getByText(/Pedido N° PED-/)).toBeInTheDocument();
    expect(screen.getByText(/Tarjeta terminada en 1111/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar comprobante" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Imprimir comprobante" })).toBeInTheDocument();
    expect(vaciarCarrito).toHaveBeenCalledTimes(1);

    // Se guarda el pedido, pero nunca el número completo de la tarjeta ni el CVV
    const guardado = window.localStorage.getItem(CLAVE_ULTIMO_PEDIDO);
    expect(JSON.parse(guardado).total).toBe(11980);
    expect(guardado).not.toContain("4111");
    expect(guardado).not.toContain("737");
  });

  it("transferencia: confirma el pedido como pendiente de pago", () => {
    vi.useFakeTimers();
    renderizar();
    fireEvent.click(screen.getByLabelText("Transferencia bancaria"));
    llenarContacto();
    fireEvent.click(screen.getByRole("button", { name: /^Confirmar pedido/ }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText("¡Pedido recibido!")).toBeInTheDocument();
    expect(screen.getByText(/Transfiere \$11\.980/)).toBeInTheDocument();
  });

  it("'Imprimir comprobante' abre el diálogo de impresión", () => {
    vi.useFakeTimers();
    renderizar();
    fireEvent.click(screen.getByLabelText("Pagar en tienda al retirar"));
    llenarContacto();
    fireEvent.click(screen.getByRole("button", { name: /^Confirmar pedido/ }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    fireEvent.click(screen.getByRole("button", { name: "Imprimir comprobante" }));
    expect(window.print).toHaveBeenCalled();
  });

  it("si el usuario sale mientras se procesa, el pago simulado se cancela", () => {
    vi.useFakeTimers();
    const { vaciarCarrito, unmount } = renderizar();
    llenarContacto();
    llenarTarjeta();
    fireEvent.click(botonPagar());
    expect(screen.getByRole("button", { name: "Procesando…" })).toBeDisabled();

    unmount(); // el usuario navegó a otra vista
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(vaciarCarrito).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(CLAVE_ULTIMO_PEDIDO)).toBeNull();
  });
});
