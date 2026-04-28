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
    const resistQuote = "\"El ciclo no se puede romper, porque ya fue escrito.\"";
    const fullHTML = prefixText + `<span class="glitch-resist">${resistQuote}</span>`;
    
    // Esperamos 2 segundos en lugar de 4 para que sea más inmediato tras revelarse el secreto
    await new Promise(r => setTimeout(r, 2000));
    
    while (p.closest('.folder').classList.contains('open')) {
        
        if (!p.closest('.folder').classList.contains('open')) break;

        // Efecto backspace simulando que el sistema intenta borrar el mensaje
        for (let i = resistQuote.length; i >= 0; i--) {
            if (!p.closest('.folder').classList.contains('open')) break;
            p.innerHTML = prefixText + resistQuote.substring(0, i) + '<span style="background:var(--text-main);color:var(--bg-color);">█</span>';
            await new Promise(r => setTimeout(r, 30));
        }

        if (!p.closest('.folder').classList.contains('open')) break;

        // Mensaje de error de Arytza
        await new Promise(r => setTimeout(r, 200));
        p.innerHTML = prefixText + '<span class="error-text">[ ERROR: ERROR DE PERSISTENCIA ]</span>';
        await new Promise(r => setTimeout(r, 1200));

        // El mensaje de AL-3 resiste y reaparece de golpe
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

// NUEVO: Subrutina de anomalía para revelar una carpeta oculta usando un botón
async function revealSecretFolder(btnElement, folderId, nextUrl) {
    // Prevenir que el usuario cliquee dos veces seguidas
    if (btnElement.dataset.glitching) return;
    btnElement.dataset.glitching = 'true';

    const originalText = btnElement.innerText;

    // 1. Efecto visual de Glitch en el botón
    btnElement.style.color = 'var(--alert-color)';
    btnElement.style.borderColor = 'var(--alert-color)';
    btnElement.style.textShadow = '0 0 8px var(--alert-color)';
    
    const glitchTexts = ["[ ! ] ANOMALÍA", "INTERCEPTANDO...", "[ ACCESO DENEGADO ]", "[ ARCHIVO RECUPERADO ]"];
    for(let i = 0; i < glitchTexts.length; i++) {
        btnElement.innerText = glitchTexts[i];
        await new Promise(r => setTimeout(r, 500));
    }

    // 2. Revelar la carpeta oculta
    const folder = document.getElementById(folderId);
    folder.style.display = 'block';

    // 3. Scrollear hacia la carpeta de manera suave
    folder.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 4. Abrirla automáticamente
    await new Promise(r => setTimeout(r, 600));
    toggleFolder(folderId);

    // 5. Restaurar el botón original, pero ahora sí apuntando a la próxima URL
    await new Promise(r => setTimeout(r, 1500));
    btnElement.style.color = '';
    btnElement.style.borderColor = '';
    btnElement.style.textShadow = '';
    btnElement.innerText = originalText;
    
    // Le quitamos el script de glitch y le ponemos el enlace real
    btnElement.onclick = null;
    if (nextUrl) {
        btnElement.href = nextUrl;
    }
}
