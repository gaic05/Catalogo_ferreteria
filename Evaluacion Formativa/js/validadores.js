export function estaVacio(valor) {
  if (valor === null || valor === undefined) {
    return true;
  }

  if (typeof valor === "boolean") {
    return false;
  }

  return String(valor).trim() === "";
}

export function obligatorio(valor, mensaje = "Este campo es obligatorio") {
  if (typeof valor === "boolean") {
    return valor ? null : mensaje;
  }

  return estaVacio(valor) ? mensaje : null;
}

export function longitudMinima(valor, minimo, mensaje) {
  if (estaVacio(valor)) {
    return null;
  }

  const texto = String(valor).trim();
  return texto.length < minimo
    ? mensaje || `Debe tener al menos ${minimo} caracteres`
    : null;
}

export function longitudMaxima(valor, maximo, mensaje) {
  if (estaVacio(valor)) {
    return null;
  }

  const texto = String(valor).trim();
  return texto.length > maximo
    ? mensaje || `No puede superar ${maximo} caracteres`
    : null;
}

export function correo(
  valor,
  mensaje = "Ingresa un correo electrónico válido",
) {
  if (estaVacio(valor)) {
    return null;
  }

  const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return patronCorreo.test(String(valor).trim()) ? null : mensaje;
}

export function soloLetras(valor, mensaje = "Usa solo letras y espacios") {
  if (estaVacio(valor)) {
    return null;
  }

  const patronLetras = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;
  return patronLetras.test(String(valor).trim()) ? null : mensaje;
}

export function telefonoChileno(
  valor,
  mensaje = "Ingresa un celular chileno válido (ej: 9 1234 5678)",
) {
  if (estaVacio(valor)) {
    return null;
  }

  const digitos = String(valor).replace(/\D/g, "");
  const esCelularLocal = digitos.length === 9 && digitos.startsWith("9");
  const esCelularInternacional =
    digitos.length === 11 && digitos.startsWith("569");

  return esCelularLocal || esCelularInternacional ? null : mensaje;
}

export function validarNombre(valor) {
  return (
    obligatorio(valor, "El nombre es obligatorio") ||
    longitudMinima(valor, 2, "El nombre debe tener al menos 2 caracteres") ||
    longitudMaxima(valor, 40, "El nombre no puede superar 40 caracteres") ||
    soloLetras(valor, "El nombre solo puede contener letras y espacios")
  );
}

export function validarApellidos(valor) {
  return (
    obligatorio(valor, "El apellido es obligatorio") ||
    longitudMinima(valor, 2, "El apellido debe tener al menos 2 caracteres") ||
    longitudMaxima(valor, 40, "El apellido no puede superar 40 caracteres") ||
    soloLetras(valor, "El apellido solo puede contener letras y espacios")
  );
}

export function validarCorreo(valor) {
  return (
    obligatorio(valor, "El correo electrónico es obligatorio") ||
    correo(valor, "Ingresa un correo con formato válido")
  );
}

export function validarTelefono(valor) {
  if (estaVacio(valor)) {
    return null;
  }

  return telefonoChileno(
    valor,
    "Ingresa un celular chileno válido, por ejemplo 9 1234 5678",
  );
}

export function validarAsunto(valor) {
  const asuntosPermitidos = ["consulta", "soporte", "sugerencia", "otro"];

  return (
    obligatorio(valor, "Selecciona un asunto") ||
    (asuntosPermitidos.includes(valor)
      ? null
      : "Selecciona un asunto de la lista")
  );
}

export function validarMensaje(valor) {
  return (
    obligatorio(valor, "El mensaje es obligatorio") ||
    longitudMinima(valor, 20, "El mensaje debe tener al menos 20 caracteres") ||
    longitudMaxima(valor, 500, "El mensaje no puede superar 500 caracteres")
  );
}

export function validarPrivacidad(valor) {
  return obligatorio(
    valor,
    "Debes aceptar el uso de tus datos para responder el contacto",
  );
}
