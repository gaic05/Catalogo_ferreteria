import { PRODUCTOS } from "./productos.js";

export const CLAVE_CARRITO = "ferreteriaCarrito";
export const CLAVE_ULTIMO_PEDIDO = "ferreteriaUltimoPedido";
export const COSTO_DESPACHO = 4990; // Cambia este valor si el despacho cuesta otra cantidad

export function formatearPrecio(valor) {
  return "$" + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// El carrito se guarda en localStorage solo con { codigo, cantidad }.
// Precio y stock siempre se leen desde PRODUCTOS.
export function leerCarrito() {
  try {
    const datos = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO));
    if (!Array.isArray(datos)) return [];
    return datos.filter(
      (i) => i && typeof i.codigo === "string" && Number.isInteger(i.cantidad) && i.cantidad > 0
    );
  } catch (e) {
    return [];
  }
}

export function guardarCarrito(items) {
  try {
    window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  } catch (e) {
    console.error("No se pudo guardar el carrito en localStorage", e);
  }
}

// Une el carrito con los datos reales del producto (precio y stock actuales)
export function detalleCarrito(items) {
  const lineas = [];
  items.forEach((i) => {
    const p = PRODUCTOS.find((prod) => prod.codigo === i.codigo);
    if (!p || p.stock <= 0) return;
    const cantidad = Math.min(i.cantidad, p.stock);
    lineas.push({ producto: p, cantidad, subtotal: p.precioVenta * cantidad });
  });
  return lineas;
}

export function totalesCarrito(items, conDespacho) {
  const lineas = detalleCarrito(items);
  const unidades = lineas.reduce((t, l) => t + l.cantidad, 0);
  const subtotal = lineas.reduce((t, l) => t + l.subtotal, 0);
  const despacho = conDespacho && lineas.length > 0 ? COSTO_DESPACHO : 0;
  return { lineas, unidades, subtotal, despacho, total: subtotal + despacho };
}
