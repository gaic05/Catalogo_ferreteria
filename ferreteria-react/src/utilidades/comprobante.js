import { formatearPrecio } from "../datos/carrito.js";
import { METODOS } from "./pedido.js";

const ESTADOS = {
  tarjeta: "Pagado (pago aprobado)",
  transferencia: "Pendiente de confirmar la transferencia",
  tienda: "Por pagar en tienda al retirar",
};

// Devuelve el texto del comprobante de un pedido
export function generarComprobante(p) {
  const separador = "=".repeat(46);
  const guiones = "-".repeat(46);
  const filas = [
    "FERRETERÍA LOS MAESTROS",
    p.metodo === "tarjeta" ? "COMPROBANTE DE PAGO" : "COMPROBANTE DE PEDIDO",
    separador,
    `Pedido N°: ${p.numero}`,
    `Fecha: ${p.fecha}`,
    "",
    `Cliente: ${p.cliente.nombre}`,
    `Correo: ${p.cliente.correo}`,
    `Teléfono: ${p.cliente.telefono}`,
    `Entrega: ${p.entrega}`,
    `Método de pago: ${METODOS[p.metodo]}${p.detallePago ? ` (${p.detallePago})` : ""}`,
    "",
    "DETALLE",
    guiones,
    ...p.lineas.map((l) => `${l.cantidad} x ${l.nombre}: ${formatearPrecio(l.subtotal)}`),
    guiones,
    `Subtotal: ${formatearPrecio(p.subtotal)}`,
    `Despacho: ${p.despacho > 0 ? formatearPrecio(p.despacho) : "Gratis"}`,
    `TOTAL (IVA incluido): ${formatearPrecio(p.total)}`,
    "",
    `Estado: ${ESTADOS[p.metodo]}`,
    separador,
    "Documento generado en modo demostración, sin valor tributario.",
  ];
  return filas.join("\n");
}

export function nombreArchivoComprobante(p) {
  return `comprobante-${p.numero}.txt`;
}

// Descarga el comprobante como archivo de texto
export function descargarComprobante(p) {
  const blob = new Blob(["\uFEFF", generarComprobante(p)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivoComprobante(p);
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
