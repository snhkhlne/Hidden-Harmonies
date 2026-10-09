const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/register", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    const result = await response.json();

    message.textContent = result.message;

    if (result.success) {
        registerForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    }

});