import { useMemo } from "react";
import { PRODUCTOS } from "../datos/productos.js";
import { formatearPrecio, detalleCarrito } from "../datos/carrito.js";

// --- Componente Principal ---

export default function Carrito({ itemsCarrito, actualizarCarrito, setSeccion }) {
  // Fusionar items del carrito con la base de datos de PRODUCTOS (saneamiento reactivo)
  const lineasCarrito = useMemo(() => detalleCarrito(itemsCarrito), [itemsCarrito]);

  // Totales calculados dinámicamente
  const totales = useMemo(() => {
    const unidades = lineasCarrito.reduce((t, l) => t + l.cantidad, 0);
    const subtotal = lineasCarrito.reduce((t, l) => t + l.subtotal, 0);
    return { unidades, subtotal, total: subtotal };
  }, [lineasCarrito]);

  // --- Manejadores de eventos ---

  const handleCambiarCantidad = (codigo, nuevaCantidad) => {
    const producto = PRODUCTOS.find((p) => p.codigo === codigo);
    if (!producto) return;

    const maximo = producto.stock;
    const cantidadFinal = Math.max(1, Math.min(nuevaCantidad, maximo));

    const nuevosItems = itemsCarrito.map((item) =>
      item.codigo === codigo ? { ...item, cantidad: cantidadFinal } : item
    );
    actualizarCarrito(nuevosItems);
  };

  const handleQuitarDelCarrito = (codigo) => {
    const nuevosItems = itemsCarrito.filter((i) => i.codigo !== codigo);
    actualizarCarrito(nuevosItems);
  };

  const handleVaciarCarrito = () => {
    if (window.confirm("¿Quieres quitar todos los productos del carrito?")) {
      actualizarCarrito([]);
    }
  };

  const handleNavegarACatalogo = (e) => {
    if (setSeccion) {
      e.preventDefault();
      setSeccion("catalogo");
    }
  };

  const handleIrAPagar = () => {
    if (setSeccion) setSeccion("pago");
  };

  return (
    <main className="carrito-pagina">
      <h1>Tu carrito</h1>

      <div id="contenidoCarrito">
        {lineasCarrito.length === 0 ? (
          /* Estado Carrito Vacío */
          <div className="carrito-vacio">
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos desde el catálogo para armar tu pedido.</p>
            <a
              href="#"
              className="boton-principal"
              onClick={handleNavegarACatalogo}
            >
              Ver catálogo
            </a>
          </div>
        ) : (
          /* Layout Carrito con Productos */
          <div className="carrito-layout">
            <section className="carrito-lista" aria-label="Productos en el carrito">
              {lineasCarrito.map((linea) => {
                const p = linea.producto;
                return (
                  <article key={p.codigo} className="carrito-item">
                    <div className="carrito-item-info">
                      <span className="producto-codigo">Cód. {p.codigo}</span>
                      <h3 className="carrito-item-nombre">{p.nombre}</h3>
                      <p className="producto-detalle">
                        {p.subcategoria} · Marca: {p.marca}
                      </p>
                      <p className="producto-detalle">
                        {formatearPrecio(p.precioVenta)} / {p.unidad}
                      </p>
                      <button
                        type="button"
                        className="boton-texto"
                        aria-label={`Quitar ${p.nombre} del carrito`}
                        onClick={() => handleQuitarDelCarrito(p.codigo)}
                      >
                        Quitar del carrito
                      </button>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="carrito-item-cantidad">
                      <div className="cantidad-control">
                        <button
                          type="button"
                          className="boton-cantidad"
                          aria-label={`Disminuir cantidad de ${p.nombre}`}
                          disabled={linea.cantidad <= 1}
                          onClick={() => handleCambiarCantidad(p.codigo, linea.cantidad - 1)}
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={linea.cantidad}
                          aria-label={`Cantidad de ${p.nombre}`}
                          onChange={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) val = 1;
                            handleCambiarCantidad(p.codigo, val);
                          }}
                        />
                        <button
                          type="button"
                          className="boton-cantidad"
                          aria-label={`Aumentar cantidad de ${p.nombre}`}
                          disabled={linea.cantidad >= p.stock}
                          onClick={() => handleCambiarCantidad(p.codigo, linea.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                      <small className="stock-nota">Disponibles: {p.stock}</small>
                    </div>

                    {/* Subtotal */}
                    <div className="carrito-item-subtotal">
                      {formatearPrecio(linea.subtotal)}
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Resumen del pedido */}
            <aside className="carrito-resumen" aria-label="Resumen del pedido">
              <h2>Resumen del pedido</h2>
              <div className="resumen-fila">
                <span>
                  {totales.unidades === 1
                    ? "1 producto"
                    : `${totales.unidades} productos`}
                </span>
                <span>{formatearPrecio(totales.subtotal)}</span>
              </div>
              <p className="nota-resumen">
                El costo de despacho se calcula en el siguiente paso.
              </p>
              <div className="resumen-fila total">
                <span>Total (IVA incluido)</span>
                <span>{formatearPrecio(totales.total)}</span>
              </div>

              <button
                type="button"
                className="boton-principal"
                onClick={handleIrAPagar}
              >
                Ir a pagar
              </button>
              <a
                href="#"
                className="boton-secundario"
                onClick={handleNavegarACatalogo}
              >
                Seguir comprando
              </a>

              <button
                type="button"
                className="boton-texto"
                onClick={handleVaciarCarrito}
              >
                Vaciar carrito
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
