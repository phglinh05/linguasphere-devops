const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const AUTH_BASE = "/api/auth";

loginBtn.onclick = function() {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    loginBtn.classList.add("active");
    registerBtn.classList.remove("active");
}

registerBtn.onclick = function() {
    loginForm.style.display="none";
    registerForm.style.display="block";
    loginBtn.classList.remove("active");
    registerBtn.classList.add("active");
}

loginForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const username = loginForm.querySelector("input[type='text']").value;
    const password = loginForm.querySelector("input[type='password']").value;
    const remember = document.getElementById("remember").checked;

    const res = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({username, password, remember})
    })

    const data = await res.json();

    if(res.ok){
        loginMessage.innerHTML = `<span class="text-success">${data.message}</span>`;
        window.location.href = "/dashboard";
    }
    else{
        loginMessage.innerHTML = `<span class="text-danger">${data.message}</span>`;
    }
})

registerForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const username = registerForm.querySelector("input[type='text']").value;
    const email = registerForm.querySelector("input[type='email']").value;
    const password = document.getElementById("password").value;
    const cfpassword = document.getElementById("confirmpassword").value;

    if(password != cfpassword){
        registerMessage.innerHTML =`<span class="text-danger">Passwords do not match</span>`;
        return;
    }

    const res = await fetch(`${AUTH_BASE}/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, email, password, cfpassword})
    })

    const data = await res.json();

    if(res.ok){
        registerMessage.innerHTML = `<span class="text-success">${data.message}</span>`;
        registerForm.reset();
    }
    else{
        registerMessage.innerHTML = `<span class="text-danger">${data.message}</span>`;
    }
})

async function checkAuth() {
    try {
        const res = await fetch(`${AUTH_BASE}/me`, {
            method: "GET",
            credentials: "include"
        });
        
        if (res.ok) {
            window.location.href = "/dashboard";
        }
    } catch (err) {
        console.log("Not authenticated");
    }
}

checkAuth();