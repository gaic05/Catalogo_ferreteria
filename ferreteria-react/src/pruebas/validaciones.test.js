import { describe, it, expect } from "vitest";
import { luhn, validarCampo, camposActivos, formateadores } from "../utilidades/validaciones.js";

describe("luhn (número de tarjeta)", () => {
  it("acepta números válidos", () => {
    expect(luhn("4111111111111111")).toBe(true);
    expect(luhn("5555555555554444")).toBe(true);
  });

  it("rechaza números con un dígito alterado", () => {
    expect(luhn("4111111111111112")).toBe(false);
  });
});

describe("validarCampo", () => {
  it("nombre: exige 3 letras como mínimo y no admite números", () => {
    expect(validarCampo("nombre", "Juan Muñoz")).toBe("");
    expect(validarCampo("nombre", "Jo")).not.toBe("");
    expect(validarCampo("nombre", "Juan123")).toBe("El nombre solo puede contener letras.");
  });

  it("correo: valida el formato", () => {
    expect(validarCampo("correo", "juan@correo.com")).toBe("");
    expect(validarCampo("correo", "juan@correo")).toBe("Ingresa un correo válido.");
    expect(validarCampo("correo", "juancorreo.com")).toBe("Ingresa un correo válido.");
  });

  it("teléfono: exactamente 9 dígitos", () => {
    expect(validarCampo("telefono", "912345678")).toBe("");
    expect(validarCampo("telefono", "91234567")).toBe("El teléfono debe tener 9 dígitos.");
  });

  it("tarjeta: acepta espacios y valida con Luhn", () => {
    expect(validarCampo("tarjeta", "4111 1111 1111 1111")).toBe("");
    expect(validarCampo("tarjeta", "4111 1111 1111 1112")).toBe("El número de tarjeta no es válido.");
    expect(validarCampo("tarjeta", "1234")).toBe("El número de tarjeta no es válido.");
  });

  it("vencimiento: formato MM/AA y fecha no vencida", () => {
    const hoy = new Date(2026, 9, 22); // octubre de 2026
    expect(validarCampo("vence", "1226", hoy)).toBe("Usa el formato MM/AA.");
    expect(validarCampo("vence", "13/30", hoy)).toBe("Usa el formato MM/AA.");
    expect(validarCampo("vence", "09/26", hoy)).toBe("La tarjeta está vencida.");
    expect(validarCampo("vence", "10/25", hoy)).toBe("La tarjeta está vencida.");
    expect(validarCampo("vence", "10/26", hoy)).toBe(""); // vence este mes: aún sirve
    expect(validarCampo("vence", "01/30", hoy)).toBe("");
  });

  it("CVV: 3 o 4 dígitos", () => {
    expect(validarCampo("cvv", "123")).toBe("");
    expect(validarCampo("cvv", "1234")).toBe("");
    expect(validarCampo("cvv", "12")).toBe("El CVV debe tener 3 o 4 dígitos.");
  });

  it("ignora los espacios al inicio y al final", () => {
    expect(validarCampo("comuna", "  Valparaíso  ")).toBe("");
  });
});

describe("camposActivos", () => {
  it("retiro + tarjeta valida contacto y datos de tarjeta", () => {
    expect(camposActivos("retiro", "tarjeta")).toEqual([
      "nombre", "correo", "telefono", "tarjeta", "titular", "vence", "cvv",
    ]);
  });

  it("despacho agrega dirección y comuna; transferencia no pide tarjeta", () => {
    expect(camposActivos("despacho", "transferencia")).toEqual([
      "nombre", "correo", "telefono", "direccion", "comuna",
    ]);
  });
});

describe("formateadores (mientras se escribe)", () => {
  it("teléfono: solo dígitos, máximo 9", () => {
    expect(formateadores.telefono("91a2b3-45678999")).toBe("912345678");
  });

  it("tarjeta: agrupa de a 4 dígitos, máximo 16", () => {
    expect(formateadores.tarjeta("41111111111111119999")).toBe("4111 1111 1111 1111");
    expect(formateadores.tarjeta("4111")).toBe("4111");
  });

  it("vencimiento: inserta la barra después del mes", () => {
    expect(formateadores.vence("1230")).toBe("12/30");
    expect(formateadores.vence("12")).toBe("12");
  });

  it("CVV: solo dígitos, máximo 4", () => {
    expect(formateadores.cvv("12a345")).toBe("1234");
  });
});
