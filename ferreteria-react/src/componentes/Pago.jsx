import { useState, useMemo, useRef, useEffect } from "react";
import { formatearPrecio, totalesCarrito, COSTO_DESPACHO } from "../datos/carrito.js";
import { validarCampo, formateadores, camposActivos } from "../utilidades/validaciones.js";
import { crearPedido, guardarUltimoPedido, METODOS } from "../utilidades/pedido.js";
import { descargarComprobante } from "../utilidades/comprobante.js";

const DATOS_INICIALES = {
  nombre: "",
  correo: "",
  telefono: "",
  direccion: "",
  comuna: "",
  tarjeta: "",
  titular: "",
  vence: "",
  cvv: "",
};

function Campo({ nombre, etiqueta, valor, error, onCambio, onSalir, ...resto }) {
  const clase = error ? "error" : error === "" ? "valido" : "";
  return (
    <div className="campo">
      <label htmlFor={`p-${nombre}`}>{etiqueta}</label>
      <input
        type="text"
        id={`p-${nombre}`}
        className={clase}
        value={valor}
        onChange={(e) => onCambio(nombre, e.target.value)}
        onBlur={() => onSalir(nombre)}
        {...resto}
      />
      <span className="mensaje-error">{error}</span>
    </div>
  );
}

function Fila({ etiqueta, valor, clase = "" }) {
  return (
    <div className={`resumen-fila ${clase}`}>
      <span>{etiqueta}</span>
      <span>{valor}</span>
    </div>
  );
}

export default function Pago({ itemsCarrito, vaciarCarrito, setSeccion }) {
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [errores, setErrores] = useState({});
  const [entrega, setEntrega] = useState("retiro");
  const [metodo, setMetodo] = useState("tarjeta");
  const [procesando, setProcesando] = useState(false);
  const [pedido, setPedido] = useState(null);

  const temporizadorPago = useRef(null);
  const confirmacionRef = useRef(null);

  const despacho = entrega === "despacho";
  const totales = useMemo(
    () => totalesCarrito(itemsCarrito, despacho),
    [itemsCarrito, despacho]
  );

  useEffect(() => () => clearTimeout(temporizadorPago.current), []);

  useEffect(() => {
    if (pedido && confirmacionRef.current) confirmacionRef.current.focus();
  }, [pedido]);


  const validar = (nombre, valor) => {
    const mensaje = validarCampo(nombre, valor);
    setErrores((e) => ({ ...e, [nombre]: mensaje }));
    return mensaje === "";
  };

  const handleCambio = (nombre, valorCrudo) => {
    const formatear = formateadores[nombre];
    const valor = formatear ? formatear(valorCrudo) : valorCrudo;
    setDatos((d) => ({ ...d, [nombre]: valor }));
    if (errores[nombre]) validar(nombre, valor);
  };

  const handleSalir = (nombre) => {
    if (datos[nombre].trim() !== "") validar(nombre, datos[nombre]);
  };

  const handleEntrega = (valor) => {
    setEntrega(valor);
    if (valor === "despacho" && metodo === "tienda") setMetodo("tarjeta");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (procesando) return;

    let primerInvalido = null;
    const nuevosErrores = {};
    camposActivos(entrega, metodo).forEach((nombre) => {
      const mensaje = validarCampo(nombre, datos[nombre]);
      nuevosErrores[nombre] = mensaje;
      if (mensaje && !primerInvalido) primerInvalido = nombre;
    });
    setErrores((prev) => ({ ...prev, ...nuevosErrores }));

    if (primerInvalido) {
      const input = document.getElementById(`p-${primerInvalido}`);
      if (input) input.focus();
      return;
    }

    if (totales.lineas.length === 0) return;

    setProcesando(true);

    const totalesPedido = totales;
    temporizadorPago.current = setTimeout(
      () => finalizarPedido(totalesPedido, { ...datos }, entrega, metodo),
      1500
    );
  };

  const finalizarPedido = (t, d, tipoEntrega, tipoMetodo) => {
    const nuevoPedido = crearPedido(t, d, tipoEntrega, tipoMetodo);
    guardarUltimoPedido(nuevoPedido);
    vaciarCarrito();
    setProcesando(false);
    setPedido(nuevoPedido);
    window.scrollTo(0, 0);
  };

  const handleIrACatalogo = () => setSeccion("catalogo");
  const handleIrACarrito = () => setSeccion("carrito");


  if (pedido) {
    let mensaje;
    if (pedido.metodo === "tarjeta") {
      mensaje = `Tu pago fue aprobado. Enviaremos el comprobante a ${pedido.cliente.correo}.`;
    } else if (pedido.metodo === "transferencia") {
      mensaje =
        `Transfiere ${formatearPrecio(pedido.total)} con los datos indicados y envía el comprobante. ` +
        "Prepararemos tu pedido cuando confirmemos el pago.";
    } else {
      mensaje = `Pagarás ${formatearPrecio(pedido.total)} al retirar tu pedido en la tienda.`;
    }

    return (
      <section className="pago-pagina">
        <h1>Finalizar compra</h1>
        <section
          className="confirmacion"
          aria-live="polite"
          tabIndex={-1}
          ref={confirmacionRef}
        >
          <h2>{pedido.metodo === "tarjeta" ? "¡Pago realizado con éxito!" : "¡Pedido recibido!"}</h2>
          <p className="confirmacion-numero">Pedido N° {pedido.numero}</p>
          <p>{mensaje}</p>

          <div className="confirmacion-datos">
            <Fila etiqueta="Cliente" valor={pedido.cliente.nombre} />
            <Fila etiqueta="Entrega" valor={pedido.entrega} />
            <Fila
              etiqueta="Método de pago"
              valor={METODOS[pedido.metodo] + (pedido.detallePago ? ` (${pedido.detallePago})` : "")}
            />
            <Fila etiqueta="Fecha" valor={pedido.fecha} />
          </div>

          <ul className="resumen-lineas">
            {pedido.lineas.map((l) => (
              <li key={l.codigo} className="resumen-linea">
                <span>{l.cantidad} × {l.nombre}</span>
                <span>{formatearPrecio(l.subtotal)}</span>
              </li>
            ))}
          </ul>

          <Fila
            etiqueta="Despacho"
            valor={pedido.despacho > 0 ? formatearPrecio(pedido.despacho) : "Gratis"}
          />
          <Fila etiqueta="Total pagado" valor={formatearPrecio(pedido.total)} clase="total" />

          <div className="confirmacion-acciones no-imprimir">
            <button type="button" className="boton-principal" onClick={() => descargarComprobante(pedido)}>
              Descargar comprobante
            </button>
            <button type="button" className="boton-secundario" onClick={() => window.print()}>
              Imprimir comprobante
            </button>
            <button type="button" className="boton-texto" onClick={handleIrACatalogo}>
              Volver al catálogo
            </button>
          </div>
        </section>
      </section>
    );
  }

  if (totales.lineas.length === 0) {
    return (
      <section className="pago-pagina">
        <h1>Finalizar compra</h1>
        <div className="carrito-vacio">
          <h2>No hay productos para pagar</h2>
          <p>Agrega productos desde el catálogo para armar tu pedido.</p>
          <button type="button" className="boton-principal" onClick={handleIrACatalogo}>
            Ver catálogo
          </button>
        </div>
      </section>
    );
  }


  const textoBoton = procesando
    ? "Procesando…"
    : metodo === "tarjeta"
      ? `Pagar ${formatearPrecio(totales.total)}`
      : `Confirmar pedido por ${formatearPrecio(totales.total)}`;

  const propsCampo = (nombre) => ({
    nombre,
    valor: datos[nombre],
    error: errores[nombre],
    onCambio: handleCambio,
    onSalir: handleSalir,
  });

  return (
    <section className="pago-pagina">
      <h1>Finalizar compra</h1>

      <div className="pago-layout">
        <form id="formPago" onSubmit={handleSubmit} noValidate>
          <fieldset className="bloque">
            <legend>Datos de contacto</legend>
            <Campo
              {...propsCampo("nombre")}
              etiqueta="Nombre completo"
              autoComplete="name"
              placeholder="Ej: Juan Carlos Muñoz"
            />
            <div className="campos-fila">
              <Campo
                {...propsCampo("correo")}
                etiqueta="Correo electrónico"
                inputMode="email"
                autoComplete="email"
                placeholder="Ej: juan@correo.com"
              />
              <Campo
                {...propsCampo("telefono")}
                etiqueta="Teléfono (9 dígitos)"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Ej: 912345678"
              />
            </div>
          </fieldset>

          <fieldset className="bloque">
            <legend>Entrega</legend>
            <div className="opciones">
              <label className="label-checkbox">
                <input
                  type="radio"
                  name="entrega"
                  value="retiro"
                  checked={entrega === "retiro"}
                  onChange={() => handleEntrega("retiro")}
                />
                Retiro en tienda (gratis)
              </label>
              <label className="label-checkbox">
                <input
                  type="radio"
                  name="entrega"
                  value="despacho"
                  checked={entrega === "despacho"}
                  onChange={() => handleEntrega("despacho")}
                />
                Despacho a domicilio ({formatearPrecio(COSTO_DESPACHO)})
              </label>
            </div>

            {despacho && (
              <div className="campos-fila">
                <Campo
                  {...propsCampo("direccion")}
                  etiqueta="Dirección"
                  autoComplete="street-address"
                  placeholder="Ej: Av. Brasil 1234"
                />
                <Campo
                  {...propsCampo("comuna")}
                  etiqueta="Comuna"
                  placeholder="Ej: Valparaíso"
                />
              </div>
            )}
          </fieldset>

          <fieldset className="bloque">
            <legend>Método de pago</legend>
            <div className="opciones">
              <label className="label-checkbox">
                <input
                  type="radio"
                  name="metodo"
                  value="tarjeta"
                  checked={metodo === "tarjeta"}
                  onChange={() => setMetodo("tarjeta")}
                />
                Tarjeta de crédito o débito
              </label>
              <label className="label-checkbox">
                <input
                  type="radio"
                  name="metodo"
                  value="transferencia"
                  checked={metodo === "transferencia"}
                  onChange={() => setMetodo("transferencia")}
                />
                Transferencia bancaria
              </label>
              <label className={`label-checkbox ${despacho ? "deshabilitada" : ""}`}>
                <input
                  type="radio"
                  name="metodo"
                  value="tienda"
                  checked={metodo === "tienda"}
                  disabled={despacho}
                  onChange={() => setMetodo("tienda")}
                />
                Pagar en tienda al retirar
              </label>
            </div>

            {metodo === "tarjeta" && (
              <div>
                <p className="panel-info">
                  Modo demostración: no se realiza ningún cobro real. Para probar usa el número
                  4111 1111 1111 1111, una fecha futura y cualquier CVV.
                </p>
                <Campo
                  {...propsCampo("tarjeta")}
                  etiqueta="Número de tarjeta"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                />
                <Campo
                  {...propsCampo("titular")}
                  etiqueta="Nombre del titular"
                  autoComplete="cc-name"
                  placeholder="Como aparece en la tarjeta"
                />
                <div className="campos-fila">
                  <Campo
                    {...propsCampo("vence")}
                    etiqueta="Vencimiento (MM/AA)"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                  />
                  <Campo
                    {...propsCampo("cvv")}
                    etiqueta="CVV"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                  />
                </div>
              </div>
            )}

            {metodo === "transferencia" && (
              <div className="panel-info">
                <p><strong>Datos para transferir</strong></p>
                <p>
                  Banco: [nombre del banco]<br />
                  Tipo de cuenta: [corriente / vista]<br />
                  N° de cuenta: [número de cuenta]<br />
                  RUT: [RUT de la ferretería]<br />
                  Correo para el comprobante: [correo de la ferretería]
                </p>
                <p>Tu pedido queda pendiente hasta confirmar la transferencia.</p>
              </div>
            )}

            {metodo === "tienda" && (
              <div className="panel-info">
                <p>Reserva tus productos ahora y paga en caja cuando vengas a retirarlos.</p>
              </div>
            )}
          </fieldset>

          <button type="submit" className="boton-principal" disabled={procesando}>
            {textoBoton}
          </button>
        </form>

        {/* Resumen del pedido */}
        <aside className="carrito-resumen" aria-label="Resumen del pedido">
          <h2>Tu pedido</h2>
          <ul className="resumen-lineas">
            {totales.lineas.map((l) => (
              <li key={l.producto.codigo} className="resumen-linea">
                <span>{l.cantidad} × {l.producto.nombre}</span>
                <span>{formatearPrecio(l.subtotal)}</span>
              </li>
            ))}
          </ul>
          <Fila etiqueta="Subtotal" valor={formatearPrecio(totales.subtotal)} />
          <Fila
            etiqueta="Despacho"
            valor={despacho ? formatearPrecio(totales.despacho) : "Gratis (retiro en tienda)"}
          />
          <Fila etiqueta="Total (IVA incluido)" valor={formatearPrecio(totales.total)} clase="total" />
          <button
            type="button"
            className="boton-texto enlace-editar"
            onClick={handleIrACarrito}
            disabled={procesando}
          >
            Modificar carrito
          </button>
        </aside>
      </div>
    </section>
  );
}
