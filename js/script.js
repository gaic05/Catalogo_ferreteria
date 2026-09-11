const form = document.getElementById('formRegistro');
const nombre = document.getElementById('nombre');
const correo = document.getElementById('correo');
const telefono = document.getElementById('telefono');
const aceptar = document.getElementById('aceptar');

const errorAceptar = document.getElementById('errorAceptar');
const errorNombre = document.getElementById('errorNombre');
const errorCorreo = document.getElementById('errorCorreo');
const errorTelefono = document.getElementById('errorTelefono');
const mensajeExito = document.getElementById('mensajeExito');

const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexTelefono = /^[0-9]{9}$/;

function validarNombre() {
    const valor = nombre.value.trim();
    if (valor === ''){
        nombre.classList.add('error');
        errorNombre.textContent = 'El nombre no puede estar vacio.';
        return false;
    }
    if (/\d/.test(valor)) {
    nombre.classList.add('error');
    errorNombre.textContent = 'El nombre no puede contener numeros.';
    return false;
    }
    nombre.classList.remove('error');
    nombre.classList.add('valido');
    errorNombre.textContent = '';
    return true;
}
function validarCorreo(){
    const valor = correo.value.trim();
    if( valor === ''){
        correo.classList.add('error');
        errorCorreo.textContent = 'El correo no puede estar vacio.';
        return false;
    }
    if (!regexCorreo.test(valor)){
        correo.classList.add('error');
        errorCorreo.textContent = 'Formato de correo invalido.';
        return false;
    }
    correo.classList.remove('error');
    correo.classList.add('valido');
    errorCorreo.textContent = '';
    return true;
}
function validarTelefono(){
    const valor = telefono.value.trim();
    if (valor === ''){
        telefono.classList.add('error');
        errorTelefono.textContent = 'El telefono no puede estar vacio.';
        return false;
    }
    if (!/^\d+$/.test(valor)) {
        telefono.classList.add('error');
        errorTelefono.textContent = 'El telefono solo puede contener numeros.';
        return false;
    }
    if (!regexTelefono.test(valor)) {
        telefono.classList.add('error');
        errorTelefono.textContent = 'El telefono debe tener 9 digitos.';
        return false;
  }
  telefono.classList.remove('error');
  telefono.classList.add('valido');
  errorTelefono.textContent = '';
  return true;
}
function validarAceptar(){
    if (!aceptar.checked) {
    errorAceptar.textContent = 'Debes aceptar los terminos y condiciones.';
    return false;
  }
  errorAceptar.textContent = '';
  return true;
}
nombre.addEventListener('input', validarNombre);
correo.addEventListener('input', validarCorreo);
telefono.addEventListener('input', validarTelefono);
aceptar.addEventListener('change', validarAceptar);
form.addEventListener('submit', function(e){
    e.preventDefault();
    const ok1 = validarNombre();
    const ok2 = validarCorreo();
    const ok3 = validarTelefono();
    const ok4 = validarAceptar();
    if (ok1 && ok2 && ok3 && ok4){
        mensajeExito.style.display = 'block';
        form.reset();
        [nombre, correo, telefono].forEach(input => input.classList.remove('valido'));
    } else {
        mensajeExito.style.display = 'none';
    }
});