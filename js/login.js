const form = document.getElementById("form_login");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Inicio de sesión exitoso");
            window.location.href = "../index.html";
        } else {
            const error = await response.json();
            alert("Error al iniciar sesión: " + error.message);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("No se pudo conectar con el servidor.");
    }
});
