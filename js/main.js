const btnSesion = document.getElementById("btn-sesion");
const imgSesion = document.getElementById("img-sesion");

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