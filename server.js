const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const HISTORY_FILE = path.join(__dirname, 'history.json');

app.use(express.json());
app.use(express.static('public'));

// Asegurar que el archivo de historia existe
if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// Obtener historial
app.get('/api/history', (req, res) => {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    res.json(history);
});

app.post('/api/recipe', (req, res) => {
    const { ingredients, time } = req.body;

    if (!ingredients || !time) {
        return res.status(400).json({ error: 'Faltan ingredientes o tiempo.' });
    }

    const prompt = `Actúa como un chef experto y creativo. Genera una receta paso a paso usando estrictamente estos ingredientes: ${ingredients}. 
    Tiempo máximo: ${time}.

    DEBES seguir estrictamente esta estructura:
    1. Título atractivo con un emoji al inicio (ej: 🍲 Estofado de...).
    2. Sección '🛒 Ingredientes' con emojis.
    3. Sección '👨‍🍳 Preparación' con pasos numerados.
    4. Sección '✨ Tips del Chef' con un pequeño consejo.
    5. Sección '🍷 Maridaje Sugerido' donde recomiendes una bebida específica (un vino, una cerveza, un cóctel o un té) explicando por qué combina con los sabores del plato.

    Usa Markdown y asegúrate de que el tono sea profesional pero vibrante.`;

    // Escapar comillas para la terminal
    const safePrompt = prompt.replace(/"/g, '\\"');

    // Usamos npx @google/gemini-cli para mayor compatibilidad
    console.log(`\n👨‍🍳 Cocinando para: ${ingredients} (${time})`);
    
    exec(`npx @google/gemini-cli "${safePrompt}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`\n❌ ERROR AL EJECUTAR GEMINI-CLI:`);
            console.error(`Mensaje: ${error.message}`);
            return res.status(500).json({ error: 'El chef está ocupado o no se encuentra. Revisa la consola.' });
        }
        
        const recipe = stdout || "El chef no devolvió ninguna respuesta.";
        
        // Extraer título del Markdown (primer línea con # o primera línea no vacía)
        const titleMatch = recipe.match(/^#+\s*(.+)$/m) || recipe.match(/^(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : `Receta de ${ingredients.split(',')[0]}`;

        // Guardar en historial
        const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
        const newEntry = {
            id: Date.now(),
            title: title,
            ingredients: ingredients,
            time: time,
            content: recipe,
            date: new Date().toLocaleString()
        };
        
        history.unshift(newEntry);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(0, 10))); // Guardar solo las últimas 10

        res.json(newEntry);
    });
});

// Marcar/Desmarcar favorito
app.post('/api/favorite', (req, res) => {
    const { id } = req.body;
    let history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    history = history.map(item => {
        if (item.id == id) item.favorite = !item.favorite;
        return item;
    });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
    res.json({ success: true });
});

// Borrar historial completo
app.post('/api/clear-history', (req, res) => {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
        console.log('🗑️  HISTORIAL ELIMINADO TOTALMENTE POR EL USUARIO');
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error al borrar historial:', err);
        res.status(500).json({ error: 'No se pudo borrar el archivo físico.' });
    }
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`👨‍🍳 Chef-Web v2.0 - ¡Ahora con historial!`);
    console.log(`🌐 Abre tu navegador en: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
