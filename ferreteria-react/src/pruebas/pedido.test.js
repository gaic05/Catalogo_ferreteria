import { describe, it, expect, beforeEach } from "vitest";
import { crearPedido, guardarUltimoPedido } from "../utilidades/pedido.js";
import { totalesCarrito, CLAVE_ULTIMO_PEDIDO } from "../datos/carrito.js";
import { generarComprobante, nombreArchivoComprobante } from "../utilidades/comprobante.js";

const AHORA = new Date("2026-10-22T12:00:00Z");

const datos = {
  nombre: " Juan Muñoz ",
  correo: "juan@correo.com",
  telefono: "912345678",
  direccion: "Av. Brasil 1234",
  comuna: "Valparaíso",
  tarjeta: "4111 1111 1111 1111",
  titular: "Juan Munoz",
  vence: "12/30",
  cvv: "737",
};

const items = [{ codigo: "FM-0001", cantidad: 2 }];

describe("crearPedido", () => {
  it("copia los totales y las líneas del carrito", () => {
    const t = totalesCarrito(items, false);
    const p = crearPedido(t, datos, "retiro", "tarjeta", AHORA);
    expect(p.total).toBe(11980);
    expect(p.lineas).toEqual([
      { codigo: "FM-0001", nombre: "Cemento Portland 25 kg", cantidad: 2, subtotal: 11980 },
    ]);
    expect(p.numero).toMatch(/^PED-[0-9A-Z]{6}$/);
    expect(p.cliente.nombre).toBe("Juan Muñoz"); // sin espacios sobrantes
  });

  it("nunca incluye el número completo de la tarjeta ni el CVV", () => {
    const p = crearPedido(totalesCarrito(items, false), datos, "retiro", "tarjeta", AHORA);
    const texto = JSON.stringify(p);
    expect(p.detallePago).toBe("Tarjeta terminada en 1111");
    expect(texto).not.toContain("4111");
    expect(texto).not.toContain("737");
    expect(texto).not.toContain("cvv");
  });

  it("describe la entrega según la opción elegida", () => {
    const retiro = crearPedido(totalesCarrito(items, false), datos, "retiro", "tienda", AHORA);
    const despacho = crearPedido(totalesCarrito(items, true), datos, "despacho", "transferencia", AHORA);
    expect(retiro.entrega).toBe("Retiro en tienda");
    expect(retiro.detallePago).toBe("");
    expect(despacho.entrega).toBe("Despacho a domicilio: Av. Brasil 1234, Valparaíso");
    expect(despacho.despacho).toBe(4990);
  });
});

describe("guardarUltimoPedido", () => {
  beforeEach(() => window.localStorage.clear());

  it("guarda el pedido en localStorage", () => {
    const p = crearPedido(totalesCarrito(items, false), datos, "retiro", "tarjeta", AHORA);
    expect(guardarUltimoPedido(p)).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(CLAVE_ULTIMO_PEDIDO)).numero).toBe(p.numero);
  });
});

describe("generarComprobante", () => {
  const pedido = crearPedido(totalesCarrito(items, true), datos, "despacho", "tarjeta", AHORA);
  const texto = generarComprobante(pedido);

  it("incluye número de pedido, cliente, productos y total", () => {
    expect(texto).toContain(`Pedido N°: ${pedido.numero}`);
    expect(texto).toContain("Cliente: Juan Muñoz");
    expect(texto).toContain("2 x Cemento Portland 25 kg: $11.980");
    expect(texto).toContain("Despacho: $4.990");
    expect(texto).toContain("TOTAL (IVA incluido): $16.970");
  });

  it("indica el estado según el método de pago", () => {
    expect(texto).toContain("Estado: Pagado");
    const transferencia = crearPedido(totalesCarrito(items, false), datos, "retiro", "transferencia", AHORA);
    expect(generarComprobante(transferencia)).toContain("Pendiente de confirmar la transferencia");
  });

  it("no expone datos sensibles de la tarjeta", () => {
    expect(texto).toContain("terminada en 1111");
    expect(texto).not.toContain("4111");
  });

  it("nombra el archivo con el número de pedido", () => {
    expect(nombreArchivoComprobante(pedido)).toBe(`comprobante-${pedido.numero}.txt`);
  });
});
