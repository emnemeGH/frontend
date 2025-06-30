let token;

document.addEventListener("DOMContentLoaded", async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.id_usuario) {
        alert("Tenés que estar logueado para ver tus favoritos.");
        return;
    }

    const ids_favoritos_obj = await obtenerProductosFavoritos(usuario)

    // .map() recorre cada uno de esos objetos y ejecuta la función (fav => fav.idProducto).
    // Esa función devuelve el valor de la propiedad idProducto de cada objeto (cada return genera un nuevo elemento en el array)
    // El resultado es un nuevo array que contiene solo esos valores
    // usamos una función flecha de una sola línea sin llaves {}. donde el return es implícito 
    const ids_favoritos = ids_favoritos_obj.map(fav_obj => fav_obj.idProducto);

    let productos_favoritos = [];

    for (const id_favorito of ids_favoritos) {
        const producto = await fetchProductoPorId(id_favorito);
        productos_favoritos.push(producto);
    }

    // Habia un array dentro de un array y ahi recien estaba el objeto.
    // .flat() recorre un array y elimina un nivel de anidación
    productos_favoritos = productos_favoritos.flat()

    mostrarProductos(productos_favoritos)
});

async function obtenerProductosFavoritos(user) {
    try {
        token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/api/obtenerFavoritos/${user.id_usuario}`, {
            headers: {
                Authorization: token
            },
        });

        const data = await res.json();
        const favoritos = data.payload;

        return favoritos;

    } catch (err) {
        console.error("Error cargando favoritos:", err);
        return null;
    }
}

async function fetchProductoPorId(id) {
    try {
        const res = await fetch(`http://localhost:4000/api/obtenerDatosProducto/${id}`, {
            headers: {
                Authorization: token
            },
        });
        const data = await res.json();
        const producto_favorito = data.payload;
        return producto_favorito;
    } catch (error) {
        console.error("Error pidiendo producto", id, error);
        return null;
    }
}

function mostrarProductos(favoritos) {
    const container = document.getElementById("favoritos-container");
    container.innerHTML = "";

    if (favoritos.length === 0) {
        container.innerHTML = "<p>No tenés productos en favoritos.</p>";
        return;
    }
    console.log(favoritos)
    favoritos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "tarjeta";
        div.innerHTML = `
        <img src="${prod.ulrImagen}" alt="${prod.producto}" class="img-producto">
        <strong class="nombre-producto">${prod.producto}</strong>
        <small class="precio">$${prod.precio}</small>
        `;
        container.appendChild(div);
    });
}