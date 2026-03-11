document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recipe-form');
    const loading = document.getElementById('loading');
    const recipeContainer = document.getElementById('recipe-container');
    const recipeContent = document.getElementById('recipe-content');
    const restartBtn = document.getElementById('restart-btn');
    const downloadTxtBtn = document.getElementById('download-txt-btn');
    const printBtn = document.getElementById('print-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const historyList = document.getElementById('history-list');
    const stampContainer = document.getElementById('stamp-container');
    const stampDate = document.getElementById('stamp-date');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const notificationContainer = document.getElementById('notification-container');
    
    // Elementos del Modal
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    let currentRecipe = null;
    let currentRecipeMarkdown = '';
    let onModalConfirm = null;

    // SISTEMA DE NOTIFICACIONES AESTHETIC
    function showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerText = message;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            notification.addEventListener('animationend', () => notification.remove());
        }, duration);
    }

    // SISTEMA DE MODAL PERSONALIZADA
    function showConfirm(callback) {
        onModalConfirm = callback;
        modalBackdrop.classList.remove('hidden');
    }

    modalCancelBtn.addEventListener('click', () => {
        modalBackdrop.classList.add('hidden');
        onModalConfirm = null;
    });

    modalConfirmBtn.addEventListener('click', () => {
        if (onModalConfirm) onModalConfirm();
        modalBackdrop.classList.add('hidden');
        onModalConfirm = null;
    });

    // Lógica para borrar historial
    clearHistoryBtn.addEventListener('click', () => {
        showConfirm(async () => {
            try {
                const response = await fetch('/api/clear-history', { method: 'POST' });
                if (response.ok) {
                    // Limpieza inmediata visual
                    historyList.innerHTML = '<p class="empty-msg">No hay recetas recientes</p>';
                    recipeContainer.classList.add('hidden');
                    form.classList.remove('hidden');
                    showNotification('📋 Historial borrado definitivamente.', 'success');
                    
                    // Recargar historial del servidor para confirmar sincronización
                    loadHistory();
                }
            } catch (err) {
                showNotification('❌ Error al intentar borrar el archivo.', 'error');
            }
        });
    });

    // Cargar historial al iniciar
    loadHistory();

    async function loadHistory() {
        try {
            const response = await fetch('/api/history');
            const history = await response.json();
            
            if (history.length === 0) {
                historyList.innerHTML = '<p class="empty-msg">No hay recetas recientes</p>';
                return;
            }

            historyList.innerHTML = history.map(item => `
                <div class="history-item ${item.favorite ? 'is-favorite' : ''}" data-id="${item.id}">
                    <h3>${item.favorite ? '⭐ ' : ''}${item.title}</h3>
                    <p>${item.ingredients}</p>
                    <p><small>${item.date}</small></p>
                </div>
            `).join('');

            document.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    const recipe = history.find(r => r.id == id);
                    showRecipe(recipe);
                });
            });
        } catch (err) {
            console.error('Error al cargar historial:', err);
        }
    }

    function showRecipe(recipe, animateStamp = false) {
        currentRecipe = recipe;
        currentRecipeMarkdown = recipe.content;
        recipeContent.innerHTML = marked.parse(recipe.content);
        
        if (recipe.favorite) {
            stampContainer.classList.remove('hidden');
            stampDate.innerText = recipe.date.split(',')[0];
            favoriteBtn.classList.add('active');
            favoriteBtn.innerText = '⭐ Favorito';
        } else {
            stampContainer.classList.add('hidden');
            favoriteBtn.classList.remove('active');
            favoriteBtn.innerText = '☆ Favorito';
        }

        if (animateStamp) {
            stampContainer.classList.remove('hidden');
            stampDate.innerText = new Date().toLocaleDateString();
        }

        form.classList.add('hidden');
        loading.classList.add('hidden');
        recipeContainer.classList.remove('hidden');
        recipeContainer.scrollIntoView({ behavior: 'smooth' });
    }

    favoriteBtn.addEventListener('click', async () => {
        if (!currentRecipe) return;

        try {
            const response = await fetch('/api/favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentRecipe.id })
            });

            if (response.ok) {
                currentRecipe.favorite = !currentRecipe.favorite;
                showRecipe(currentRecipe);
                loadHistory();
                showNotification(currentRecipe.favorite ? '✨ Receta guardada en favoritos.' : '💨 Receta eliminada de favoritos.', 'info');
            }
        } catch (err) {
            showNotification('❌ Problema al actualizar favoritos.', 'error');
        }
    });

    downloadTxtBtn.addEventListener('click', () => {
        const blob = new Blob([currentRecipeMarkdown], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const title = document.querySelector('#recipe-content h1')?.innerText || 'Receta';
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('📥 Archivo .txt generado con éxito.', 'success');
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const ingredients = document.getElementById('ingredients').value.trim();
        const time = document.getElementById('time').value.trim();

        if (!ingredients || !time) return;

        form.classList.add('hidden');
        recipeContainer.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const response = await fetch('/api/recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, time })
            });

            const data = await response.json();

            if (response.ok) {
                showRecipe(data, true);
                loadHistory();
                showNotification('✨ Receta entregada por el Chef.', 'success');
            } else {
                throw new Error(data.error || 'Error al conectar con el chef');
            }
        } catch (error) {
            loading.classList.add('hidden');
            form.classList.remove('hidden');
            showNotification(`Oops! ${error.message}`, 'error');
        }
    });

    restartBtn.addEventListener('click', () => {
        recipeContainer.classList.add('hidden');
        form.classList.remove('hidden');
        document.getElementById('ingredients').value = '';
        document.getElementById('time').value = '';
        document.getElementById('ingredients').focus();
    });
});
