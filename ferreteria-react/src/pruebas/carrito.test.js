import { describe, it, expect, beforeEach } from "vitest";
import {
  CLAVE_CARRITO,
  COSTO_DESPACHO,
  formatearPrecio,
  leerCarrito,
  guardarCarrito,
  detalleCarrito,
  totalesCarrito,
} from "../datos/carrito.js";
import { PRODUCTOS } from "../datos/productos.js";

// Productos reales usados en las pruebas:
// FM-0001 Cemento $5.990 (stock 240) | FM-0301 Taladro $59.990 (stock 12) | FM-0303 Sierra (stock 0)

describe("formatearPrecio", () => {
  it("separa los miles con punto y antepone $", () => {
    expect(formatearPrecio(5990)).toBe("$5.990");
    expect(formatearPrecio(1234567)).toBe("$1.234.567");
  });

  it("redondea los decimales", () => {
    expect(formatearPrecio(1999.6)).toBe("$2.000");
  });
});

describe("leerCarrito / guardarCarrito (localStorage)", () => {
  beforeEach(() => window.localStorage.clear());

  it("devuelve un arreglo vacío si no hay nada guardado", () => {
    expect(leerCarrito()).toEqual([]);
  });

  it("devuelve un arreglo vacío si el JSON está dañado", () => {
    window.localStorage.setItem(CLAVE_CARRITO, "{esto no es json");
    expect(leerCarrito()).toEqual([]);
  });

  it("descarta items inválidos (sin código o con cantidad no entera o menor a 1)", () => {
    window.localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify([
        { codigo: "FM-0001", cantidad: 2 },
        { codigo: 5, cantidad: 1 },
        { codigo: "FM-0002", cantidad: 0 },
        { codigo: "FM-0003", cantidad: 1.5 },
        null,
      ])
    );
    expect(leerCarrito()).toEqual([{ codigo: "FM-0001", cantidad: 2 }]);
  });

  it("guarda y vuelve a leer el mismo carrito", () => {
    const items = [{ codigo: "FM-0001", cantidad: 3 }];
    guardarCarrito(items);
    expect(leerCarrito()).toEqual(items);
  });
});

describe("detalleCarrito", () => {
  it("une cada item con los datos reales del producto y calcula el subtotal", () => {
    const [linea] = detalleCarrito([{ codigo: "FM-0001", cantidad: 2 }]);
    expect(linea.producto.nombre).toBe("Cemento Portland 25 kg");
    expect(linea.cantidad).toBe(2);
    expect(linea.subtotal).toBe(5990 * 2);
  });

  it("omite productos inexistentes o sin stock", () => {
    const lineas = detalleCarrito([
      { codigo: "NO-EXISTE", cantidad: 1 },
      { codigo: "FM-0303", cantidad: 1 },
      { codigo: "FM-0001", cantidad: 1 },
    ]);
    expect(lineas).toHaveLength(1);
    expect(lineas[0].producto.codigo).toBe("FM-0001");
  });

  it("limita la cantidad al stock disponible", () => {
    const stock = PRODUCTOS.find((p) => p.codigo === "FM-0301").stock;
    const [linea] = detalleCarrito([{ codigo: "FM-0301", cantidad: 999 }]);
    expect(linea.cantidad).toBe(stock);
  });
});

describe("totalesCarrito", () => {
  const items = [
    { codigo: "FM-0001", cantidad: 2 }, // 11.980
    { codigo: "FM-0301", cantidad: 1 }, // 59.990
  ];

  it("suma unidades y subtotal; retiro en tienda no cobra despacho", () => {
    const t = totalesCarrito(items, false);
    expect(t.unidades).toBe(3);
    expect(t.subtotal).toBe(71970);
    expect(t.despacho).toBe(0);
    expect(t.total).toBe(71970);
  });

  it("agrega el costo de despacho cuando corresponde", () => {
    const t = totalesCarrito(items, true);
    expect(t.despacho).toBe(COSTO_DESPACHO);
    expect(t.total).toBe(71970 + COSTO_DESPACHO);
  });

  it("no cobra despacho si el carrito está vacío", () => {
    const t = totalesCarrito([], true);
    expect(t.lineas).toHaveLength(0);
    expect(t.total).toBe(0);
  });
});
