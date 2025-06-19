const userId = 1; // 👉 Cambiar por el ID real del usuario logueado

async function cargarDatos() {
    const res = await fetch(`http://localhost:4000/api/obtenerDatosUsuario/${userId}`);
    const data = await res.json(); // 'data' es { codigo, mensaje, payload }

    console.log(data);
    const usuario = data.payload;

    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('apellido').value = usuario.apellido;
    document.getElementById('direccion').value = usuario.direccion;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefono').value = usuario.telefono;
    document.getElementById('rol').value = usuario.rol;
    document.getElementById('password').value = usuario.password;
}


cargarDatos();

// 2. Guardar cambios
const form = document.getElementById('form_usuario');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: form.nombre.value,
        apellido: form.apellido.value,
        direccion: form.direccion.value,
        email: form.email.value,
        telefono: form.telefono.value,
        rol: form.rol.value,
        password: form.password.value 
    };

    const res = await fetch(`/api/modificarUsuario/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert('Datos actualizados correctamente');
        form.password.value = ""; // limpiar el campo contraseña
    } else {
        alert('Error al actualizar');
    }
});