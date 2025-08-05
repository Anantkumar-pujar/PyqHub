// Toggle Forms
function toggleForm(showFormId, hideFormIds) {
    document.getElementById(showFormId).classList.remove('hidden');
    hideFormIds.forEach(id => document.getElementById(id).classList.add('hidden'));
}

// Add event listeners for toggling forms
document.getElementById('show-signup').addEventListener('click', () => {
    toggleForm('signup-form', ['login-form', 'forgot-password-form']);
});

document.getElementById('show-login').addEventListener('click', () => {
    toggleForm('login-form', ['signup-form', 'forgot-password-form']);
});

document.getElementById('forgot-password').addEventListener('click', () => {
    toggleForm('forgot-password-form', ['login-form', 'signup-form']);
});

document.getElementById('back-to-login').addEventListener('click', () => {
    toggleForm('login-form', ['forgot-password-form', 'signup-form']);
});

document.querySelector('form').addEventListener('submit', function(event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        event.preventDefault(); // Prevent form submission
        alert('Passwords do not match!');
    }
});