import { CLAVE_ULTIMO_PEDIDO } from "../datos/carrito.js";

export const METODOS = {
  tarjeta: "Tarjeta de crédito o débito",
  transferencia: "Transferencia bancaria",
  tienda: "Pago en tienda al retirar",
};

// Arma el pedido que se muestra en la confirmación y en el comprobante.
// Nunca incluye el número completo de la tarjeta ni el CVV.
export function crearPedido(totales, datos, entrega, metodo, ahora = new Date()) {
  const tarjeta = datos.tarjeta.replace(/\s/g, "");
  return {
    numero: "PED-" + ahora.getTime().toString(36).toUpperCase().slice(-6),
    fecha: ahora.toLocaleString("es-CL"),
    cliente: {
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim(),
      telefono: datos.telefono.trim(),
    },
    entrega:
      entrega === "despacho"
        ? "Despacho a domicilio: " + datos.direccion.trim() + ", " + datos.comuna.trim()
        : "Retiro en tienda",
    metodo,
    detallePago: metodo === "tarjeta" ? "Tarjeta terminada en " + tarjeta.slice(-4) : "",
    lineas: totales.lineas.map((l) => ({
      codigo: l.producto.codigo,
      nombre: l.producto.nombre,
      cantidad: l.cantidad,
      subtotal: l.subtotal,
    })),
    subtotal: totales.subtotal,
    despacho: totales.despacho,
    total: totales.total,
  };
}

export function guardarUltimoPedido(pedido) {
  try {
    window.localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(pedido));
    return true;
  } catch (e) {
    // Si no se puede guardar, el pedido igual se muestra en pantalla
    return false;
  }
}
