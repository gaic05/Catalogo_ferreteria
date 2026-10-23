import { describe, it, expect, vi, afterEach } from "vitest";
import { descargarComprobante } from "../utilidades/comprobante.js";

const pedido = {
  numero: "PED-ABC123",
  fecha: "22-10-2026, 12:00:00",
  cliente: { nombre: "Juan Muñoz", correo: "juan@correo.com", telefono: "912345678" },
  entrega: "Retiro en tienda",
  metodo: "tarjeta",
  detallePago: "Tarjeta terminada en 1111",
  lineas: [{ codigo: "FM-0001", nombre: "Cemento Portland 25 kg", cantidad: 1, subtotal: 5990 }],
  subtotal: 5990,
  despacho: 0,
  total: 5990,
};

describe("descargarComprobante (manipulación del DOM)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("crea un enlace de descarga con el nombre correcto, lo clickea y lo elimina", () => {
    let enlaceClickeado = null;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
      enlaceClickeado = this;
      // Mientras se hace click, el enlace debe estar dentro del documento
      expect(document.body.contains(this)).toBe(true);
    });
    URL.createObjectURL = vi.fn(() => "blob:comprobante");
    URL.revokeObjectURL = vi.fn();

    descargarComprobante(pedido);

    expect(enlaceClickeado.download).toBe("comprobante-PED-ABC123.txt");
    expect(enlaceClickeado.getAttribute("href")).toBe("blob:comprobante");
    expect(document.body.contains(enlaceClickeado)).toBe(false); // se limpia después
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL.mock.calls[0][0].type).toContain("text/plain");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:comprobante");
  });
});
