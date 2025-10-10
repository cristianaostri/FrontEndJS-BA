const input = document.getElementById('password');

const toggle = document.getElementById('togglePasswword');

toggle.addEventListener('click', function() {
    const isPassword = input.getAttribute('type') === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.className = isPassword
    ? "ri-eye-fill toggle-password"
    : "ri-eye-off-fill toggle-password";
});

