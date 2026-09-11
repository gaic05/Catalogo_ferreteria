/* ==========================================================
   carrito.js
   Lógica compartida del carrito. Se carga en todas las páginas
   que muestran el contador del carrito en el encabezado.
   El carrito se guarda en localStorage solo con { codigo, cantidad }.
   Los precios y el stock siempre se leen desde productos.js.
   ========================================================== */

const CLAVE_CARRITO = "ferreteriaCarrito";
const COSTO_DESPACHO = 4990; // Cambia este valor si el despacho cuesta otra cantidad

function formatearPrecio(valor) {
    return "$" + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/* ---------- Lectura y escritura ---------- */

function leerCarrito() {
    try {
        const datos = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO));
        if (!Array.isArray(datos)) { return []; }
        return datos.filter(function (i) {
            return i && typeof i.codigo === "string" && Number.isInteger(i.cantidad) && i.cantidad > 0;
        });
    } catch (e) {
        return [];
    }
}

function guardarCarrito(items) {
    try {
        window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
    } catch (e) {
        // Si el navegador bloquea localStorage el carrito no se podrá guardar
    }
    actualizarContadorCarrito();
}

function cantidadTotalCarrito() {
    return leerCarrito().reduce(function (total, i) { return total + i.cantidad; }, 0);
}

function actualizarContadorCarrito() {
    const el = document.getElementById("contadorCarrito");
    if (!el) { return; }
    const n = cantidadTotalCarrito();
    el.textContent = n;
    el.hidden = n === 0;
}

/* ---------- Operaciones ---------- */

function buscarProducto(codigo) {
    if (typeof PRODUCTOS === "undefined") { return undefined; }
    return PRODUCTOS.find(function (p) { return p.codigo === codigo; });
}

function agregarAlCarrito(codigo, cantidad) {
    cantidad = cantidad || 1;
    const producto = buscarProducto(codigo);
    if (!producto) {
        return { ok: false, mensaje: "El producto no existe." };
    }
    if (producto.stock <= 0) {
        return { ok: false, mensaje: "Este producto no tiene stock." };
    }

    const items = leerCarrito();
    const item = items.find(function (i) { return i.codigo === codigo; });
    const actual = item ? item.cantidad : 0;
    const nueva = Math.min(actual + cantidad, producto.stock);

    if (nueva === actual) {
        return { ok: false, mensaje: "Ya tienes en el carrito todo el stock disponible de este producto." };
    }
    if (item) {
        item.cantidad = nueva;
    } else {
        items.push({ codigo: codigo, cantidad: nueva });
    }
    guardarCarrito(items);
    return { ok: true, mensaje: "Agregado al carrito: " + producto.nombre };
}

function cambiarCantidad(codigo, cantidad) {
    const items = leerCarrito();
    const item = items.find(function (i) { return i.codigo === codigo; });
    if (!item) { return; }
    const producto = buscarProducto(codigo);
    const maximo = producto ? producto.stock : cantidad;
    item.cantidad = Math.max(1, Math.min(cantidad, maximo));
    guardarCarrito(items);
}

function quitarDelCarrito(codigo) {
    guardarCarrito(leerCarrito().filter(function (i) { return i.codigo !== codigo; }));
}

function vaciarCarrito() {
    guardarCarrito([]);
}

/* ---------- Detalle y totales ---------- */

// Une el carrito con los datos reales del producto (precio y stock actuales)
function detalleCarrito() {
    const lineas = [];
    leerCarrito().forEach(function (i) {
        const p = buscarProducto(i.codigo);
        if (!p || p.stock <= 0) { return; }
        const cantidad = Math.min(i.cantidad, p.stock);
        lineas.push({ producto: p, cantidad: cantidad, subtotal: p.precioVenta * cantidad });
    });
    return lineas;
}

// Elimina del carrito productos que ya no existen o se quedaron sin stock
function sanearCarrito() {
    guardarCarrito(detalleCarrito().map(function (l) {
        return { codigo: l.producto.codigo, cantidad: l.cantidad };
    }));
}

function totalesCarrito(conDespacho) {
    const lineas = detalleCarrito();
    const unidades = lineas.reduce(function (t, l) { return t + l.cantidad; }, 0);
    const subtotal = lineas.reduce(function (t, l) { return t + l.subtotal; }, 0);
    const despacho = conDespacho && lineas.length > 0 ? COSTO_DESPACHO : 0;
    return { lineas: lineas, unidades: unidades, subtotal: subtotal, despacho: despacho, total: subtotal + despacho };
}

/* ---------- Aviso flotante ---------- */

function mostrarAviso(texto, ok) {
    let el = document.getElementById("avisoCarrito");
    if (!el) {
        el = document.createElement("div");
        el.id = "avisoCarrito";
        el.className = "aviso-carrito";
        el.setAttribute("role", "status");
        el.setAttribute("aria-live", "polite");
        document.body.appendChild(el);
    }
    el.textContent = texto;
    el.classList.toggle("error", ok === false);
    el.classList.add("visible");
    clearTimeout(mostrarAviso.temporizador);
    mostrarAviso.temporizador = setTimeout(function () {
        el.classList.remove("visible");
    }, 2500);
}

/* ---------- Inicio ---------- */

actualizarContadorCarrito();
window.addEventListener("storage", actualizarContadorCarrito); // sincroniza entre pestañas
