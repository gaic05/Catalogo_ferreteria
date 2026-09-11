const form = document.getElementById('formRegistro');

const nombre = document.getElementById('nombre');
const apellidos = document.getElementById('apellidos');
const correo = document.getElementById('correo');
const telefono = document.getElementById('telefono');
const contrasena = document.getElementById('contrasena');
const aceptar = document.getElementById('aceptar');

const errorNombre = document.getElementById('errorNombre');
const errorApellidos = document.getElementById('errorApellidos');
const errorCorreo = document.getElementById('errorCorreo');
const errorTelefono = document.getElementById('errorTelefono');
const errorContrasena = document.getElementById('errorContrasena');
const errorAceptar = document.getElementById('errorAceptar');

const mensajeExito = document.getElementById('mensajeExito');

const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexTelefono = /^[0-9]{9}$/;

function validarNombre() {

const valor = nombre.value.trim();

if (valor === '') {

    nombre.classList.add('error');
    nombre.classList.remove('valido');

    errorNombre.textContent = 'El nombre no puede estar vacío.';

    return false;
}

if (!regexNombre.test(valor)) {

    nombre.classList.add('error');
    nombre.classList.remove('valido');

    errorNombre.textContent = 'El nombre solo puede contener letras.';

    return false;
}

nombre.classList.remove('error');
nombre.classList.add('valido');

errorNombre.textContent = '';

return true;

}

function validarApellidos() {

const valor = apellidos.value.trim();

if (valor === '') {

    apellidos.classList.add('error');
    apellidos.classList.remove('valido');

    errorApellidos.textContent =
        'Los apellidos no pueden estar vacíos.';

    return false;
}

if (!regexNombre.test(valor)) {

    apellidos.classList.add('error');
    apellidos.classList.remove('valido');

    errorApellidos.textContent =
        'Los apellidos solo pueden contener letras.';

    return false;
}

apellidos.classList.remove('error');
apellidos.classList.add('valido');

errorApellidos.textContent = '';

return true;

}

function validarCorreo() {

const valor = correo.value.trim();

if (valor === '') {

    correo.classList.add('error');
    correo.classList.remove('valido');

    errorCorreo.textContent =
        'El correo no puede estar vacío.';

    return false;
}

if (!regexCorreo.test(valor)) {

    correo.classList.add('error');
    correo.classList.remove('valido');

    errorCorreo.textContent =
        'Formato de correo inválido.';

    return false;
}

correo.classList.remove('error');
correo.classList.add('valido');

errorCorreo.textContent = '';

return true;

}

function validarTelefono() {

const valor = telefono.value.trim();

if (valor === '') {

    telefono.classList.add('error');
    telefono.classList.remove('valido');

    errorTelefono.textContent =
        'El teléfono no puede estar vacío.';

    return false;
}

if (!/^\d+$/.test(valor)) {

    telefono.classList.add('error');
    telefono.classList.remove('valido');

    errorTelefono.textContent =
        'El teléfono solo puede contener números.';

    return false;
}

if (!regexTelefono.test(valor)) {

    telefono.classList.add('error');
    telefono.classList.remove('valido');

    errorTelefono.textContent =
        'El teléfono debe tener 9 dígitos.';

    return false;
}

telefono.classList.remove('error');
telefono.classList.add('valido');

errorTelefono.textContent = '';

return true;

}

function validarContrasena() {

const valor = contrasena.value;

if (valor === '') {

    contrasena.classList.add('error');
    contrasena.classList.remove('valido');

    errorContrasena.textContent =
        'La contraseña no puede estar vacía.';

    return false;
}

if (valor.length < 8) {

    contrasena.classList.add('error');
    contrasena.classList.remove('valido');

    errorContrasena.textContent =
        'La contraseña debe tener al menos 8 caracteres.';

    return false;
}

contrasena.classList.remove('error');
contrasena.classList.add('valido');

errorContrasena.textContent = '';

return true;

}

function validarAceptar() {

if (!aceptar.checked) {

    errorAceptar.textContent =
        'Debes aceptar los términos y condiciones.';

    return false;
}

errorAceptar.textContent = '';

return true;

}

nombre.addEventListener('input', validarNombre);

apellidos.addEventListener('input', validarApellidos);

correo.addEventListener('input', validarCorreo);

telefono.addEventListener('input', validarTelefono);

contrasena.addEventListener('input', validarContrasena);

aceptar.addEventListener('change', validarAceptar);


form.addEventListener('submit', function(e) {

e.preventDefault();

const ok1 = validarNombre();
const ok2 = validarApellidos();
const ok3 = validarCorreo();
const ok4 = validarTelefono();
const ok5 = validarContrasena();
const ok6 = validarAceptar();

if (ok1 && ok2 && ok3 && ok4 && ok5 && ok6) {

    mensajeExito.style.display = 'block';

    form.reset();

    [
        nombre,
        apellidos,
        correo,
        telefono,
        contrasena
    ].forEach(input => {

        input.classList.remove('valido');
        input.classList.remove('error');

    });

} else {

    mensajeExito.style.display = 'none';

}

});