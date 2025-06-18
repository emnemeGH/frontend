const btnMostrarFormulario = document.getElementById('btnMostrarFormulario');
const formulario = document.getElementById('formProducto');
const selectCategoria = document.getElementById('categoria');
const contenedorCategorias = document.getElementById('listadoCategorias');

// Mostrar/ocultar formulario
btnMostrarFormulario.addEventListener('click', () => {
    formulario.classList.toggle('oculto');
    btnMostrarFormulario.textContent = formulario.classList.contains('oculto') ? 'Agregar producto' : 'Cancelar';
});

// Cargar productos y mostrar por categoría
async function cargarProductos() {
    try {
        const res = await fetch('http://localhost:4000/api/obtenerProductos');
        const data = await res.json();
        const productos = data.payload;

        // Agrupar productos por categoría
        const categoriasMap = {};
        productos.forEach(p => {
            if (!categoriasMap[p.categoria]) {
                categoriasMap[p.categoria] = [];
            }
            categoriasMap[p.categoria].push(p);
        });

        // Cargar opciones del select
        selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
        let idCategoria = 1;
        for (const nombreCategoria in categoriasMap) {
            const option = document.createElement('option');
            option.value = idCategoria;
            option.textContent = nombreCategoria;
            selectCategoria.appendChild(option);
            idCategoria++;
        }

        // Renderizado de productos
        contenedorCategorias.innerHTML = '';
        for (const categoria in categoriasMap) {
            const titulo = document.createElement('h3');
            titulo.textContent = categoria;
            titulo.classList.add('categoria-titulo');

            const linea = document.createElement('hr');
            const grid = document.createElement('div');
            grid.classList.add('productos-grid');

            categoriasMap[categoria].forEach(prod => {
                const tarjeta = document.createElement('div');
                tarjeta.classList.add('tarjeta');

                // Mostrar inventario simulado
                const inventarioLocal = JSON.parse(localStorage.getItem("inventarioSimulado")) || [];
                const inventarioDelProducto = inventarioLocal.filter(item => item.id_producto === prod.idCategoria);

                let inventarioTexto = "";
                inventarioDelProducto.forEach(item => {
                    inventarioTexto += `${item.color} - ${item.talle}: ${item.stock}u<br>`;
                });

                tarjeta.innerHTML = `
                    <img src="${prod.imagen || prod.ulrImagen || ''}" alt="${prod.producto}">
                    <div class="descripcion">
                        <strong>${prod.producto}</strong><br>
                        ${prod.descripcion}<br>
                        <small>$${prod.precio}</small><br>
                        <small><em>${inventarioTexto}</em></small>
                    </div>
                    <button class="btn-editar">Editar</button>
                    <button class="btn-eliminar">Eliminar</button>
                `;
                grid.appendChild(tarjeta);
            });

            contenedorCategorias.appendChild(titulo);
            contenedorCategorias.appendChild(linea);
            contenedorCategorias.appendChild(grid);
        }
    } catch (err) {
        console.error('Error al cargar productos:', err);
    }
}

// Inicializar productos
cargarProductos();

// Crear categoría
const formCategoria = document.getElementById("formCategoria");
formCategoria.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreCategoria").value.trim();
    if (!nombre) {
        alert("Por favor, escribí un nombre de categoría.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/api/crearCategoria", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify({ nombre }),
        });

        const data = await response.json();
        if (data.codigo === 200) {
            alert("Categoría creada con éxito");
            formCategoria.reset();
            cargarProductos(); // opcional si querés refrescar la vista
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (err) {
        console.error("Error al crear categoría:", err);
    }
});

// CREAR PRODUCTO
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const genero = document.getElementById("genero").value;
    const color = document.getElementById("color").value.trim();
    const id_categoria = parseInt(document.getElementById("categoria").value);
    const imagen = document.getElementById("imagen").value.trim();

    const producto = {
        nombre,
        descripcion,
        precio,
        genero,
        id_categoria,
        imagen
    };

    try {
        const res = await fetch("http://localhost:4000/api/cargarProducto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        const data = await res.json();

        if (data.codigo === 200) {
            alert("Producto creado correctamente");

            // Guardar simulación de inventario
            const idProducto = data.payload[0].idCategoria;
            const inventarioLocal = JSON.parse(localStorage.getItem("inventarioSimulado")) || [];
            const nuevosRegistros = [];

            ["S", "M", "L", "XL"].forEach(talle => {
                const cantidad = parseInt(document.getElementById(`stock_${talle.toLowerCase()}`).value);
                if (cantidad > 0) {
                    nuevosRegistros.push({
                        id_producto: idProducto,
                        talle,
                        color,
                        stock: cantidad
                    });
                }
            });

            localStorage.setItem("inventarioSimulado", JSON.stringify([...inventarioLocal, ...nuevosRegistros]));

            formulario.reset();
            cargarProductos();
        } else {
            alert("Error: " + data.mensaje);
        }

    } catch (err) {
        console.error("Error al cargar producto:", err);
    }
});
