// Reglas de validación y formato de los campos del formulario de pago.

// Algoritmo de Luhn: comprueba que el número de tarjeta sea matemáticamente válido
export function luhn(numero) {
  let suma = 0;
  let alterna = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let n = parseInt(numero.charAt(i), 10);
    if (alterna) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    suma += n;
    alterna = !alterna;
  }
  return suma % 10 === 0;
}

const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'.-]+$/;

// Cada regla devuelve "" si el valor es válido, o el mensaje de error.
export const reglas = {
  nombre: (v) => {
    if (v.length < 3) return "Ingresa tu nombre completo.";
    return REGEX_NOMBRE.test(v) ? "" : "El nombre solo puede contener letras.";
  },
  correo: (v) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ? "" : "Ingresa un correo válido.",
  telefono: (v) => (/^\d{9}$/.test(v) ? "" : "El teléfono debe tener 9 dígitos."),
  direccion: (v) => (v.length >= 5 ? "" : "Ingresa la dirección de despacho."),
  comuna: (v) => (v.length >= 3 ? "" : "Ingresa la comuna."),
  tarjeta: (v) => {
    const digitos = v.replace(/\s/g, "");
    return /^\d{13,19}$/.test(digitos) && luhn(digitos) ? "" : "El número de tarjeta no es válido.";
  },
  titular: (v) =>
    v.length < 3 || !REGEX_NOMBRE.test(v) ? "Ingresa el nombre como aparece en la tarjeta." : "",
  vence: (v, ahora = new Date()) => {
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
    if (!m) return "Usa el formato MM/AA.";
    const mes = parseInt(m[1], 10);
    const anio = 2000 + parseInt(m[2], 10);
    if (anio < ahora.getFullYear() || (anio === ahora.getFullYear() && mes < ahora.getMonth() + 1)) {
      return "La tarjeta está vencida.";
    }
    return "";
  },
  cvv: (v) => (/^\d{3,4}$/.test(v) ? "" : "El CVV debe tener 3 o 4 dígitos."),
};

export function validarCampo(nombre, valor, ahora) {
  return reglas[nombre](String(valor).trim(), ahora);
}

// Campos que se validan según las opciones elegidas
export function camposActivos(entrega, metodo) {
  let nombres = ["nombre", "correo", "telefono"];
  if (entrega === "despacho") nombres = nombres.concat(["direccion", "comuna"]);
  if (metodo === "tarjeta") nombres = nombres.concat(["tarjeta", "titular", "vence", "cvv"]);
  return nombres;
}

// --- Formato mientras se escribe ---

const soloDigitos = (texto) => texto.replace(/\D/g, "");

export const formateadores = {
  telefono: (v) => soloDigitos(v).slice(0, 9),
  tarjeta: (v) => soloDigitos(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
  vence: (v) => {
    const d = soloDigitos(v).slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  },
  cvv: (v) => soloDigitos(v).slice(0, 4),
};
