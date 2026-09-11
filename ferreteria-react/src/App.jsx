import { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "./componentes/Header.jsx"; 
import Catalogo from "./componentes/Catalogo.jsx";
import { PRODUCTOS } from './datos/productos';
import Carrito from "./componentes/Carrito.jsx";
import Pago from "./componentes/Pago.jsx";
import Formulario from "./componentes/Formulario.jsx";
import Inicio from "./componentes/Inicio.jsx";
import { formatearPrecio, leerCarrito, guardarCarrito, detalleCarrito } from "./datos/carrito.js";

export default function App() {

  const [seccion, setSeccion] = useState("inicio");
  const [itemsCarrito, setItemsCarrito] = useState(leerCarrito);
  const [aviso, setAviso] = useState({ mensaje: "", ok: true, visible: false });
  const temporizadorAviso = useRef(null);

  // Líneas válidas del carrito (producto existente y con stock) y contador del header
  const lineasCarrito = useMemo(() => detalleCarrito(itemsCarrito), [itemsCarrito]);
  const cantidadCarrito = useMemo(
    () => lineasCarrito.reduce((total, l) => total + l.cantidad, 0),
    [lineasCarrito]
  );

  // Sube al inicio de la página al cambiar de sección
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [seccion]);

  // Limpia el temporizador del aviso al desmontar
  useEffect(() => () => clearTimeout(temporizadorAviso.current), []);

  const actualizarCarrito = (nuevosItems) => {
    setItemsCarrito(nuevosItems);
    guardarCarrito(nuevosItems);
  };

  const agregarAlCarrito = (codigo, cantidad = 1) => {
    const producto = PRODUCTOS.find((p) => p.codigo === codigo);
    if (!producto) {
      return { ok: false, mensaje: "El producto no existe." };
    }
    if (producto.stock <= 0) {
      return { ok: false, mensaje: "Este producto no tiene stock." };
    }

    const item = itemsCarrito.find((i) => i.codigo === codigo);
    const actual = item ? item.cantidad : 0;
    const nueva = Math.min(actual + cantidad, producto.stock);

    if (nueva === actual) {
      return {
        ok: false,
        mensaje: "Ya tienes en el carrito todo el stock disponible de este producto.",
      };
    }

    const nuevosItems = item
      ? itemsCarrito.map((i) => (i.codigo === codigo ? { ...i, cantidad: nueva } : i))
      : [...itemsCarrito, { codigo, cantidad: nueva }];

    actualizarCarrito(nuevosItems);
    return { ok: true, mensaje: `Agregado al carrito: ${producto.nombre}` };
  };

  // Aviso flotante (reemplaza al alert del navegador)
  const mostrarAviso = (mensaje, ok = true) => {
    setAviso({ mensaje, ok, visible: true });
    clearTimeout(temporizadorAviso.current);
    temporizadorAviso.current = setTimeout(() => {
      setAviso((a) => ({ ...a, visible: false }));
    }, 2500);
  };
  
  return (
    <>
      <Header
        currentSection={seccion}
        setSection={setSeccion}
        cantidadCarrito={cantidadCarrito}
      />

      <main className="contenido-principal">
        {seccion === "inicio" && (
  <Inicio
    productos={PRODUCTOS}
    formatearPrecio={formatearPrecio}
    agregarAlCarrito={agregarAlCarrito}
    mostrarAviso={mostrarAviso}
    setSeccion={setSeccion}
  />
)}
        {seccion === "catalogo" && (
          <Catalogo 
            productos={PRODUCTOS}
            formatearPrecio={formatearPrecio}
            agregarAlCarrito={agregarAlCarrito}
            mostrarAviso={mostrarAviso}
          />
        )}
        {seccion === "nosotros" && <div>Aquí va la sección Nosotros</div>}
        {seccion === "contacto" && <div>Aquí va el Formulario de Contacto</div>}
        {seccion === "carrito" && (
          <Carrito
            itemsCarrito={itemsCarrito}
            actualizarCarrito={actualizarCarrito}
            setSeccion={setSeccion}
          />
        )}
        {seccion === "pago" && (
          <Pago
            itemsCarrito={itemsCarrito}
            vaciarCarrito={() => actualizarCarrito([])}
            setSeccion={setSeccion}
          />
        )}
        {seccion === "registro" && <Formulario />}
      </main>

      <div
        className={`aviso-carrito ${aviso.visible ? "visible" : ""} ${aviso.ok ? "" : "error"}`}
        role="status"
        aria-live="polite"
      >
        {aviso.mensaje}
      </div>
    </>
  );
}