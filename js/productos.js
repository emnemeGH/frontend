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
                const tarjeta = document.createElement('div');
                tarjeta.classList.add('tarjeta');

                tarjeta.innerHTML = `
                    <img src="${prod.imagen || prod.ulrImagen || ""}" alt="${prod.producto}" class="img-producto">
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
                // BOTON MODIFICAR
                const btnEditar = tarjeta.querySelector(".btn-editar");
                
                
                btnEditar.addEventListener("click", async () => {
                    const idProducto = btnEditar.dataset.id;
                    console.log("ID del producto a editar:", idProducto);

                    try {
                        const token = localStorage.getItem("token");
                        const res = await fetch(`http://localhost:4000/api/obtenerDatosProducto/${idProducto}`, {
                            headers: {
                                Authorization: token
                            }
                        });

                        const data = await res.json();
                        console.log("📦 Datos obtenidos para editar:", data);

                        if (data.codigo === 200 && Array.isArray(data.payload)) {
                            const inventario = data.payload[1];
                            if (!Array.isArray(inventario) || inventario.length === 0) {
                                console.warn("⚠️ No se encontró inventario en la respuesta.");
                                return;
                            }

                            console.log("📋 Inventario del producto:", inventario);
                            mostrarFormularioEdicion(inventario);
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

function mostrarFormularioEdicion(inventario) {
    const formulario = document.getElementById("formProducto");
    formulario.classList.remove("oculto");

    const contenedorTalles = formulario.querySelector(".talles");
    contenedorTalles.innerHTML = "";

    inventario.forEach(item => {
        console.log("📦 Item de inventario:", item); // Debug clave
        const div = document.createElement("div");
        div.innerHTML = `
            <label>${item.color} - ${item.talle}:</label>
            <input type="number" min="0" 
                value="${item.stock}" 
                data-id="${item.idInventario}" 
                data-original="${item.stock}" 
                class="campo-stock" />
        `;
        contenedorTalles.appendChild(div);
    });

    const btnGuardar = document.createElement("button");
    btnGuardar.id = "btnGuardarCambios";
    btnGuardar.textContent = "Guardar cambios de stock";
    formulario.appendChild(btnGuardar);

    btnGuardar.addEventListener("click", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const campos = formulario.querySelectorAll(".campo-stock");
        let huboCambios = false;

        for (const input of campos) {
            const stockNuevo = parseInt(input.value);
            const stockOriginal = parseInt(input.dataset.original);
            const idInventario = parseInt(input.dataset.id);

            if (stockNuevo !== stockOriginal) {
                huboCambios = true;
                try {
                    const res = await fetch("http://localhost:4000/api/modificarStock", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: token
                        },
                        body: JSON.stringify({
                            id_inventario: idInventario,
                            stock: stockNuevo
                        })
                    });

                    const data = await res.json();
                    if (data.codigo === 200) {
                        console.log(`✅ Stock modificado para ID ${idInventario}`);
                    } else {
                        console.warn(`⚠️ Error modificando stock ID ${idInventario}: ${data.mensaje}`);
                    }
                } catch (err) {
                    console.error(`❌ Error al enviar PUT para ID ${idInventario}:`, err);
                }
            }
        }

        if (!huboCambios) {
            alert("No realizaste cambios de stock");
            return;
        }

        alert("Cambios guardados");
        formulario.reset();
        formulario.classList.add("oculto");
        cargarProductos();
    });
}


