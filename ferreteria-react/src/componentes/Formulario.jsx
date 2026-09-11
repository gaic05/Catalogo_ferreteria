import { useState } from "react";


const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;
const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGEX_TELEFONO = /^[0-9]{9}$/;

const VALIDADORES = {
  nombre: (v) => {
    const valor = v.trim();
    if (valor === "") return "El nombre no puede estar vacío.";
    if (!REGEX_NOMBRE.test(valor)) return "El nombre solo puede contener letras.";
    return "";
  },
  apellidos: (v) => {
    const valor = v.trim();
    if (valor === "") return "Los apellidos no pueden estar vacíos.";
    if (!REGEX_NOMBRE.test(valor)) return "Los apellidos solo pueden contener letras.";
    return "";
  },
  correo: (v) => {
    const valor = v.trim();
    if (valor === "") return "El correo no puede estar vacío.";
    if (!REGEX_CORREO.test(valor)) return "Formato de correo inválido.";
    return "";
  },
  telefono: (v) => {
    const valor = v.trim();
    if (valor === "") return "El teléfono no puede estar vacío.";
    if (!/^\d+$/.test(valor)) return "El teléfono solo puede contener números.";
    if (!REGEX_TELEFONO.test(valor)) return "El teléfono debe tener 9 dígitos.";
    return "";
  },
  contrasena: (v) => {
    if (v === "") return "La contraseña no puede estar vacía.";
    if (v.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    return "";
  },
  aceptar: (v) => (v ? "" : "Debes aceptar los términos y condiciones."),
};

const CAMPOS = Object.keys(VALIDADORES);

const VALORES_INICIALES = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
  contrasena: "",
  aceptar: false,
};
function Campo({ id, etiqueta, tipo = "text", placeholder, valor, error, onCambio }) {

  const clase = error ? "error" : error === "" ? "valido" : "";
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        type={tipo}
        id={id}
        placeholder={placeholder}
        value={valor}
        className={clase}
        aria-invalid={Boolean(error)}
        onChange={(e) => onCambio(id, e.target.value)}
      />
      <span className="mensaje-error">{error}</span>
    </div>
  );
}
export default function Formulario() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [exito, setExito] = useState(false);

  const handleCambio = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: VALIDADORES[campo](valor) }));
    setExito(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    CAMPOS.forEach((campo) => {
      nuevosErrores[campo] = VALIDADORES[campo](valores[campo]);
    });
    setErrores(nuevosErrores);

    const todoOk = CAMPOS.every((campo) => nuevosErrores[campo] === "");
    if (!todoOk) {
      setExito(false);
      return;
    }

    setExito(true);
    setValores(VALORES_INICIALES);
    setErrores({});
  };

  return (
    <div className="Formulario">
      <h1>Registro de Usuario</h1>

      <form id="formRegistro" onSubmit={handleSubmit} noValidate>
        <Campo
          id="nombre"
          etiqueta="Nombre"
          placeholder="Ej: Juan Carlos"
          valor={valores.nombre}
          error={errores.nombre}
          onCambio={handleCambio}
        />
        <Campo
          id="apellidos"
          etiqueta="Apellidos"
          placeholder="Ej: Muñoz Ortiz"
          valor={valores.apellidos}
          error={errores.apellidos}
          onCambio={handleCambio}
        />
        <Campo
          id="correo"
          etiqueta="Correo electronico"
          placeholder="Ej: Juan@correo.com"
          valor={valores.correo}
          error={errores.correo}
          onCambio={handleCambio}
        />
        <Campo
          id="telefono"
          etiqueta="Telefono (9 digitos)"
          placeholder="Ej: 912345678"
          valor={valores.telefono}
          error={errores.telefono}
          onCambio={handleCambio}
        />
        <Campo
          id="contrasena"
          etiqueta="Contraseña"
          tipo="password"
          placeholder="Ingresa tu contraseña"
          valor={valores.contrasena}
          error={errores.contrasena}
          onCambio={handleCambio}
        />

        <div className="campo campo-checkbox">
          <label className="label-checkbox">
            <input
              type="checkbox"
              id="aceptar"
              checked={valores.aceptar}
              onChange={(e) => handleCambio("aceptar", e.target.checked)}
            />
            Acepto los términos y condiciones
          </label>
          <span className="mensaje-error">{errores.aceptar}</span>
        </div>

        <button type="submit">Registrarse</button>

        {exito && (
          <p className="mensaje-exito" style={{ display: "block" }} role="status">
            Registro exitoso
          </p>
        )}
      </form>
    </div>
  );
}
