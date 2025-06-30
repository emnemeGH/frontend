
function agregarEventosALasEstrellas(tarjeta, producto) {
    // usamos queryselector porque por cada producto se crea una tarjeta, asi que en cada tarjeta hay una sola clase
    // agregar-estrella y estrella-agregada
    const estrellaVacia = tarjeta.querySelector(".agregar-estrella");
    const estrellaLlena = tarjeta.querySelector(".estrella-agregada");

    estrellaVacia.addEventListener("click", () => agregarFavorito(producto, estrellaVacia, estrellaLlena));
    estrellaLlena.addEventListener("click", () => eliminarFavorito(producto, estrellaVacia, estrellaLlena));
}

async function agregarFavorito(producto, estrellaVacia, estrellaLlena) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");

    if (!usuario || !token) {
        alert("Tenés que iniciar sesión para añadir a favoritos.");
        return;
    }

    const favorito = {
        id_producto: producto.idProducto,
        id_usuario: usuario.id_usuario
    };

    try {
        const respuesta = await fetch("http://localhost:4000/api/agregarFavorito", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(favorito)
        });

        const data = await respuesta.json();

        if (data.codigo === 200) {
            favoritosDelUsuario.push(producto.idProducto);
            mostrarEstrellaLlena(estrellaVacia, estrellaLlena);
        } else {
            alert("No se pudo añadir a favoritos: " + data.mensaje);
        }
    } catch (error) {
        console.error("Error al añadir a favoritos:", error);
        alert("Ocurrió un error al añadir a favoritos.");
    }
}

function mostrarEstrellaLlena(estrellaVacia, estrellaLlena) {
    estrellaVacia.style.display = "none";
    estrellaLlena.style.display = "block";
}

function mostrarEstrellaVacia(estrellaVacia, estrellaLlena) {
    estrellaLlena.style.display = "none";
    estrellaVacia.style.display = "block";
}

async function cargarFavoritos() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");

    if (!usuario || !token) return;

    try {
        const res = await fetch(`http://localhost:4000/api/obtenerFavoritos/${usuario.id_usuario}`, {
            headers: {
                Authorization: token
            }
        });

        const data = await res.json();

        if (data.codigo === 200) {
            favoritosDelUsuario = data.payload.map(fav => fav.idProducto);
        } else {
            console.warn("No se pudieron cargar los favoritos:", data.mensaje);
        }
    } catch (error) {
        console.error("Error al obtener favoritos:", error);
    }
}

async function eliminarFavorito(producto, estrellaVacia, estrellaLlena) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");

    if (!usuario || !token) {
        alert("Tenés que iniciar sesión para añadir a favoritos.");
        return;
    }

    const desfavorito = {
        id_producto: producto.idProducto,
        id_usuario: usuario.id_usuario
    };

    try {
        const respuesta = await fetch("http://localhost:4000/api/eliminarFavorito", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(desfavorito)
        });

        const data = await respuesta.json();

        if (data.codigo === 200) {
            favoritosDelUsuario = favoritosDelUsuario.filter(id => id !== producto.idProducto);
            alert("Producto eliminado de favoritos.");
            mostrarEstrellaVacia(estrellaVacia, estrellaLlena);
        } else {
            alert("No se pudo eliminar de favoritos: " + data.mensaje);
        }
    } catch (error) {
        console.error("Error al eliminar favoritos:", error);
        alert("Ocurrió un error al eliminar de favoritos.");
    }
}