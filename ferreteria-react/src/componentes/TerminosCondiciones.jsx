import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { COSTO_DESPACHO, formatearPrecio } from "../datos/carrito.js";

const ULTIMA_ACTUALIZACION = "octubre de 2026";

const SECCIONES = [
  {
    titulo: "1. Aceptación de los términos",
    parrafos: [
      "Estos términos y condiciones regulan el uso del sitio web de Ferretería Los Maestros y las compras que se realizan a través de él. Al crear una cuenta o realizar un pedido, declaras que los has leído y que los aceptas.",
      "Para registrarte y comprar debes ser mayor de 18 años y tener capacidad legal para contratar.",
    ],
  },
  {
    titulo: "2. Registro y cuenta de usuario",
    parrafos: [
      "Para crear una cuenta debes entregar información verdadera, completa y actualizada. Eres responsable de la veracidad de los datos que ingresas.",
      "Tu contraseña es personal. Debes mantenerla en reserva y avisarnos si sospechas que alguien más accede a tu cuenta. Todo lo que ocurra desde tu cuenta se entenderá realizado por ti.",
      "Podemos suspender o cerrar cuentas que entreguen datos falsos, hagan un uso fraudulento del sitio o incumplan estos términos.",
    ],
  },
  {
    titulo: "3. Productos, precios y stock",
    parrafos: [
      "Las fotografías de los productos son referenciales y pueden diferir levemente del producto real. Las características, marcas y medidas se indican en la ficha de cada producto.",
      "Los precios están expresados en pesos chilenos (CLP) e incluyen IVA, salvo que se indique lo contrario. El costo de despacho, si corresponde, se informa antes de pagar.",
      "La disponibilidad depende del stock. Si un producto se agota o hay un error evidente de precio, podemos anular o modificar el pedido, y te avisaremos y te devolveremos lo pagado.",
      "Los precios en oferta rigen mientras haya stock disponible y pueden cambiar sin previo aviso, sin afectar a los pedidos ya confirmados.",
    ],
  },
  {
    titulo: "4. Medios de pago",
    parrafos: [
      "Puedes pagar con tarjeta de crédito o débito, por transferencia bancaria o en la tienda al momento de retirar, según las opciones disponibles al finalizar tu compra.",
      "Los pedidos pagados por transferencia quedan pendientes hasta que confirmemos el pago. Los pedidos que se pagan en tienda se reservan por el plazo que indiquemos al confirmar el pedido.",
      "Nunca te pediremos tu clave de cajero ni datos de tu tarjeta por correo o mensaje.",
    ],
  },
  {
    titulo: "5. Despacho y retiro en tienda",
    parrafos: [
      `Puedes retirar tu pedido en la tienda sin costo, o pedir despacho a domicilio con un costo de ${formatearPrecio(COSTO_DESPACHO)}.`,
      "Los plazos de entrega son estimados y pueden variar según la zona, el tamaño del pedido y la disponibilidad. Debes indicar una dirección completa y correcta; si el despacho falla por datos errados o porque nadie recibe el pedido, podemos cobrar un nuevo envío.",
      "Para retirar en tienda, presenta tu número de pedido y tu cédula de identidad.",
    ],
  },
  {
    titulo: "6. Cambios, devoluciones y garantía",
    parrafos: [
      "Las compras por internet tienen derecho a retracto, de acuerdo con la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores. Puedes ejercerlo dentro de 10 días corridos desde que recibes el producto, siempre que no haya sido usado y venga en su empaque original, salvo las excepciones que establece la ley.",
      "Si el producto llega con fallas o no corresponde a lo que compraste, tienes derecho a la garantía legal: puedes pedir su reparación, su cambio o la devolución del dinero, según corresponda.",
      "Para solicitar un cambio o devolución, escríbenos con tu número de pedido al correo [correo de contacto].",
    ],
  },
  {
    titulo: "7. Privacidad y datos personales",
    parrafos: [
      "Usamos tus datos personales para administrar tu cuenta, procesar y despachar tus pedidos, emitir comprobantes y atender tus consultas. No vendemos tus datos a terceros.",
      "Podemos compartir la información estrictamente necesaria con quienes nos ayudan a operar, como servicios de pago y de transporte, solo para cumplir tu pedido.",
      "Tienes derecho a pedir acceso, rectificación o eliminación de tus datos escribiéndonos al correo [correo de contacto].",
    ],
  },
  {
    titulo: "8. Uso del sitio y propiedad intelectual",
    parrafos: [
      "El nombre, el logo, los textos y las imágenes del sitio pertenecen a Ferretería Los Maestros o a sus proveedores y no pueden copiarse ni usarse sin autorización.",
      "Te comprometes a usar el sitio de forma lícita, sin intentar acceder a áreas restringidas ni alterar su funcionamiento.",
    ],
  },
  {
    titulo: "9. Modificaciones",
    parrafos: [
      "Podemos actualizar estos términos y condiciones. La versión vigente es la publicada en el sitio, y se aplica a las compras realizadas desde su publicación.",
    ],
  },
  {
    titulo: "10. Contacto",
    parrafos: [
      "Ferretería Los Maestros, RUT [RUT de la ferretería], [dirección de la tienda]. Correo: [correo de contacto]. Teléfono: [teléfono de contacto].",
    ],
  },
];

export default function TerminosCondiciones({ onCerrar, onAceptar }) {
  const refVentana = useRef(null);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    refVentana.current?.focus();

    const alPresionarTecla = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", alPresionarTecla);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [onCerrar]);

  return createPortal(
    <div
      className="terminos-fondo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        className="terminos-ventana"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminos-titulo"
        tabIndex={-1}
        ref={refVentana}
      >
        <div className="terminos-encabezado">
          <h2 id="terminos-titulo">Términos y condiciones</h2>
          <p>Ferretería Los Maestros · Última actualización: {ULTIMA_ACTUALIZACION}</p>
        </div>

        <div className="terminos-cuerpo">
          {SECCIONES.map((seccion) => (
            <section key={seccion.titulo}>
              <h3>{seccion.titulo}</h3>
              {seccion.parrafos.map((texto) => (
                <p key={texto}>{texto}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="terminos-pie">
          <button type="button" className="boton-secundario" onClick={onCerrar}>
            Cerrar
          </button>
          <button type="button" className="boton-principal" onClick={onAceptar}>
            Acepto los términos y condiciones
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
