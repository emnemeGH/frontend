document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // El boton se ve solo si es admin
    esAdmin(usuario);

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

        const prod = inventario[0];

        // Mostrar info general
        const infoHTML = `
        <div class="detalle-producto">
    <div class="columna-izquierda">
      <h2>${prod.producto}</h2>
      <img src="${prod.ulrImagen}" alt="${prod.producto}">
    </div>
    <div class="columna-derecha">
      <p><strong>Descripcion:</strong><br>${prod.descripcion}</p>
      <p><strong>Precio:</strong><br>$${prod.precio}</p>
      <p><strong>Genero:</strong><br>${prod.genero}</p>
      <p><strong>Categoria:</strong><br>${prod.categoria}</p>
    </div>
  </div>
  <div class="stock-grid" id="contenedorInventario"></div>
        `;
        document.getElementById("infoProducto").innerHTML = infoHTML;

        // Mostrar inventario
        const contenedorInv = document.getElementById("contenedorInventario");
contenedorInv.innerHTML = "";

inventario.forEach(item => {
  const tarjeta = document.createElement("div");
  tarjeta.classList.add("stock-card");

  tarjeta.innerHTML = `
    <p><strong>Talle:</strong> ${item.talle}</p>
    <p><strong>Color:</strong> ${item.color}</p>
    <p><strong>Stock:</strong> ${item.stock}</p>
    <button class="btn-agregar">Agregar carrito</button>
  `;

  contenedorInv.appendChild(tarjeta);
        });


    } catch (err) {
        console.error("Error al cargar el producto:", err);
        alert("Error inesperado.");
    }
});

function esAdmin(usuario) {
    if (usuario?.rol !== "admin") return;

    const contenedor = document.getElementById("modificarStock");
    contenedor.innerHTML = `
        <button id="btnGuardarStock">Guardar Stock</button>
        <div id="mensajeExito" style="display: none; color: green; margin-top: 10px;">
            Stock actualizado con éxito.
        </div>
    `;

    // Escuchar clic en "Guardar"
    document.getElementById("btnGuardarStock").addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        const inputs = document.querySelectorAll(".stock-input");
        const modificaciones = [];

        inputs.forEach(input => {
            const id = input.dataset.id;
            const nuevoStock = parseInt(input.value);
            const stockOriginal = parseInt(input.defaultValue);

            if (nuevoStock !== stockOriginal) {
                modificaciones.push({ id_inventario: id, stock: nuevoStock });
            }
        });

        if (modificaciones.length === 0) {
            alert("No hay cambios para guardar.");
            return;
        }

        try {
            for (const modif of modificaciones) {
                await fetch("http://localhost:4000/api/modificarStock", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token
                    },
                    body: JSON.stringify(modif)
                });
            }

            document.getElementById("mensajeExito").style.display = "block";
            setTimeout(() => location.reload(), 1000);

        } catch (err) {
            console.error("Error al actualizar stock:", err);
            alert("Hubo un error al guardar los cambios.");
        }
    });
}

