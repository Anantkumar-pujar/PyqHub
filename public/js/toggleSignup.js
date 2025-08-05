document.querySelectorAll('.toggle-password, .toggle-pwd').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
        const input = this.previousElementSibling; // Get the associated input field
        const icon = this.querySelector('i');

        // Toggle password visibility
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});
