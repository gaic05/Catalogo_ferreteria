import { useMemo, useRef, useState } from "react";
import { COSTO_DESPACHO } from "../datos/carrito.js";

const PRECIOS_ANTERIORES = {
  "FM-0301": 74990, // Taladro percutor
  "FM-0101": 21990, // Látex interior
  "FM-0201": 12990, // Martillo de uña
  "FM-0901": 19990, // Manguera de riego
  "FM-0702": 46990, // Terciado estructural
  "FM-0501": 44990, // Cable eléctrico
  "FM-0001": 6990, // Cemento Portland
  "FM-0503": 2490, // Ampolleta LED
};


function estadoStock(producto) {
  if (producto.stock <= 0) {
    return { clase: "agotado", texto: "Agotado" };
  }
  if (producto.stock <= producto.stockMinimo) {
    return { clase: "bajo", texto: "Stock bajo" };
  }
  return { clase: "disponible", texto: "Disponible" };
}

function calcularOfertas(productos) {
  return productos
    .filter((p) => PRECIOS_ANTERIORES[p.codigo] > p.precioVenta)
    .map((p) => {
      const anterior = PRECIOS_ANTERIORES[p.codigo];
      return {
        producto: p,
        precioAnterior: anterior,
        ahorro: anterior - p.precioVenta,
        porcentaje: Math.round((1 - p.precioVenta / anterior) * 100),
      };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);
}

function ImagenOferta({ producto }) {
  const [error, setError] = useState(false);

  if (producto.imagen && !error) {
    return (
      <div className="producto-imagen">
        <img src={producto.imagen} alt={producto.nombre} loading="lazy" onError={() => setError(true)} />
      </div>
    );
  }

  return (
    <div className="producto-imagen sin-imagen">
      <span>Imagen referencial</span>
    </div>
  );
}

function TarjetaOferta({ oferta, formatearPrecio, agregarAlCarrito, mostrarAviso }) {
  const { producto, precioAnterior, ahorro, porcentaje } = oferta;
  const estado = estadoStock(producto);
  const agotado = estado.clase === "agotado";

  const handleAgregar = () => {
    if (typeof agregarAlCarrito === "function") {
      const resultado = agregarAlCarrito(producto.codigo, 1);
      if (typeof mostrarAviso === "function" && resultado) {
        mostrarAviso(resultado.mensaje, resultado.ok);
      }
    }
  };

  return (
    <article className={`producto producto-oferta ${agotado ? "agotado" : ""}`} data-codigo={producto.codigo}>
      <span className="etiqueta-oferta">-{porcentaje}%</span>
      <ImagenOferta producto={producto} />

      <div className="producto-info">
        <span className="producto-categoria">{producto.categoria}</span>
        <h3 className="producto-nombre">{producto.nombre}</h3>
        <p className="producto-detalle">
          {producto.subcategoria} · Marca: {producto.marca}
        </p>

        <div className="oferta-precios">
          <span className="precio-anterior">{formatearPrecio(precioAnterior)}</span>
          <span className="producto-precio">
            {formatearPrecio(producto.precioVenta)}
            <small> / {producto.unidad}</small>
          </span>
          <span className="oferta-ahorro">Ahorras {formatearPrecio(ahorro)}</span>
        </div>

        <div className="producto-pie">
          <span className={`estado-stock ${estado.clase}`}>{estado.texto}</span>
        </div>

        <button type="button" className="boton-agregar" disabled={agotado} onClick={handleAgregar}>
          {agotado ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}

export default function Inicio({ productos, formatearPrecio, agregarAlCarrito, mostrarAviso, setSeccion }) {
  const refOfertas = useRef(null);

  const ofertas = useMemo(() => calcularOfertas(productos), [productos]);
  const destacada = ofertas[0];

  const categorias = useMemo(() => {
    const conteo = {};
    productos.forEach((p) => {
      conteo[p.categoria] = (conteo[p.categoria] || 0) + 1;
    });
    return Object.entries(conteo).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  }, [productos]);

  const irAlCatalogo = (e) => {
    e.preventDefault();
    setSeccion("catalogo");
  };

  const irAOfertas = (e) => {
    e.preventDefault();
    refOfertas.current?.scrollIntoView({ behavior: "smooth" });
  };

  const irACategoria = (categoria) => {
    window.history.replaceState(null, "", window.location.pathname + "?categoria=" + encodeURIComponent(categoria));
    setSeccion("catalogo");
  };

  const propsTarjeta = { formatearPrecio, agregarAlCarrito, mostrarAviso };

  return (
    <div className="inicio">
      {/* Portada */}
      <section className="hero">
        <div className="hero-texto">
          <span className="hero-etiqueta">Ferretería Los Maestros</span>
          <h1>Todo para tu obra y tu hogar</h1>
          <p>
            Materiales, herramientas, electricidad, gasfitería y más. Retira gratis en tienda o recibe tu pedido en
            casa.
          </p>
          <div className="hero-botones">
            {ofertas.length > 0 && (
              <a href="#ofertas" className="boton-principal" onClick={irAOfertas}>
                Ver ofertas
              </a>
            )}
            <a href="#" className="boton-secundario" onClick={irAlCatalogo}>
              Ver catálogo completo
            </a>
          </div>
        </div>

        {destacada && (
          <div className="hero-tarjeta">
            <TarjetaOferta oferta={destacada} {...propsTarjeta} />
          </div>
        )}
      </section>

      {/* Beneficios */}
      <section className="beneficios" aria-label="Beneficios de comprar con nosotros">
        <div className="beneficio">
          <strong>Retiro en tienda gratis</strong>
          <span>Reserva online y retira sin costo.</span>
        </div>
        <div className="beneficio">
          <strong>Despacho a domicilio</strong>
          <span>Te lo llevamos por {formatearPrecio(COSTO_DESPACHO)}.</span>
        </div>
        <div className="beneficio">
          <strong>Paga como prefieras</strong>
          <span>Tarjeta, transferencia o en tienda.</span>
        </div>
        <div className="beneficio">
          <strong>Stock al día</strong>
          <span>Ves la disponibilidad de cada producto.</span>
        </div>
      </section>

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="seccion-inicio" id="ofertas" ref={refOfertas}>
          <div className="seccion-inicio-encabezado">
            <div>
              <h2>Productos en oferta</h2>
              <p>Aprovecha estos precios rebajados.</p>
            </div>
            <a href="#" className="enlace-editar" onClick={irAlCatalogo}>
              Ver todo el catálogo
            </a>
          </div>

          <div className="grilla-productos">
            {ofertas.map((o) => (
              <TarjetaOferta key={o.producto.codigo} oferta={o} {...propsTarjeta} />
            ))}
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className="seccion-inicio">
        <div className="seccion-inicio-encabezado">
          <div>
            <h2>Compra por categoría</h2>
            <p>Encuentra lo que necesitas más rápido.</p>
          </div>
        </div>

        <div className="categorias-grilla">
          {categorias.map((c) => (
            <button key={c.nombre} type="button" className="categoria-tarjeta" onClick={() => irACategoria(c.nombre)}>
              <span className="categoria-nombre">{c.nombre}</span>
              <span className="categoria-cantidad">
                {c.cantidad} {c.cantidad === 1 ? "producto" : "productos"}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
