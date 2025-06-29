const btnSesion = document.getElementById("btn-sesion");
const imgSesion = document.getElementById("img-sesion");
const btnUsuario = document.getElementById("btn-usuario");
const btnGestion = document.getElementById("btn-gestion");
const selectCategoria = document.getElementById('categoria');

document.addEventListener("DOMContentLoaded", () => {
    actualizarIconoSesion();
    cargarProductosEnPagina();
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
        const productos = data.payload[0]; // asumiendo la estructura que usás

        const contenedor = document.getElementById('productos-lista');
        contenedor.innerHTML = ''; // limpiar

        productos.forEach(prod => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta');

            tarjeta.innerHTML = `
                <img src="${prod.imagen || prod.ulrImagen || ''}" alt="${prod.producto}" class="img-producto">
                <div class="descripcion">
                    <strong class= "nombre-producto">${prod.producto}</strong><br>
                    ${prod.descripcion}<br>
                    <small class="precio">$${prod.precio}</small><br>
                    <small class="categoria">Categoría: ${prod.categoria}</small>
                </div>
                <div class="botones">
                    <button class="btn-comprar">Comprar</button>
                    <button class="btn-ver">Ver Producto</button>
                </div>
            `;

            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        console.error('Error al cargar productos para la página:', error);
    }
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
        alert("No estas logueado, no podes ver categorias");
    }
}