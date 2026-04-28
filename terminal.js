// Función global para abrir o contraer la carpeta y animar la terminal
async function toggleFolder(folderId) {
    const folder = document.getElementById(folderId);
    const content = document.getElementById('c-' + folderId);

    if (folder.classList.contains('open')) {
        folder.classList.remove('open');
        return;
    }

    folder.classList.add('open');

    if (!folder.dataset.loaded) {
        folder.dataset.loaded = 'true'; 
        // Ahora lee el registro de datos directamente desde el HTML que lo llama
        const lines = window.registryData[folderId] || [];
        
        for (let i = 0; i < lines.length; i++) {
            let rawText = lines[i];
            const p = document.createElement('p');
            let textToType = rawText;
            let prefixHTML = ""; 

            if (rawText.startsWith('|cls|')) {
                const parts = rawText.split('|'); 
                p.classList.add(parts[2]);
                textToType = parts[3];
            } else if (rawText.startsWith('|spk|')) {
                const parts = rawText.split('|'); 
                // Se guarda la estructura del speaker con formato HTML
                prefixHTML = `<span class="dialogue-speaker">${parts[2]} </span>`;
                textToType = parts[3];
            }

            content.appendChild(p);

            let currentLineHTML = prefixHTML; 
            
            for (let j = 0; j < textToType.length; j++) {
                if (textToType.charAt(j) === '<') {
                    let tag = '';
                    while (textToType.charAt(j) !== '>' && j < textToType.length) {
                        tag += textToType.charAt(j);
                        j++;
                    }
                    tag += '>';
                    currentLineHTML += tag;
                    p.innerHTML = currentLineHTML;
                    continue;
                }
                
                currentLineHTML += textToType.charAt(j);
                p.innerHTML = currentLineHTML;
                await new Promise(r => setTimeout(r, 5));
            }
            
            await new Promise(r => setTimeout(r, 40));
        }
    }

    // Disparamos la animación especial SÓLO si es la carpeta oculta de resistencia
    if (folderId === 'f-remanente') {
        const p = content.lastElementChild;
        if (p && !p.dataset.animating) {
            p.dataset.animating = 'true';
            runResistAnimation(p);
        }
    }
}

// Subrutina para la animación de borrado de la terminal y resistencia
async function runResistAnimation(p) {
    const prefixText = " 🔹 Contenido: ";
    const resistQuote = "\"El ciclo no puede romperse porque ya fue escrito.\"";
    const fullHTML = prefixText + `<span class="glitch-resist">${resistQuote}</span>`;
    
    while (p.closest('.folder').classList.contains('open')) {
        // Esperamos 4 segundos
        await new Promise(r => setTimeout(r, 4000));
        
        if (!p.closest('.folder').classList.contains('open')) break;

        // Efecto backspace
        for (let i = resistQuote.length; i >= 0; i--) {
            if (!p.closest('.folder').classList.contains('open')) break;
            p.innerHTML = prefixText + resistQuote.substring(0, i) + '<span style="background:var(--text-main);color:var(--bg-color);">█</span>';
            await new Promise(r => setTimeout(r, 30));
        }

        if (!p.closest('.folder').classList.contains('open')) break;

        await new Promise(r => setTimeout(r, 200));
        p.innerHTML = prefixText + '<span class="error-text">[ ERROR: ARCHIVO PROTEGIDO POR LA ARQUITECTA ]</span>';
        await new Promise(r => setTimeout(r, 1200));

        // Restaura de golpe
        p.innerHTML = fullHTML;
        p.style.color = 'var(--alert-color)';
        p.style.textShadow = '0 0 10px var(--alert-color)';
        await new Promise(r => setTimeout(r, 200));
        
        p.style.color = '';
        p.style.textShadow = '';

        await new Promise(r => setTimeout(r, 6000));
    }
    
    p.dataset.animating = '';
    p.innerHTML = fullHTML;
}
