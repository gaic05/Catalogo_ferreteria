/* carrito-pagina.js: dibuja carrito.html */
(function () {
    "use strict";

    const contenedor = document.getElementById("contenidoCarrito");

    function el(etiqueta, clase, texto) {
        const e = document.createElement(etiqueta);
        if (clase) { e.className = clase; }
        if (texto !== undefined) { e.textContent = texto; }
        return e;
    }

    function boton(texto, clase, etiquetaAria, alClick) {
        const b = el("button", clase, texto);
        b.type = "button";
        if (etiquetaAria) { b.setAttribute("aria-label", etiquetaAria); }
        b.addEventListener("click", alClick);
        return b;
    }

    function crearControlCantidad(linea) {
        const p = linea.producto;
        const caja = el("div", "cantidad-control");

        const menos = boton("−", "boton-cantidad", "Disminuir cantidad de " + p.nombre, function () {
            cambiarCantidad(p.codigo, linea.cantidad - 1);
            pintar();
        });
        menos.disabled = linea.cantidad <= 1;

        const entrada = document.createElement("input");
        entrada.type = "text";
        entrada.inputMode = "numeric";
        entrada.value = linea.cantidad;
        entrada.setAttribute("aria-label", "Cantidad de " + p.nombre);
        entrada.addEventListener("change", function () {
            let n = parseInt(entrada.value, 10);
            if (isNaN(n) || n < 1) { n = 1; }
            if (n > p.stock) {
                n = p.stock;
                mostrarAviso("Stock máximo disponible: " + p.stock + " unidades.", false);
            }
            cambiarCantidad(p.codigo, n);
            pintar();
        });

        const mas = boton("+", "boton-cantidad", "Aumentar cantidad de " + p.nombre, function () {
            cambiarCantidad(p.codigo, linea.cantidad + 1);
            pintar();
        });
        mas.disabled = linea.cantidad >= p.stock;

        caja.appendChild(menos);
        caja.appendChild(entrada);
        caja.appendChild(mas);
        return caja;
    }

    function crearLinea(linea) {
        const p = linea.producto;
        const item = el("article", "carrito-item");

        const info = el("div", "carrito-item-info");
        info.appendChild(el("span", "producto-codigo", "Cód. " + p.codigo));
        info.appendChild(el("h3", "carrito-item-nombre", p.nombre));
        info.appendChild(el("p", "producto-detalle", p.subcategoria + " · Marca: " + p.marca));
        info.appendChild(el("p", "producto-detalle", formatearPrecio(p.precioVenta) + " / " + p.unidad));
        info.appendChild(boton("Quitar del carrito", "boton-texto", "Quitar " + p.nombre + " del carrito", function () {
            quitarDelCarrito(p.codigo);
            pintar();
        }));

        const columnaCantidad = el("div", "carrito-item-cantidad");
        columnaCantidad.appendChild(crearControlCantidad(linea));
        columnaCantidad.appendChild(el("small", "stock-nota", "Disponibles: " + p.stock));

        const subtotal = el("div", "carrito-item-subtotal", formatearPrecio(linea.subtotal));

        item.appendChild(info);
        item.appendChild(columnaCantidad);
        item.appendChild(subtotal);
        return item;
    }

    function fila(etiqueta, valor, clase) {
        const f = el("div", "resumen-fila" + (clase ? " " + clase : ""));
        f.appendChild(el("span", "", etiqueta));
        f.appendChild(el("span", "", valor));
        return f;
    }

    function crearResumen(t) {
        const resumen = el("aside", "carrito-resumen");
        resumen.setAttribute("aria-label", "Resumen del pedido");
        resumen.appendChild(el("h2", "", "Resumen del pedido"));
        resumen.appendChild(fila(
            t.unidades === 1 ? "1 producto" : t.unidades + " productos",
            formatearPrecio(t.subtotal)
        ));
        resumen.appendChild(el("p", "nota-resumen", "El costo de despacho se calcula en el siguiente paso."));
        resumen.appendChild(fila("Total (IVA incluido)", formatearPrecio(t.subtotal), "total"));

        const pagar = el("a", "boton-principal", "Ir a pagar");
        pagar.href = "pago.html";
        resumen.appendChild(pagar);

        const seguir = el("a", "boton-secundario", "Seguir comprando");
        seguir.href = "catalogo.html";
        resumen.appendChild(seguir);

        resumen.appendChild(boton("Vaciar carrito", "boton-texto", "", function () {
            if (window.confirm("¿Quieres quitar todos los productos del carrito?")) {
                vaciarCarrito();
                pintar();
            }
        }));
        return resumen;
    }

    function crearVacio() {
        const vacio = el("div", "carrito-vacio");
        vacio.appendChild(el("h2", "", "Tu carrito está vacío"));
        vacio.appendChild(el("p", "", "Agrega productos desde el catálogo para armar tu pedido."));
        const enlace = el("a", "boton-principal", "Ver catálogo");
        enlace.href = "catalogo.html";
        vacio.appendChild(enlace);
        return vacio;
    }

    function pintar() {
        sanearCarrito();
        const t = totalesCarrito(false);
        contenedor.textContent = "";

        if (t.lineas.length === 0) {
            contenedor.appendChild(crearVacio());
            return;
        }

        const layout = el("div", "carrito-layout");
        const lista = el("section", "carrito-lista");
        lista.setAttribute("aria-label", "Productos en el carrito");
        t.lineas.forEach(function (l) { lista.appendChild(crearLinea(l)); });

        layout.appendChild(lista);
        layout.appendChild(crearResumen(t));
        contenedor.appendChild(layout);
    }

    pintar();
})();
