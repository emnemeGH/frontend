const btnMostrarFormulario = document.getElementById('btnMostrarFormulario');
const formulario = document.getElementById('formProducto');
const selectCategoria = document.getElementById('categoria');
const contenedorCategorias = document.getElementById('listadoCategorias');

cargarProductos();
cargarCategoriasEnFormulario();

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

        // Crear mapa de categorías con productos
        const categoriasMap = {};
        productos.forEach(p => {
            const nombre = p.categoria;
            if (!categoriasMap[nombre]) {
                categoriasMap[nombre] = [];
            }
            categoriasMap[nombre].push(p);
        });

        contenedorCategorias.innerHTML = '';

        // Renderizar categorías con sus productos
        for (const nombreCategoria in categoriasMap) {
            const titulo = document.createElement('h3');
            titulo.textContent = nombreCategoria;
            titulo.classList.add('categoria-titulo');

            const grid = document.createElement('div');
            grid.classList.add('productos-grid');

            categoriasMap[nombreCategoria].forEach(prod => {
                //console.log("Producto actual:", prod);
                const idProducto = prod.id_producto || prod.idProducto || prod.id;
                //console.log("idProducto asignado:", idProducto);

                const tarjeta = document.createElement('div');
                tarjeta.classList.add('tarjeta');

                tarjeta.innerHTML = `
      <img src="${prod.imagen || prod.ulrImagen || ''}" alt="${prod.producto}" class="img-producto">
      <div class="descripcion">
        <strong>${prod.producto}</strong><br>
        ${prod.descripcion}<br>
        <p>$${prod.precio}</p><br>
      </div>
      <div>
        <button class="btn-editar" data-id="${prod.id_producto}">Editar</button>
        <button class="btn-eliminar">Eliminar</button>
      </div>
    `;

                const btnEditar = tarjeta.querySelector(".btn-editar");
                //console.log("Botón editar creado:", btnEditar);
                //console.log("data-id del botón:", btnEditar.getAttribute("data-id"));

                btnEditar.addEventListener("click", async () => {
                    console.log("ID del producto a editar (capturado):", idProducto);

                    try {
                        const token = localStorage.getItem("token");
                        const res = await fetch(`http://localhost:4000/api/obtenerDatosProducto/${idProducto}`, {
                            headers: { Authorization: token }
                        });
                        const data = await res.json();
                        console.log("📦 Datos obtenidos para editar:", data);

                        if (data.codigo === 200 && Array.isArray(data.payload)) {
                            const productos = data.payload[0];
                            const inventario = data.payload[1];
                            const inventarioFiltrado = inventario.filter(p => p.id_producto == idProducto);

                            if (inventarioFiltrado.length === 0) {
                                console.warn("⚠️ No se encontró inventario en la respuesta.");
                                return;
                            }

                            console.log("📋 Inventario del producto:", inventarioFiltrado);
                            //mostrarFormularioEdicion(inventarioFiltrado);
                        }
                    } catch (err) {
                        console.error("Error al obtener datos del producto:", err);
                    }
                });

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
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No estás logueado. Iniciá sesión primero.");
        window.location.href = "/pages/login.html";
        return;
    }

    try {
        const res = await fetch("http://localhost:4000/api/obtenerCategorias", {
            headers: { Authorization: token }
        });

        const data = await res.json();

        if (data.codigo === -1 && data.mensaje === "Token expirado") {
            alert("Tu sesión ha expirado. Iniciá sesión nuevamente.");
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "/pages/login.html";
            return;
        }

        const categorias = data.payload;

        selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';

        categorias.forEach(cat => {
            selectCategoria.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
        });

    } catch {
        alert("Error al cargar las categorías");
    }
}

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
            cargarCategoriasEnFormulario();
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (err) {
        console.error("Error al crear categoría:", err);
        alert("Error al conectar con el servidor: " + err.message);
    }
});

// CREAR PRODUCTO
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const genero = document.getElementById("genero").value;
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
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:4000/api/cargarProducto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(producto),
        });

        const data = await res.json();

        if (data.codigo === 200) {
            alert("Producto creado correctamente");

            console.log("Payload recibido al crear producto:", data.payload);
            const idProducto = data.payload[0].id_producto || data.payload[0].idProducto || data.payload[0].idCategoria;
            console.log("ID del producto creado:", idProducto);


            // Crear los registros de inventario en el backend
            const talles = ["S", "M", "L", "XL"];

            for (const talle of talles) {
                const cantidad = parseInt(document.getElementById(`stock_${talle.toLowerCase()}`).value);
                if (cantidad > 0) {
                    try {
                        const resInv = await fetch("http://localhost:4000/api/crearInventario", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: token
                            },
                            body: JSON.stringify({
                                id_producto: idProducto,
                                talle,
                                color,
                                stock: cantidad
                            }),
                        });

                        const dataInv = await resInv.json();
                    } catch (err) {
                        console.error(`Error al enviar inventario talle ${talle}:`, err);
                    }
                }
            }

            // Limpia todos los campos del formulario (como un "borrar todo").
            formulario.reset();

            // actualiza los productos y las categorias
            cargarProductos();
            cargarCategoriasEnFormulario();
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (err) {
        console.error("Error al cargar producto:", err);
    }
});
