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
                idInventario: prod.idInventario,
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
            <button class="btn-eliminar"><img src="../img/delete.png" class="delete-img" data-id="${prod.idInventario}"></button>
        `;

        contenedorItems.appendChild(div);
        total += prod.precio;
    });

    totalCarrito.textContent = total;

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const idInventario = parseInt(e.target.getAttribute("data-id"));
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            const token = localStorage.getItem("token");

            try {
                const res = await fetch("http://localhost:4000/api/eliminarProductoCarrito", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                    },
                    body: JSON.stringify({
                        id_usuario: usuario.id_usuario,
                        id_inventario: idInventario
                    })
                });

                const data = await res.json();

                if (data.codigo === 200) {
                    carrito_obj = carrito_obj.filter(prod => prod.idInventario !== idInventario);
                    alert("Producto eliminado correctamente")
                    mostrarCarrito();
                } else {
                    alert("No se pudo eliminar el producto del carrito: " + data.mensaje);
                }
            } catch (err) {
                console.error("Error al eliminar producto:", err);
            }
        });
    });
}
