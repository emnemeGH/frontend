const btnSesion = document.getElementById("btn-sesion");
const imgSesion = document.getElementById("img-sesion");
const btnUsuario = document.getElementById("btn-usuario");

document.addEventListener("DOMContentLoaded", () => {
    actualizarIconoSesion();
});

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
    } else {
        window.location.href = "/pages/login.html";
    }
});

btnUsuario.addEventListener("click", () => {
    window.location.href = "/pages/datos_usuario.html";
});

// MUESTRA DE PRODUCTOS EN LA PAGINA PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {
    actualizarIconoSesion();
    cargarProductosEnPagina();
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
                <img src="${prod.imagen || prod.ulrImagen || ''}" alt="${prod.producto}">
                <div class="descripcion">
                    <strong class= "nombre-producto">${prod.producto}</strong><br>
                    ${prod.descripcion}<br>
                    <small>$${prod.precio}</small><br>
                    <small><em>Categoría: ${prod.categoria}</em></small>
                </div>
            `;

            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        console.error('Error al cargar productos para la página:', error);
    }
}
