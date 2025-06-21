const btnMostrarFormulario = document.getElementById('btnMostrarFormulario');
const formulario = document.getElementById('formProducto');
const selectCategoria = document.getElementById('categoria');
const contenedorCategorias = document.getElementById('listadoCategorias');

// Mostrar/ocultar formulario
btnMostrarFormulario.addEventListener('click', () => {
    formulario.classList.toggle('oculto');
    btnMostrarFormulario.textContent = formulario.classList.contains('oculto') ? 'Agregar producto' : 'Cancelar';
});

// Obtener productos y mostrar por categoría
async function cargarProductos() {
    try {
        const res = await fetch('http://localhost:4000/api/obtenerProductos');
        const data = await res.json();
        const productos = data.payload[0];
        console.log("Productos completos:", productos);

        // Crear mapa de categorías con productos
        const categoriasMap = {};
        productos.forEach(p => {
            const nombre = p.categoria;
            if (!categoriasMap[nombre]) {
                categoriasMap[nombre] = [];
            }
            categoriasMap[nombre].push(p);
        });

        console.log("Categorías agrupadas:", categoriasMap);

        contenedorCategorias.innerHTML = '';

        // Renderizar categorías con sus productos
        for (const nombreCategoria in categoriasMap) {
            const titulo = document.createElement('h3');
            titulo.textContent = nombreCategoria;
            titulo.classList.add('categoria-titulo');

            const grid = document.createElement('div');
            grid.classList.add('productos-grid');

            categoriasMap[nombreCategoria].forEach(prod => {
                const tarjeta = document.createElement('div');
                tarjeta.classList.add('tarjeta');

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
            contenedorCategorias.appendChild(grid);
        }
    } catch (err) {
        console.error('Error al cargar productos:', err);
    }
}

async function cargarCategoriasEnFormulario() {
    try {
        const res = await fetch('http://localhost:4000/api/obtenerProductos');
        const data = await res.json();
        const productos = data.payload[0];

        const categoriasUnicas = new Map();

        productos.forEach(p => {
            if (p.categoria && !categoriasUnicas.has(p.categoria)) {
                const idCat = p.id_categoria || p.idCategoria;
                if (idCat) {
                    categoriasUnicas.set(p.categoria, idCat);
                }
            }
        });

        selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
        categoriasUnicas.forEach((id_categoria, nombre) => {
            const option = document.createElement('option');
            option.value = id_categoria;
            option.textContent = nombre;
            selectCategoria.appendChild(option);
        });

        console.log("✔ Categorías cargadas en el formulario:", categoriasUnicas);
    } catch (error) {
        console.error("❌ Error al cargar categorías en el formulario:", error);
    }
}


// Inicializar
cargarProductos();
cargarCategoriasEnFormulario();

// CREAR CATEGORÍA
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
            cargarProductos();
            cargarCategoriasEnFormulario(); // actualiza el select
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (err) {
        console.error("Error al crear categoría:", err);
    }
    formulario.classList.add('oculto');
    formCategoria.reset();
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

    if (!id_categoria) {
        alert("Seleccioná una categoría válida.");
        return;
    }

    const producto = {
        nombre,
        descripcion,
        precio,
        genero,
        id_categoria,
        imagen
    };

    try {
        // Enviar el producto al backend
        const res = await fetch("http://localhost:4000/api/cargarProducto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        const data = await res.json();

        if (data.codigo === 200) {
            alert("Producto creado correctamente");

            const idProducto = data.payload[0].idCategoria; // id generado en backend
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
            cargarCategoriasEnFormulario(); // actualiza el select
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (err) {
        console.error("Error al cargar producto:", err);
    }
});

