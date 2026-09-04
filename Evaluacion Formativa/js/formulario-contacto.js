import {
  validarApellidos,
  validarAsunto,
  validarCorreo,
  validarMensaje,
  validarNombre,
  validarPrivacidad,
  validarTelefono,
} from "./validadores.js";

const formulario = document.querySelector("#formulario-contacto");
const panelExito = document.querySelector("#panel-exito");

const etiquetasAsunto = {
  consulta: "Consulta general",
  soporte: "Soporte",
  sugerencia: "Sugerencia",
  otro: "Otro",
};

function mostrarError(nombreCampo, mensaje) {
  const campo = formulario.elements[nombreCampo];
  const elementoError = document.querySelector(
    `[data-error-for="${nombreCampo}"]`,
  );
  const tieneError = Boolean(mensaje);

  elementoError.textContent = mensaje || "";
  campo.setAttribute("aria-invalid", tieneError ? "true" : "false");
  campo.classList.toggle("is-invalid", tieneError);
  campo.classList.toggle("is-valid", !tieneError);
}

function enviarFormulario(evento) {
  evento.preventDefault();

  const datos = new FormData(formulario);
  const valores = {
    nombre: datos.get("nombre") ?? "",
    apellidos: datos.get("apellidos") ?? "",
    correo: datos.get("correo") ?? "",
    telefono: datos.get("telefono") ?? "",
    asunto: datos.get("asunto") ?? "",
    mensaje: datos.get("mensaje") ?? "",
    privacidad: datos.get("privacidad") === "on",
  };

  const errorNombre = validarNombre(valores.nombre);
  const errorApellidos = validarApellidos(valores.apellidos);
  const errorCorreo = validarCorreo(valores.correo);
  const errorTelefono = validarTelefono(valores.telefono);
  const errorAsunto = validarAsunto(valores.asunto);
  const errorMensaje = validarMensaje(valores.mensaje);
  const errorPrivacidad = validarPrivacidad(valores.privacidad);

  mostrarError("nombre", errorNombre);
  mostrarError("apellidos", errorApellidos);
  mostrarError("correo", errorCorreo);
  mostrarError("telefono", errorTelefono);
  mostrarError("asunto", errorAsunto);
  mostrarError("mensaje", errorMensaje);
  mostrarError("privacidad", errorPrivacidad);

  const primerError =
    (errorNombre && "nombre") ||
    (errorApellidos && "apellidos") ||
    (errorCorreo && "correo") ||
    (errorTelefono && "telefono") ||
    (errorAsunto && "asunto") ||
    (errorMensaje && "mensaje") ||
    (errorPrivacidad && "privacidad");

  if (primerError) {
    formulario.elements[primerError].focus();
    return;
  }

  formulario.classList.add("is-hidden");
  document.querySelector(".intro").classList.add("is-hidden");
  panelExito.classList.remove("is-hidden");
  panelExito.querySelector("[data-exito-nombre]").textContent =
    `${valores.nombre} ${valores.apellidos}`;
  panelExito.querySelector("[data-exito-correo]").textContent = valores.correo;
  panelExito.querySelector("[data-exito-asunto]").textContent =
    etiquetasAsunto[valores.asunto];
}

formulario.addEventListener("submit", enviarFormulario);
