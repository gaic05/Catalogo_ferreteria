/* pago.js: dibuja y valida pago.html */
(function () {
    "use strict";

    const $ = function (id) { return document.getElementById(id); };
    const form = $("formPago");
    const botonPagar = $("botonPagar");
    let procesando = false;

    const METODOS = {
        tarjeta: "Tarjeta de crédito o débito",
        transferencia: "Transferencia bancaria",
        tienda: "Pago en tienda al retirar"
    };

    function el(etiqueta, clase, texto) {
        const e = document.createElement(etiqueta);
        if (clase) { e.className = clase; }
        if (texto !== undefined) { e.textContent = texto; }
        return e;
    }

    function esDespacho() { return $("entregaDespacho").checked; }
    function metodo() { return form.querySelector('input[name="metodo"]:checked').value; }

    /* ---------- Validaciones ---------- */

    function luhn(numero) {
        let suma = 0;
        let alterna = false;
        for (let i = numero.length - 1; i >= 0; i--) {
            let n = parseInt(numero.charAt(i), 10);
            if (alterna) {
                n *= 2;
                if (n > 9) { n -= 9; }
            }
            suma += n;
            alterna = !alterna;
        }
        return suma % 10 === 0;
    }

    const regexNombre = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'.-]+$/;

    const reglas = {
        pNombre: function (v) {
            if (v.length < 3) { return "Ingresa tu nombre completo."; }
            return regexNombre.test(v) ? "" : "El nombre solo puede contener letras.";
        },
        pCorreo: function (v) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ? "" : "Ingresa un correo válido.";
        },
        pTelefono: function (v) {
            return /^\d{9}$/.test(v) ? "" : "El teléfono debe tener 9 dígitos.";
        },
        pDireccion: function (v) {
            return v.length >= 5 ? "" : "Ingresa la dirección de despacho.";
        },
        pComuna: function (v) {
            return v.length >= 3 ? "" : "Ingresa la comuna.";
        },
        pTarjeta: function (v) {
            const digitos = v.replace(/\s/g, "");
            return /^\d{13,19}$/.test(digitos) && luhn(digitos) ? "" : "El número de tarjeta no es válido.";
        },
        pTitular: function (v) {
            if (v.length < 3 || !regexNombre.test(v)) { return "Ingresa el nombre como aparece en la tarjeta."; }
            return "";
        },
        pVence: function (v) {
            const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
            if (!m) { return "Usa el formato MM/AA."; }
            const hoy = new Date();
            const mes = parseInt(m[1], 10);
            const anio = 2000 + parseInt(m[2], 10);
            if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
                return "La tarjeta está vencida.";
            }
            return "";
        },
        pCvv: function (v) {
            return /^\d{3,4}$/.test(v) ? "" : "El CVV debe tener 3 o 4 dígitos.";
        }
    };

    function mensajeError(id) {
        return document.querySelector('[data-error-for="' + id + '"]');
    }

    function validarCampo(id) {
        const input = $(id);
        const mensaje = reglas[id](input.value.trim());
        const span = mensajeError(id);
        if (mensaje) {
            input.classList.add("error");
            input.classList.remove("valido");
            span.textContent = mensaje;
            return false;
        }
        input.classList.remove("error");
        input.classList.add("valido");
        span.textContent = "";
        return true;
    }

    function camposActivos() {
        let ids = ["pNombre", "pCorreo", "pTelefono"];
        if (esDespacho()) { ids = ids.concat(["pDireccion", "pComuna"]); }
        if (metodo() === "tarjeta") { ids = ids.concat(["pTarjeta", "pTitular", "pVence", "pCvv"]); }
        return ids;
    }

    /* ---------- Formato mientras se escribe ---------- */

    function soloDigitos(texto) { return texto.replace(/\D/g, ""); }

    $("pTelefono").addEventListener("input", function (e) {
        e.target.value = soloDigitos(e.target.value).slice(0, 9);
    });
    $("pTarjeta").addEventListener("input", function (e) {
        e.target.value = soloDigitos(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    });
    $("pVence").addEventListener("input", function (e) {
        const d = soloDigitos(e.target.value).slice(0, 4);
        e.target.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });
    $("pCvv").addEventListener("input", function (e) {
        e.target.value = soloDigitos(e.target.value).slice(0, 4);
    });

    // Valida al salir del campo y, si ya tenía error, corrige en vivo
    Object.keys(reglas).forEach(function (id) {
        const input = $(id);
        input.addEventListener("blur", function () {
            if (input.value.trim() !== "") { validarCampo(id); }
        });
        input.addEventListener("input", function () {
            if (input.classList.contains("error")) { validarCampo(id); }
        });
    });

    /* ---------- Resumen y vista según opciones ---------- */

    function fila(etiqueta, valor, clase) {
        const f = el("div", "resumen-fila" + (clase ? " " + clase : ""));
        f.appendChild(el("span", "", etiqueta));
        f.appendChild(el("span", "", valor));
        return f;
    }

    function pintarResumen() {
        const t = totalesCarrito(esDespacho());
        const resumen = $("resumenPago");
        resumen.textContent = "";
        resumen.appendChild(el("h2", "", "Tu pedido"));

        const lista = el("ul", "resumen-lineas");
        t.lineas.forEach(function (l) {
            const li = el("li", "resumen-linea");
            li.appendChild(el("span", "", l.cantidad + " × " + l.producto.nombre));
            li.appendChild(el("span", "", formatearPrecio(l.subtotal)));
            lista.appendChild(li);
        });
        resumen.appendChild(lista);

        resumen.appendChild(fila("Subtotal", formatearPrecio(t.subtotal)));
        resumen.appendChild(fila("Despacho", esDespacho() ? formatearPrecio(t.despacho) : "Gratis (retiro en tienda)"));
        resumen.appendChild(fila("Total (IVA incluido)", formatearPrecio(t.total), "total"));

        const editar = el("a", "boton-texto enlace-editar", "Modificar carrito");
        editar.href = "carrito.html";
        resumen.appendChild(editar);

        if (!procesando) {
            botonPagar.textContent = metodo() === "tarjeta"
                ? "Pagar " + formatearPrecio(t.total)
                : "Confirmar pedido por " + formatearPrecio(t.total);
        }
    }

    function actualizarVista() {
        const despacho = esDespacho();
        $("datosDespacho").hidden = !despacho;

        // El pago en tienda solo tiene sentido si el cliente retira
        const tienda = $("metodoTienda");
        tienda.disabled = despacho;
        $("opcionTienda").classList.toggle("deshabilitada", despacho);
        if (despacho && tienda.checked) { $("metodoTarjeta").checked = true; }

        const m = metodo();
        $("panelTarjeta").hidden = m !== "tarjeta";
        $("panelTransferencia").hidden = m !== "transferencia";
        $("panelTienda").hidden = m !== "tienda";
        pintarResumen();
    }

    form.querySelectorAll('input[name="entrega"], input[name="metodo"]').forEach(function (r) {
        r.addEventListener("change", actualizarVista);
    });

    /* ---------- Envío del formulario ---------- */

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (procesando) { return; }

        let primerInvalido = null;
        camposActivos().forEach(function (id) {
            if (!validarCampo(id) && !primerInvalido) { primerInvalido = $(id); }
        });
        if (primerInvalido) {
            primerInvalido.focus();
            return;
        }

        const t = totalesCarrito(esDespacho());
        if (t.lineas.length === 0) {
            mostrarVacio();
            return;
        }

        procesando = true;
        botonPagar.disabled = true;
        botonPagar.textContent = "Procesando…";

        // AQUÍ se conectaría la pasarela de pago real (Webpay, Flow, Mercado Pago, etc.).
        // Por ahora se simula una respuesta aprobada después de 1,5 segundos.
        setTimeout(function () { finalizarPedido(t); }, 1500);
    });

    function finalizarPedido(t) {
        const m = metodo();
        const tarjeta = $("pTarjeta").value.replace(/\s/g, "");

        const pedido = {
            numero: "PED-" + Date.now().toString(36).toUpperCase().slice(-6),
            fecha: new Date().toLocaleString("es-CL"),
            cliente: {
                nombre: $("pNombre").value.trim(),
                correo: $("pCorreo").value.trim(),
                telefono: $("pTelefono").value.trim()
            },
            entrega: esDespacho()
                ? "Despacho a domicilio: " + $("pDireccion").value.trim() + ", " + $("pComuna").value.trim()
                : "Retiro en tienda",
            metodo: m,
            // Nunca se guardan el número completo ni el CVV de la tarjeta
            detallePago: m === "tarjeta" ? "Tarjeta terminada en " + tarjeta.slice(-4) : "",
            lineas: t.lineas.map(function (l) {
                return { codigo: l.producto.codigo, nombre: l.producto.nombre, cantidad: l.cantidad, subtotal: l.subtotal };
            }),
            subtotal: t.subtotal,
            despacho: t.despacho,
            total: t.total
        };

        try {
            window.localStorage.setItem("ferreteriaUltimoPedido", JSON.stringify(pedido));
        } catch (err) {
            // Si no se puede guardar, el pedido igual se muestra en pantalla
        }

        vaciarCarrito();
        mostrarConfirmacion(pedido);
    }

    /* ---------- Pantallas finales ---------- */

    function mostrarVacio() {
        $("pagoContenido").hidden = true;
        $("pagoConfirmacion").hidden = true;
        $("pagoVacio").hidden = false;
    }

    function mostrarConfirmacion(p) {
        $("pagoContenido").hidden = true;
        $("pagoVacio").hidden = true;

        const c = $("pagoConfirmacion");
        c.textContent = "";
        c.hidden = false;

        c.appendChild(el("h2", "", p.metodo === "tarjeta" ? "¡Pago realizado con éxito!" : "¡Pedido recibido!"));
        c.appendChild(el("p", "confirmacion-numero", "Pedido N° " + p.numero));

        let mensaje;
        if (p.metodo === "tarjeta") {
            mensaje = "Tu pago fue aprobado. Enviaremos el comprobante a " + p.cliente.correo + ".";
        } else if (p.metodo === "transferencia") {
            mensaje = "Transfiere " + formatearPrecio(p.total) + " con los datos indicados y envía el comprobante. " +
                "Prepararemos tu pedido cuando confirmemos el pago.";
        } else {
            mensaje = "Pagarás " + formatearPrecio(p.total) + " al retirar tu pedido en la tienda.";
        }
        c.appendChild(el("p", "", mensaje));

        const datos = el("div", "confirmacion-datos");
        datos.appendChild(fila("Cliente", p.cliente.nombre));
        datos.appendChild(fila("Entrega", p.entrega));
        datos.appendChild(fila("Método de pago", METODOS[p.metodo] + (p.detallePago ? " (" + p.detallePago + ")" : "")));
        datos.appendChild(fila("Fecha", p.fecha));
        c.appendChild(datos);

        const lista = el("ul", "resumen-lineas");
        p.lineas.forEach(function (l) {
            const li = el("li", "resumen-linea");
            li.appendChild(el("span", "", l.cantidad + " × " + l.nombre));
            li.appendChild(el("span", "", formatearPrecio(l.subtotal)));
            lista.appendChild(li);
        });
        c.appendChild(lista);

        c.appendChild(fila("Despacho", p.despacho > 0 ? formatearPrecio(p.despacho) : "Gratis", ""));
        c.appendChild(fila("Total pagado", formatearPrecio(p.total), "total"));

        const volver = el("a", "boton-principal", "Volver al catálogo");
        volver.href = "catalogo.html";
        c.appendChild(volver);

        window.scrollTo(0, 0);
        c.setAttribute("tabindex", "-1");
        c.focus();
    }

    /* ---------- Inicio ---------- */

    sanearCarrito();
    if (totalesCarrito(false).lineas.length === 0) {
        mostrarVacio();
    } else {
        actualizarVista();
    }
})();
