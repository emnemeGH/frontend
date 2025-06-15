// DOMContentLoaded: Cuando el documento HTML esté completamente cargado y listo
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form_registro");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // crea un objeto FormData con todos los datos del formulario.
        // si el formulario tiene los campos: 
        // <input name="nombre" value="Ana" /> <input name="email" value="ana@gmail.com" />
        // formData contendrá: 
        // nombre: "Ana",
        // email: "ana@gmail.com"
        const formData = new FormData(form);
        
        // formData.entries() devuelve un iterable de pares [clave, valor].
        // Transforma el name y value del formulario en una clave valor
        // Seria asi: formData.entries() → [["nombre", "Ana"], ["email", "ana@gmail.com"]]

        // Object.fromEntries() convierte el iterable de pares clave–valor en un objeto JavaScript plano
        // para asi poder enviarlo despues con el POST: { nombre: "Ana", email: "ana@gmail.com" }
        const data = Object.fromEntries(formData.entries());

        // Cuando creamos el formData(form) parece tener el mismo formato que obtenemos al final
        // con Object.fromEntries, pero no es lo mismo, al principio era un formData y no un  
        // objeto plano. Por eso, si queremos usarlo con fetch, tenemos que transformarlo en un objeto
        // plano con Object.fromEntries. El cual recibe solo iterables como parametro por eso es necesario
        // tambien convertirlo a un iterable con entries().

        try {
            const response = await fetch("http://localhost:4000/api/registrarUsuario", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Usuario registrado con éxito");
                window.location.href = "../index.html";
            } else {
                const error = await response.json();
                alert("Error al registrar: " + error.message);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Ocurrió un error al conectar con el servidor.");
        }
    });
});
