
function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function estadoStock(producto) {
    if (producto.stock <= 0) {
        return { clase: "agotado", texto: "Agotado" };
    }
    if (producto.stock <= producto.stockMinimo) {
        return { clase: "bajo", texto: "Stock bajo" };
    }
    return { clase: "disponible", texto: "Disponible" };
}


function filtrarProductos(lista, filtros) {
    const texto = normalizar(filtros.texto || "");
    const categoria = filtros.categoria || "";
    const subcategoria = filtros.subcategoria || "";
    const soloDisponibles = Boolean(filtros.soloDisponibles);

    return lista.filter(function (p) {
        if (categoria !== "" && p.categoria !== categoria) {
            return false;
        }
        if (subcategoria !== "" && p.subcategoria !== subcategoria) {
            return false;
        }
        if (soloDisponibles && p.stock <= 0) {
            return false;
        }
        if (texto !== "") {
            const contenido = normalizar(
                [p.nombre, p.marca, p.codigo, p.subcategoria, p.categoria].join(" ")
            );
            if (!contenido.includes(texto)) {
                return false;
            }
        }
        return true;
    });
}

function ordenarProductos(lista, criterio) {
    const copia = lista.slice(); 
    const porNombre = function (a, b) {
        return a.nombre.localeCompare(b.nombre, "es");
    };

    switch (criterio) {
        case "nombre-desc":
            copia.sort(function (a, b) { return porNombre(b, a); });
            break;
        case "precio-asc":
            copia.sort(function (a, b) { return a.precioVenta - b.precioVenta || porNombre(a, b); });
            break;
        case "precio-desc":
            copia.sort(function (a, b) { return b.precioVenta - a.precioVenta || porNombre(a, b); });
            break;
        default:
            copia.sort(porNombre);
    }
    return copia;
}


function crearElemento(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) { el.className = clase; }
    if (texto !== undefined) { el.textContent = texto; }
    return el;
}

function crearBloqueImagen(producto) {
    const contenedor = crearElemento("div", "producto-imagen");

    function mostrarPlaceholder() {
        contenedor.textContent = "";
        contenedor.classList.add("sin-imagen");
        contenedor.appendChild(crearElemento("span", "", "Imagen referencial"));
    }

    if (producto.imagen) {
        const img = document.createElement("img");
        img.src = producto.imagen;
        img.alt = producto.nombre;
        img.loading = "lazy";
        img.addEventListener("error", mostrarPlaceholder); 
        contenedor.appendChild(img);
    } else {
        mostrarPlaceholder();
    }
    return contenedor;
}

function crearTarjeta(producto) {
    const estado = estadoStock(producto);
    const tarjeta = crearElemento("article", "producto" + (estado.clase === "agotado" ? " agotado" : ""));
    tarjeta.dataset.codigo = producto.codigo;

    const info = crearElemento("div", "producto-info");
    info.appendChild(crearElemento("span", "producto-codigo", "Cód. " + producto.codigo));
    info.appendChild(crearElemento("span", "producto-categoria", producto.categoria));
    info.appendChild(crearElemento("h3", "producto-nombre", producto.nombre));
    info.appendChild(crearElemento(
        "p", "producto-detalle",
        producto.subcategoria + " · Marca: " + producto.marca
    ));

    const pie = crearElemento("div", "producto-pie");
    const precio = crearElemento("span", "producto-precio", formatearPrecio(producto.precioVenta));
    precio.appendChild(crearElemento("small", "", " / " + producto.unidad));
    pie.appendChild(precio);
    pie.appendChild(crearElemento("span", "estado-stock " + estado.clase, estado.texto));
    info.appendChild(pie);

    const agotado = estado.clase === "agotado";
    const botonAgregar = crearElemento("button", "boton-agregar", agotado ? "Sin stock" : "Agregar al carrito");
    botonAgregar.type = "button";
    botonAgregar.disabled = agotado;
    botonAgregar.addEventListener("click", function () {
        const resultado = agregarAlCarrito(producto.codigo, 1);
        mostrarAviso(resultado.mensaje, resultado.ok);
    });
    info.appendChild(botonAgregar);

    tarjeta.appendChild(crearBloqueImagen(producto));
    tarjeta.appendChild(info);
    return tarjeta;
}


function iniciarCatalogo() {
    const buscador = document.getElementById("buscador");
    const selectOrden = document.getElementById("ordenar");
    const checkDisponibles = document.getElementById("soloDisponibles");
    const botonLimpiar = document.getElementById("limpiarFiltros");
    const lista = document.getElementById("listaProductos");
    const contador = document.getElementById("contador");
    const sinResultados = document.getElementById("sinResultados");
    const contCategorias = document.getElementById("botonesCategorias");
    const bloqueSub = document.getElementById("subcategorias");
    const tituloSub = document.getElementById("tituloSubcategorias");
    const contSub = document.getElementById("botonesSubcategorias");

    const seleccion = { categoria: "", subcategoria: "" };

    function unicos(arreglo) {
        return arreglo.filter(function (v, i) { return arreglo.indexOf(v) === i; });
    }
    const categorias = unicos(PRODUCTOS.map(function (p) { return p.categoria; }));

    function crearChip(texto, cantidad, activo, alClick) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (activo ? " activo" : "");
        b.setAttribute("aria-pressed", activo ? "true" : "false");
        b.appendChild(document.createTextNode(texto));
        b.appendChild(crearElemento("span", "cantidad", "(" + cantidad + ")"));
        b.addEventListener("click", alClick);
        return b;
    }

    function pintarCategorias() {
        contCategorias.textContent = "";
        contCategorias.appendChild(crearChip("Todas", PRODUCTOS.length, seleccion.categoria === "", function () {
            elegirCategoria("");
        }));
        categorias.forEach(function (c) {
            const cantidad = PRODUCTOS.filter(function (p) { return p.categoria === c; }).length;
            contCategorias.appendChild(crearChip(c, cantidad, seleccion.categoria === c, function () {
                elegirCategoria(c);
            }));
        });
    }

    function pintarSubcategorias() {
        contSub.textContent = "";
        if (seleccion.categoria === "") {
            bloqueSub.hidden = true;
            return;
        }
        const deCategoria = PRODUCTOS.filter(function (p) { return p.categoria === seleccion.categoria; });
        const subs = unicos(deCategoria.map(function (p) { return p.subcategoria; }));

        tituloSub.textContent = seleccion.categoria + ": tipo de producto";
        contSub.appendChild(crearChip("Todos", deCategoria.length, seleccion.subcategoria === "", function () {
            elegirSubcategoria("");
        }));
        subs.forEach(function (sc) {
            const cantidad = deCategoria.filter(function (p) { return p.subcategoria === sc; }).length;
            contSub.appendChild(crearChip(sc, cantidad, seleccion.subcategoria === sc, function () {
                elegirSubcategoria(sc);
            }));
        });
        bloqueSub.hidden = false;
    }

    function elegirCategoria(c) {
        seleccion.categoria = c;
        seleccion.subcategoria = ""; 
        actualizar();
    }

    function elegirSubcategoria(sc) {
        seleccion.subcategoria = sc;
        actualizar();
    }

    function guardarEnUrl() {
        try {
            const params = new URLSearchParams();
            if (seleccion.categoria) { params.set("categoria", seleccion.categoria); }
            if (seleccion.subcategoria) { params.set("subcategoria", seleccion.subcategoria); }
            const consulta = params.toString();
            window.history.replaceState(null, "", window.location.pathname + (consulta ? "?" + consulta : ""));
        } catch (e) {
        }
    }

    function leerDeUrl() {
        const params = new URLSearchParams(window.location.search);
        const c = params.get("categoria") || "";
        const sc = params.get("subcategoria") || "";
        if (categorias.indexOf(c) !== -1) {
            seleccion.categoria = c;
            const valida = PRODUCTOS.some(function (p) { return p.categoria === c && p.subcategoria === sc; });
            seleccion.subcategoria = valida ? sc : "";
        }
    }

    function actualizar() {
        pintarCategorias();
        pintarSubcategorias();

        const filtrados = filtrarProductos(PRODUCTOS, {
            texto: buscador.value,
            categoria: seleccion.categoria,
            subcategoria: seleccion.subcategoria,
            soloDisponibles: checkDisponibles.checked
        });
        const ordenados = ordenarProductos(filtrados, selectOrden.value);

        lista.textContent = "";
        ordenados.forEach(function (p) { lista.appendChild(crearTarjeta(p)); });

        contador.textContent = ordenados.length === 1
            ? "Mostrando 1 producto"
            : "Mostrando " + ordenados.length + " productos";
        sinResultados.hidden = ordenados.length !== 0;
        guardarEnUrl();
    }

    buscador.addEventListener("input", actualizar);
    selectOrden.addEventListener("change", actualizar);
    checkDisponibles.addEventListener("change", actualizar);
    botonLimpiar.addEventListener("click", function () {
        buscador.value = "";
        seleccion.categoria = "";
        seleccion.subcategoria = "";
        selectOrden.value = "nombre-asc";
        checkDisponibles.checked = false;
        actualizar();
    });

    leerDeUrl();
    actualizar();
}

if (typeof document !== "undefined" && document.getElementById("listaProductos")) {
    iniciarCatalogo();
}
