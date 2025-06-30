document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Falta el ID del producto en la URL");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/api/obtenerDatosProducto/${id}`, {
            headers: { Authorization: token }
        });

        const data = await res.json();

        if (data.codigo !== 200) {
            alert("Error al obtener datos del producto");
            return;
        }

        const inventario = data.payload;

        if (inventario.length === 0) {
            document.getElementById("infoProducto").innerHTML = "<p>No hay datos del producto.</p>";
            return;
        }

        const prod = inventario[0]; // Tomamos la primera fila para los datos generales

        // Mostrar info general
        const infoHTML = `
            <h2>${prod.producto}</h2>
            <img src="${prod.ulrImagen}" alt="${prod.producto}">
            <p><strong>Descripción:</strong> ${prod.descripcion}</p>
            <p><strong>Precio:</strong> $${prod.precio}</p>
            <p><strong>Género:</strong> ${prod.genero}</p>
            <p><strong>Categoría:</strong> ${prod.categoria}</p>
        `;
        document.getElementById("infoProducto").innerHTML = infoHTML;

        // Mostrar inventario
        const tbody = document.querySelector("#tablaInventario tbody");
        tbody.innerHTML = "";

        inventario.forEach(item => {
            const fila = `
                <tr>
                    <td>${item.talle}</td>
                    <td>${item.color}</td>
                    <td>${item.stock}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML("beforeend", fila);
        });

    } catch (err) {
        console.error("Error al cargar el producto:", err);
        alert("Error inesperado.");
    }
});
