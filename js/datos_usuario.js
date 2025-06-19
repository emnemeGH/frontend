const usuario = JSON.parse(localStorage.getItem("usuario"));
const userId = usuario.id_usuario;

async function cargarDatos() {
    const respuesta = await fetch(`http://localhost:4000/api/obtenerDatosUsuario/${userId}`);
    const datosRespuesta = await respuesta.json();

    // console.log(datosRespuesta);

    // payload contiene toda la información útil que envía el servidor (los datos del usuario)
    // Por eso, para trabajar con esos datos específicos, se extraen de payload:
    const usuario = datosRespuesta.payload;

    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('apellido').value = usuario.apellido;
    document.getElementById('direccion').value = usuario.direccion;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefono').value = usuario.telefono;
    document.getElementById('rol').value = usuario.rol;
    document.getElementById('password').value = usuario.password;
}


cargarDatos();

const form = document.getElementById('form_usuario');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
        // El DOM automáticamente crea una propiedad en el formulario para cada campo con name="...". Entonces si se hace:
        // const form = document.getElementById("form_usuario");
        // Se puede acceder así:
        // form.nombre       // <input name="nombre" ...>
        // form.nombre.value // el texto que escribió el usuario
        nombre: form.nombre.value,
        apellido: form.apellido.value,
        direccion: form.direccion.value,
        email: form.email.value,
        telefono: form.telefono.value,
        rol: form.rol.value,
        password: form.password.value 
    };

    // respuesta es un objeto de tipo Response, porque se espera a que la promesa se resuelva
    const respuesta = await fetch(`http://localhost:4000/api/modificarUsuario/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    // respuesta.ok es una propiedad booleana del objeto Response que devuelve true si la respuesta del servidor fue exitosa (códigos 200 a 299). 
    // Es útil para verificar si la petición funcionó correctamente antes de procesar la respuesta.
    if (respuesta.ok) {
        alert('Datos actualizados correctamente');
    } else {
        alert('Error al actualizar');
    }
});