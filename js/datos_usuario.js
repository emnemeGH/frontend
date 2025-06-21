const btn_guardar = document.getElementById('btn_guardar');
const form = document.getElementById('form_usuario');

let usuario = null;
let userId = null;

async function cargarDatos() {
    usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        return;
    }

    userId = usuario.id_usuario;

    const respuesta = await fetch(`http://localhost:4000/api/obtenerDatosUsuario/${userId}`, {
        headers: {
            Authorization: localStorage.getItem("token")
        }
    });

    const datosRespuesta = await respuesta.json();

    const datos_usuario = datosRespuesta.payload;

    document.getElementById('nombre').value = datos_usuario.nombre;
    document.getElementById('apellido').value = datos_usuario.apellido;
    document.getElementById('direccion').value = datos_usuario.direccion;
    document.getElementById('email').value = datos_usuario.email;
    document.getElementById('telefono').value = datos_usuario.telefono;
    document.getElementById('rol').value = datos_usuario.rol;
    document.getElementById('password').value = datos_usuario.password;
}

cargarDatos();

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validación por si el usuario no está logueado
    if (!usuario || !userId) {
        alert("No hay sesión activa");
        return;
    }

    const datos = {
        nombre: form.nombre.value,
        apellido: form.apellido.value,
        direccion: form.direccion.value,
        email: form.email.value,
        telefono: form.telefono.value,
        rol: form.rol.value,
        password: form.password.value
    };

    const respuesta = await fetch(`http://localhost:4000/api/modificarUsuario/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('token')
        },
        body: JSON.stringify(datos)
    });

    if (respuesta.ok) {
        alert('Datos actualizados correctamente');
        window.location.href = "../index.html";
    } else {
        alert('Error al actualizar');
    }
});
