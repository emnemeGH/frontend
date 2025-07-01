const btnCarrito = document.getElementById("btn-carrito");
const modalCarrito = document.getElementById("modal-carrito");
const cerrarCarrito = document.getElementById("cerrar-carrito");
const contenedorItems = document.getElementById("carrito-items");
const totalCarrito = document.getElementById("total-carrito");
const btnPagar = document.getElementById("btn-pagar");

let carrito_obj = [];

btnCarrito.addEventListener("click", () => {
    modalCarrito.classList.toggle("visible");
    obtenerCarrito();
});

cerrarCarrito.addEventListener("click", () => {
    modalCarrito.classList.remove("visible");
});

btnPagar.addEventListener("click", () => {
    window.location.href = "/pages/pago.html";
});

async function obtenerCarrito() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");

    if (!usuario || !token) {
        alert("Usuario no logueado");
        return;
    }

    try {
        const res = await fetch(`http://localhost:4000/api/obtenerProductosCarrito/${usuario.id_usuario}`, {
            headers: {
                Authorization: token
            }
        });

        const data = await res.json();

        if (data.codigo === 200) {
            carrito_obj = data.payload.map(prod => ({
                id: prod.idProducto,
                nombre: prod.producto,
                precio: parseFloat(prod.precio),
                imagen: prod.urlImagen
            }));
            mostrarCarrito();
        } else {
            console.error("Error al obtener productos:", data.mensaje);
        }
    } catch (err) {
        console.error("Error de red:", err);
    }
}

function mostrarCarrito() {
    contenedorItems.innerHTML = "";
    let total = 0;

    carrito_obj.forEach((prod) => {
        const div = document.createElement("div");
        div.classList.add("carrito-item");

        div.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}" class="prod-imagen">
            <div>
                <strong>${prod.nombre}</strong><br>
                <small>$${prod.precio}</small>
            </div>
            <button class="btn-eliminar"><img src="../img/delete.png" class="delete-img" data-id="${prod.id}"></button>
        `;

        contenedorItems.appendChild(div);
        total += prod.precio;
    });

    totalCarrito.textContent = total;

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            console.log(e.target)
            carrito_obj = carrito_obj.filter(prod => prod.id !== id)
            mostrarCarrito();
        });
    });
}
