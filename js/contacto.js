const form = document.getElementById('contactForm');
const messageDiv = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // Obtener datos del formulario
    const formData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        asunto: document.getElementById('asunto').value,
        mensaje: document.getElementById('mensaje').value
    };

    try {
        // Aquí integrarías tu servicio de email
        const response = await fetch(`${API_URL}/api/contacto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('¡Mensaje enviado con éxito! Te responderemos pronto.', 'success');
            form.reset();
        } else {
            throw new Error('Error al enviar');
        }
    } catch (error) {
        showMessage('Hubo un error al enviar el mensaje. Por favor, intenta de nuevo.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Mensaje';
    }
});

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;

    // Scroll al mensaje
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Ocultar después de 5 segundos
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}