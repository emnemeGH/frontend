const btnCarrito = document.getElementById("btn-carrito");
const modalCarrito = document.getElementById("modal-carrito");
const cerrarCarrito = document.getElementById("cerrar-carrito");
const contenedorItems = document.getElementById("carrito-items");
const totalCarrito = document.getElementById("total-carrito");
const btnPagar = document.getElementById("btn-pagar");

let carrito_obj = [
    {
        id: 1,
        nombre: "Remera de lino",
        precio: 5000,
        imagen: "https://http2.mlstatic.com/D_NQ_NP_953602-MLA84646517499_052025-O.webp"
    },
    {
        id: 2,
        nombre: "Camisa blanca",
        precio: 7000,
        imagen: "https://http2.mlstatic.com/D_NQ_NP_953602-MLA84646517499_052025-O.webp"
    }
];

modalCarrito.classList.toggle("visible");
cargarCarrito();

btnCarrito.addEventListener("click", () => {
    modalCarrito.classList.toggle("visible");
    cargarCarrito();
});

cerrarCarrito.addEventListener("click", () => {
    modalCarrito.classList.remove("visible");
});

btnPagar.addEventListener("click", () => {
    window.location.href = "/pages/pago.html";
});

function cargarCarrito() {
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
            cargarCarrito();
        });
    });
}
