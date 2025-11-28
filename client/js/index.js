document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // 1. LÓGICA MOSTRAR/OCULTAR CONTRASEÑA (TOGGLE)
    // ==========================================================
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // SVGs for eye and eye-off
    const eyeSVG = `<svg class="toggle-password" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                       <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                       <circle cx="12" cy="12" r="3"/>
                    </svg>`;
    const eyeOffSVG = `<svg class="toggle-password" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                       <path d="M1 1l22 22M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47M22.94 12.94A10.94 10.94 0 0 0 12 5c-7 0-11 7-11 7a21.81 21.81 0 0 0 5.06 6.06"/>
                    </svg>`;

    // Solo adjuntamos el evento si los elementos existen
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function(e) {
            e.preventDefault(); 
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.innerHTML = eyeSVG; // Cambia a ojo abierto
            } else {
                passwordInput.type = 'password';
                togglePassword.innerHTML = eyeOffSVG; // Cambia a ojo cerrado
            }
        });
    }

    // ==========================================================
    // 2. LÓGICA DE VALIDACIÓN (LOGIN)
    // ==========================================================
    
    // Credenciales (simuladas en el Front-End)
    const usuarioSimulado = "admin";
    const contrasenaSimulada = "admin123";
    
    // 💡 IMPORTANTE: Asegúrate que tu formulario HTML tenga id="loginForm"
    const loginForm = document.getElementById("loginForm"); 
    
    if (loginForm) {
        // Adjuntamos la función 'validar' al evento 'submit' del formulario
        loginForm.addEventListener("submit", validar);

    }
    
    function validar(event) {
        // ⚠️ Previene el envío automático del formulario y la recarga de la página
        event.preventDefault(); 

        const inputUser = document.getElementById("username").value;
        const inputPass = document.getElementById("password").value;

        // Validación simple
        if (inputUser === usuarioSimulado && inputPass === contrasenaSimulada) {
            // Redirige
            
            document.querySelector('.content').style.opacity = '0.5'; 
            const loader = createLoaderHTML();
            document.body.appendChild(loader);
            // 2. Simular el tiempo de carga y luego redirigir
            setTimeout(() => {
                alert("Inicio de sesión exitoso"); 
                window.location.href = "../js/index.js"; 
                
                // 3. Limpieza (Aunque la redirección ya lo hace, es buena práctica)
                
            }, 20000);
            window.location.href = "/html/inicio.html";
            
        } else {
            alert("Usuario o contraseña incorrectos");
        } 
    }
});

function createLoaderHTML() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="center-body">
                <div class="loader-circle-9" style="color: white; font-size: 20px;">
                    Loading
                    <span style="display: block;"></span> 
                    </div>
            </div>
        `;
        return overlay;
    }