const btnSesion = document.getElementById("btn-sesion");
const imgSesion = document.getElementById("img-sesion");
const btnUsuario = document.getElementById("btn-usuario");
const btnGestion = document.getElementById("btn-gestion");
const selectCategoria = document.getElementById('categoria');
const inputProductos = document.getElementById("input-productos");
const buscadorProductos = document.getElementById("buscador-productos");
const botonFavoritos = document.getElementById("btn-favoritos");
let favoritosDelUsuario = [];

let todosLosProductos = [];

document.addEventListener("DOMContentLoaded", async () => {
    actualizarIconoSesion();
    await cargarFavoritos(); 
    await cargarProductosEnPagina();
    cargarCategorias();

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    // El boton se ve solo si es admin
    esAdmin(usuario);
});

document.getElementById("btn-gestion").addEventListener("click", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("No estás logueado. Iniciá sesión primero.");
        window.location.href = "/pages/login.html";
    } else {
        window.location.href = "/pages/productos.html";
    }
});

function esAdmin(usuario) {
    if (usuario && usuario.rol === 'admin') {
        btnGestion.style.display = "block";
    } else {
        btnGestion.style.display = "none";
    }
}

function estaLogueado() {
    if (localStorage.getItem("token") !== null) {
        return true;
    } else {
        return false;
    }
}

// Cambia el icono de la puerta segun si esta logueado o no
function actualizarIconoSesion() {
    if (estaLogueado()) {
        imgSesion.src = "img/logout.png";
        imgSesion.title = "Cerrar sesión";
        imgSesion.alt = "Cerrar sesión";
    } else {
        imgSesion.src = "img/log-in.png";
        imgSesion.title = "Iniciar sesión";
        imgSesion.alt = "Iniciar sesión";
    }
}

btnSesion.addEventListener("click", () => {
    if (estaLogueado()) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        alert("Sesión cerrada");
        actualizarIconoSesion();
        window.location.href = "/index.html";
    } else {
        window.location.href = "/pages/login.html";
    }
});

btnUsuario.addEventListener("click", () => {
    if (!estaLogueado()) {
        window.location.href = "/pages/registro.html";
    } else {
        window.location.href = "/pages/datos_usuario.html";
    }
});

async function cargarProductosEnPagina() {
    try {
        const res = await fetch('http://localhost:4000/api/obtenerProductos');
        const data = await res.json();
        todosLosProductos = data.payload[0];

        mostrarProductos(todosLosProductos);
    } catch (error) {
        console.error('Error al cargar productos para la página:', error);
    }
}

function mostrarProductos(productos) {
    const contenedor = document.getElementById('productos-lista');
    contenedor.innerHTML = '';

    productos.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta');

        const estaEnFavoritos = favoritosDelUsuario.includes(prod.idProducto);

        tarjeta.innerHTML = `
            <img src="${prod.imagen || prod.ulrImagen || ""}" alt="${prod.producto
            }" class="img-producto">
            <img src="img/starVacia.png" alt="Añadir a favoritos" class="agregar-estrella" style="display: ${estaEnFavoritos ? 'none' : 'block'}">
            <img src="img/star2.png" alt="Favoritos" class="estrella-agregada" style="display: ${estaEnFavoritos ? 'block' : 'none'}">
            <div class="descripcion">
                <strong class="nombre-producto">${prod.producto}</strong><br>
                ${prod.descripcion}<br>
                <small class="precio">$${prod.precio}</small><br>
                <small class="categoria">Categoría: ${prod.categoria}</small>
            </div>
            <div class="botones">
                <button class="btn-comprar" id="btn-comprar">Comprar</button>
                <button class="btn-ver" data-id="${prod.idProducto}">Ver Producto</button>
            </div>
        `;

        //IR A DETALLE DEL PRODUCTO
        const btnVer = tarjeta.querySelector('.btn-ver');
        btnVer.addEventListener('click', () => {
            const idProducto = btnVer.getAttribute('data-id');
            window.location.href = `/pages/detalleProducto.html?id=${idProducto}`;
        });

        contenedor.appendChild(tarjeta);

        // main_favortis.js
        agregarEventosALasEstrellas(tarjeta, prod);
    });
}

async function cargarCategorias() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:4000/api/obtenerCategorias", {
            headers: { Authorization: token }
        });

        const data = await res.json();

        if (data.codigo === -1 && data.mensaje === "Token expirado") {
            alert("Tu sesión ha expirado. Iniciá sesión nuevamente.");
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "/pages/login.html";
            return;
        }

        const categorias = data.payload;

        categorias.forEach(cat => {
            selectCategoria.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
        });

    } catch {
        console.log("No estas logueado, no podes ver categorias");
    }
}

selectCategoria.addEventListener("change", (e) => {
    filtrarProductosPorCategoria(e);
});

// Función para filtrar los productos por categoría
// se obtiene el value del select que disparo el evento
// El primer select vale 0 asi que si se selecciona ese muestra todos los productos
// Se crea un array que contiene los productos que cumplen con la condicion del filter y se lo pasa por parametro a mostrarProductos
function filtrarProductosPorCategoria(evento) {
    const categoriaSeleccionada = parseInt(evento.target.value);

    if (categoriaSeleccionada === 0) {
        mostrarProductos(todosLosProductos);
    } else {
        const productosFiltrados = todosLosProductos.filter(
            prod => prod.idCategoria === categoriaSeleccionada,
        );
        mostrarProductos(productosFiltrados);
    }
}

buscadorProductos.addEventListener("submit", (e) => {
    filtrarProductosPorNombre(e);
})

function filtrarProductosPorNombre(evento) {
    evento.preventDefault();
    const productoIngresado = inputProductos.value.trim().toLowerCase();

    if (productoIngresado === "") {
        mostrarProductos(todosLosProductos)
        return;
    }
    // includes() revisa si el texto ingresado está contenido dentro del nombre del producto.
    const productoBuscado = todosLosProductos.filter(prod => prod.producto.toLowerCase().includes(productoIngresado));
    mostrarProductos(productoBuscado);
}

botonFavoritos.addEventListener("click", () => {
    window.location.href = "/pages/favoritos.html";
});


