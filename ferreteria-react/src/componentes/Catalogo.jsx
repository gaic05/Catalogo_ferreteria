import React, { useState, useEffect, useMemo } from "react";

// --- Funciones auxiliares de utilidad ---

function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function estadoStock(producto) {
  if (producto.stock <= 0) {
    return { clase: "agotado", texto: "Agotado" };
  }
  if (producto.stock <= producto.stockMinimo) {
    return { clase: "bajo", texto: "Stock bajo" };
  }
  return { clase: "disponible", texto: "Disponible" };
}

function filtrarProductos(lista, filtros) {
  const texto = normalizar(filtros.texto || "");
  const categoria = filtros.categoria || "";
  const subcategoria = filtros.subcategoria || "";
  const soloDisponibles = Boolean(filtros.soloDisponibles);

  return lista.filter((p) => {
    if (categoria !== "" && p.categoria !== categoria) {
      return false;
    }
    if (subcategoria !== "" && p.subcategoria !== subcategoria) {
      return false;
    }
    if (soloDisponibles && p.stock <= 0) {
      return false;
    }
    if (texto !== "") {
      const contenido = normalizar(
        [p.nombre, p.marca, p.codigo, p.subcategoria, p.categoria].join(" ")
      );
      if (!contenido.includes(texto)) {
        return false;
      }
    }
    return true;
  });
}

function ordenarProductos(lista, criterio) {
  const copia = lista.slice();
  const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, "es");

  switch (criterio) {
    case "nombre-desc":
      copia.sort((a, b) => porNombre(b, a));
      break;
    case "precio-asc":
      copia.sort((a, b) => a.precioVenta - b.precioVenta || porNombre(a, b));
      break;
    case "precio-desc":
      copia.sort((a, b) => b.precioVenta - a.precioVenta || porNombre(a, b));
      break;
    default:
      copia.sort(porNombre);
  }
  return copia;
}

// --- Subcomponentes ---

function BloqueImagen({ producto }) {
  const [error, setError] = useState(false);

  if (producto.imagen && !error) {
    return (
      <div className="producto-imagen">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div className="producto-imagen sin-imagen">
      <span>Imagen referencial</span>
    </div>
  );
}

function TarjetaProducto({ producto, formatearPrecio, agregarAlCarrito, mostrarAviso }) {
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
    <article
      className={`producto ${agotado ? "agotado" : ""}`}
      data-codigo={producto.codigo}
    >
      <BloqueImagen producto={producto} />

      <div className="producto-info">
        <span className="producto-codigo">Cód. {producto.codigo}</span>
        <span className="producto-categoria">{producto.categoria}</span>
        <h3 className="producto-nombre">{producto.nombre}</h3>
        <p className="producto-detalle">
          {producto.subcategoria} · Marca: {producto.marca}
        </p>

        <div className="producto-pie">
          <span className="producto-precio">
            {formatearPrecio ? formatearPrecio(producto.precioVenta) : `$${producto.precioVenta}`}
            <small> / {producto.unidad}</small>
          </span>
          <span className={`estado-stock ${estado.clase}`}>{estado.texto}</span>
        </div>

        <button
          type="button"
          className="boton-agregar"
          disabled={agotado}
          onClick={handleAgregar}
        >
          {agotado ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}

// --- Componente Principal ---

export default function Catalogo({
  productos = [],
  formatearPrecio = (p) => `$${p}`,
  agregarAlCarrito,
  mostrarAviso,
}) {
  // Estados para los filtros
  const [buscador, setBuscador] = useState("");
  const [orden, setOrden] = useState("nombre-asc");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [categoriaSel, setCategoriaSel] = useState("");
  const [subcategoriaSel, setSubcategoriaSel] = useState("");

  // Obtener categorías únicas dinámicamente
  const categorias = useMemo(() => {
    return Array.from(new Set(productos.map((p) => p.categoria)));
  }, [productos]);

  // Leer estado inicial desde la URL al montar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("categoria") || "";
      const sc = params.get("subcategoria") || "";

      if (categorias.includes(c)) {
        setCategoriaSel(c);
        const validaSub = productos.some(
          (p) => p.categoria === c && p.subcategoria === sc
        );
        if (validaSub) {
          setSubcategoriaSel(sc);
        }
      }
    }
  }, [categorias, productos]);

  // Sincronizar cambios de categorías en la URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams();
        if (categoriaSel) params.set("categoria", categoriaSel);
        if (subcategoriaSel) params.set("subcategoria", subcategoriaSel);

        const consulta = params.toString();
        const nuevaUrl =
          window.location.pathname + (consulta ? "?" + consulta : "");
        window.history.replaceState(null, "", nuevaUrl);
      } catch (e) {
        console.error("No se pudo actualizar la URL", e);
      }
    }
  }, [categoriaSel, subcategoriaSel]);

  // Subcategorías disponibles según la categoría seleccionada
  const subcategoriasDisponibles = useMemo(() => {
    if (!categoriaSel) return [];
    const deCategoria = productos.filter((p) => p.categoria === categoriaSel);
    return Array.from(new Set(deCategoria.map((p) => p.subcategoria)));
  }, [productos, categoriaSel]);

  // Filtrado y ordenamiento memoizado de productos
  const productosProcesados = useMemo(() => {
    const filtrados = filtrarProductos(productos, {
      texto: buscador,
      categoria: categoriaSel,
      subcategoria: subcategoriaSel,
      soloDisponibles,
    });
    return ordenarProductos(filtrados, orden);
  }, [productos, buscador, categoriaSel, subcategoriaSel, soloDisponibles, orden]);

  // Handlers para interactividad
  const handleElegirCategoria = (c) => {
    setCategoriaSel(c);
    setSubcategoriaSel("");
  };

  const handleLimpiarFiltros = () => {
    setBuscador("");
    setOrden("nombre-asc");
    setSoloDisponibles(false);
    setCategoriaSel("");
    setSubcategoriaSel("");
  };

  return (
    <main className="catalogo">
      <section className="catalogo-encabezado">
        <h1>Catálogo de productos</h1>
        <p>Materiales de construcción, herramientas y ferretería general.</p>
      </section>

      {/* Navegación por Categorías */}
      <nav className="categorias" aria-label="Categorías">
        <h2>Categorías</h2>
        <div id="botonesCategorias" className="chips">
          <button
            type="button"
            className={`chip ${categoriaSel === "" ? "activo" : ""}`}
            aria-pressed={categoriaSel === ""}
            onClick={() => handleElegirCategoria("")}
          >
            Todas <span className="cantidad">({productos.length})</span>
          </button>
          {categorias.map((cat) => {
            const cantidad = productos.filter((p) => p.categoria === cat).length;
            const activo = categoriaSel === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`chip ${activo ? "activo" : ""}`}
                aria-pressed={activo}
                onClick={() => handleElegirCategoria(cat)}
              >
                {cat} <span className="cantidad">({cantidad})</span>
              </button>
            );
          })}
        </div>

        {/* Subcategorías */}
        {categoriaSel !== "" && (
          <div className="subcategorias">
            <h3>{categoriaSel}: tipo de producto</h3>
            <div className="chips chips-sub">
              <button
                type="button"
                className={`chip ${subcategoriaSel === "" ? "activo" : ""}`}
                aria-pressed={subcategoriaSel === ""}
                onClick={() => setSubcategoriaSel("")}
              >
                Todos{" "}
                <span className="cantidad">
                  (
                  {
                    productos.filter((p) => p.categoria === categoriaSel)
                      .length
                  }
                  )
                </span>
              </button>
              {subcategoriasDisponibles.map((sc) => {
                const cantidad = productos.filter(
                  (p) => p.categoria === categoriaSel && p.subcategoria === sc
                ).length;
                const activo = subcategoriaSel === sc;
                return (
                  <button
                    key={sc}
                    type="button"
                    className={`chip ${activo ? "activo" : ""}`}
                    aria-pressed={activo}
                    onClick={() => setSubcategoriaSel(sc)}
                  >
                    {sc} <span className="cantidad">({cantidad})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Sección de Filtros */}
      <section className="filtros" aria-label="Filtros del catálogo">
        <div className="filtro">
          <label htmlFor="buscador">Buscar</label>
          <input
            type="search"
            id="buscador"
            placeholder="Nombre, marca o código"
            value={buscador}
            onChange={(e) => setBuscador(e.target.value)}
          />
        </div>

        <div className="filtro">
          <label htmlFor="ordenar">Ordenar por</label>
          <select
            id="ordenar"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>

        <div className="filtro filtro-check">
          <label className="label-checkbox">
            <input
              type="checkbox"
              id="soloDisponibles"
              checked={soloDisponibles}
              onChange={(e) => setSoloDisponibles(e.target.checked)}
            />
            Solo con stock
          </label>
        </div>

        <button
          type="button"
          className="boton-limpiar"
          onClick={handleLimpiarFiltros}
        >
          Limpiar filtros
        </button>
      </section>

      {/* Contador de resultados */}
      <p className="contador" aria-live="polite">
        {productosProcesados.length === 1
          ? "Mostrando 1 producto"
          : `Mostrando ${productosProcesados.length} productos`}
      </p>

      {/* Grilla de productos / Sin resultados */}
      {productosProcesados.length > 0 ? (
        <section className="grilla-productos" aria-label="Productos">
          {productosProcesados.map((producto) => (
            <TarjetaProducto
              key={producto.codigo}
              producto={producto}
              formatearPrecio={formatearPrecio}
              agregarAlCarrito={agregarAlCarrito}
              mostrarAviso={mostrarAviso}
            />
          ))}
        </section>
      ) : (
        <p className="sin-resultados">
          No se encontraron productos con los filtros seleccionados.
        </p>
      )}
    </main>
  );
}