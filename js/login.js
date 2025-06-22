const form = document.getElementById("form_login");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        // GUARDAR EL TOKEN JWT RECIBIDO EN EL CAMPO 'jwt' DEL JSON
        // resData es la respuesta del servidor en formato JSON. Con un console log vemos su formato y accedemos a sus valores.
        const resData = await response.json();
        
        if (resData.codigo === 200) {
            alert("Inicio de sesión exitoso");
            
            // localStorage.setItem() solo puede guardar strings. No objetos, no arrays, solo texto. 
            localStorage.setItem("token", resData.jwt);
            // Por eso lo convertimos a string con JSON.stringify()
            localStorage.setItem("usuario", JSON.stringify(resData.payload));

            window.location.href = "../index.html";
        } else {
            alert("Error al iniciar sesión: " + resData.mensaje);
        }

    } catch (err) {
        console.error("Error en el login:", err);
        alert("No se pudo conectar con el servidor.");
    }
});

