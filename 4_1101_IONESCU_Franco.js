const editBox = document.getElementById('edit-box');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let imaginePrezenta;
let image = new Image();
let imagineInitiala = new Image();
let isSelecting;
let isAreaSelected;
let startX, startY, endX, endY;
let scala = 1;
let adaugareText = false;

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    editBox.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    editBox.addEventListener(eventName, () => {
        editBox.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    editBox.addEventListener(eventName, () => {
        editBox.classList.remove('drag-over');
    });
});

editBox.addEventListener('drop', gestioneazaImagine, false);

function gestioneazaImagine(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            image.src = event.target.result;
            imagineInitiala.src = event.target.result;
            
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                document.getElementById('drag-drop-text').classList.add('ascundere-text')
            };
            editBox.style.border = 'none';

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                editBox.removeEventListener(eventName, preventDefaults, false);
            });

            editBox.classList.remove('drag-over');
        };
        
        reader.readAsDataURL(file);
        imaginePrezenta = true;
    } else {
        alert("Incarca o poza!");
    }
}

document.getElementById('select-button').addEventListener('click', () => {
    if (imaginePrezenta) {
        canvas.addEventListener('mousedown', startSelection);
        canvas.addEventListener('mousemove', updateSelection);
        canvas.addEventListener('mouseup', finishSelection);
    } else {
        alert("Nicio imagine nu este încărcată pentru a face selecția.");
    }
});

function startSelection(e) {
    isSelecting = true;
    startX = e.offsetX;
    startY = e.offsetY;
    endX = startX;
    endY = startY;
}

function updateSelection(e) {
    if (!isSelecting) return;

    endX = e.offsetX;
    endY = e.offsetY;
    drawSelection();
}

function finishSelection() {
    isSelecting = false;
    canvas.removeEventListener('mousedown', startSelection);
    canvas.removeEventListener('mousemove', updateSelection);
    canvas.removeEventListener('mouseup', finishSelection);
    isAreaSelected = true;
}

function drawSelection() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.strokeRect(startX, startY, endX - startX, endY - startY);
    
}

document.getElementById('zoom-in').addEventListener('click', () => {
    if (!imaginePrezenta) {
        alert('Imaginea nu poate fi marita.');
        return;
    }
    scala += 0.1; 
    updateImageScale();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (!imaginePrezenta) {
        alert('Imaginea nu poate fi micsorata.');
        return;
    }
    if (scala >= 0.2) {
        scala -= 0.1; 
        updateImageScale();
    }
});

function updateImageScale() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width * scala;
    canvas.height = image.height * scala;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);  
}

document.getElementById('crop-button').addEventListener('click', cropSelection);

function cropSelection() {
    if (!isAreaSelected) {
        alert("Nu este selectată nicio zonă pentru decupare.");
        return;
    }

    const cropWidth = endX - startX - 4;
    const cropHeight = endY - startY - 4;
    startX += 2;
    startY += 2;

    if (cropWidth <= 0 || cropHeight <= 0) {
        alert("Dimensiunile selecției sunt invalide.");
        return;
    }

    const imageData = context.getImageData(startX, startY, cropWidth, cropHeight);

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(imageData, 0, 0);

    image.src = canvas.toDataURL();

    isAreaSelected = false;
    startX = startY = endX = endY = 0;
}

document.getElementById('buton-delete').addEventListener('click', stergereImagine);

function stergereImagine() {
    if (!imaginePrezenta) {
        alert("Nu exista o imagine incarcata.");
        return;
    }

    let x, y, width, height;

    if (isAreaSelected) {
        x = startX - 2;
        y = startY - 2;
        width = endX - startX + 4;
        height = endY - startY + 4;

        if (width <= 0 || height <= 0) {
            alert("Dimensiunile selecției sunt invalide.");
            return;
        }
    } else {
        x = 0;
        y = 0;
        width = canvas.width;
        height = canvas.height;
    }

    context.fillStyle = 'white';
    context.fillRect(x, y, width, height);

    image.src = canvas.toDataURL();

    isAreaSelected = false;
    drawSelection();
}

document.getElementById('buton-alb-negru').addEventListener('click', filtruAlbNegru);

function filtruAlbNegru() {
    if (!imaginePrezenta) {
        alert('Nu exista o imagine incarcata.');
        return;
    }

    let x, y, width, height;

    if (isAreaSelected) {
        x = startX;
        y = startY;
        width = endX - startX;
        height = endY - startY;

        if (width <= 0 || height <= 0) {
            alert("Dimensiunile selecției sunt invalide.");
            return;
        }
    } else {
        x = 0;
        y = 0;
        width = canvas.width;
        height = canvas.height;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(x, y, width, height); 
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];  
        const g = data[i + 1];   
        const b = data[i + 2];  

        const gray = 0.3 * r + 0.59 * g + 0.11 * b;

        data[i] = data[i + 1] = data[i + 2] = gray; 
    }

    context.putImageData(imageData, x, y);
    image.src = canvas.toDataURL();

    if (isAreaSelected) {
        isAreaSelected = false;
        startX = startY = endX = endY = 0;
    }
}

document.getElementById('buton-threshold').addEventListener('click', filtruThreshold);

function filtruThreshold() {
    if (!imaginePrezenta) {
        alert('Nu exista o imagine incarcata.');
        return;
    }

    let x, y, width, height;
    const threshold = 128; 

    if (isAreaSelected) {
        x = startX;
        y = startY;
        width = endX - startX;
        height = endY - startY;

        if (width <= 0 || height <= 0) {
            alert("Dimensiunile selecției sunt invalide.");
            return;
        }
    } else {
        x = 0;
        y = 0;
        width = canvas.width;
        height = canvas.height;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(x, y, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];  
        const g = data[i + 1]; 
        const b = data[i + 2];

        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        const value = gray >= threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    context.putImageData(imageData, x, y);
    image.src = canvas.toDataURL();

    if (isAreaSelected) {
        isAreaSelected = false;
        startX = startY = endX = endY = 0;
    }
}

document.getElementById('buton-inversare-culori').addEventListener('click', filtruInversareCulori);

function filtruInversareCulori() {
    if (!imagineInitiala) {
        alert('Nu exista o imagine incarcata.');
        return;
    }

    let x, y, width, height;

    if (isAreaSelected) {
        x = startX;
        y = startY;
        width = endX - startX;
        height = endY - startY;

        if (width <= 0 || height <= 0) {
            alert("Dimensiunile selecției sunt invalide.");
            return;
        }
    } else {
        x = 0;
        y = 0;
        width = canvas.width;
        height = canvas.height;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(x, y, width, height); 
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];  
        data[i + 1] = 255 - data[i + 1]; 
        data[i + 2] = 255 - data[i + 2]; 
    }

    context.putImageData(imageData, x, y);
    image.src = canvas.toDataURL(); 

    if (isAreaSelected) {
        isAreaSelected = false;
        startX = startY = endX = endY = 0;
    }
}

document.getElementById('buton-sepia').addEventListener('click', filtruSepia);

function filtruSepia() {
    if (!imagineInitiala) {
        alert('Nu exista o imagine incarcata.');
        return;
    }

    let x, y, width, height;

    if (isAreaSelected) {
        x = startX;
        y = startY;
        width = endX - startX;
        height = endY - startY;

        if (width <= 0 || height <= 0) {
            alert("Dimensiunile selecției sunt invalide.");
            return;
        }
    } else {
        x = 0;
        y = 0;
        width = canvas.width;
        height = canvas.height;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(x, y, width, height); 
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];    
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = 0.393 * r + 0.769 * g + 0.189 * b;      
        data[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;   
        data[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b; 
    }

    context.putImageData(imageData, x, y);
    image.src = canvas.toDataURL(); 

    if (isAreaSelected) {
        isAreaSelected = false;
        startX = startY = endX = endY = 0;
    }
}

document.getElementById('buton-pixelat').addEventListener('click', filtruPixelat);

function filtruPixelat() {
    if (!imagineInitiala) {
        alert('Nu exista o imagine incarcata.');
        return;
    }

    let x, y, width, height, dimensiunePixel = 10;

    if (isAreaSelected) {
        x = startX;
        y = startY;
        width = endX - startX;
        height = endY - startY;

        if (width <= 0 || height <= 0) {
            alert("Dimensiunile selecției sunt invalide.");
            return;
        }
    } else {
        x = 0;
        y = 0;
        width = canvas.width;
        height = canvas.height;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(x, y, width, height);
    const data = imageData.data;

    for (let py = 0; py < height; py += dimensiunePixel) {
        for (let px = 0; px < width; px += dimensiunePixel) {
            const pixelIndex = ((py * width) + px) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];

            for (let dy = 0; dy < dimensiunePixel; dy++) {
                for (let dx = 0; dx < dimensiunePixel; dx++) {
                    const index = (((py + dy) * width) + (px + dx)) * 4;
                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                }
            }
        }
    }

    context.putImageData(imageData, x, y);
    image.src = canvas.toDataURL();

    if (isAreaSelected) {
        isAreaSelected = false;
        startX = startY = endX = endY = 0;
    }
}

document.getElementById('buton-text').addEventListener('click', () => {
    adaugareText = true;
});

canvas.addEventListener('click', (event) => {
    if (adaugareText) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top + 5;

        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.top = `${event.clientY - 10}px`;
        input.style.left = `${event.clientX}px`;

        document.body.appendChild(input);
        input.focus();

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const textSizeInput = document.getElementById('dimensiune-text');
                const textColorInput = document.getElementById('culoare-text');
                const text = input.value;
                const fontSize = parseInt(textSizeInput.value, 10);
                const textColor = textColorInput.value;
                context.font = `${fontSize}px Arial`;
                context.fillStyle = textColor; 
                context.fillText(text, x, y); 

                document.body.removeChild(input); 
                adaugareText = false;
                image.src = canvas.toDataURL();
            }
        });
        adaugareText = false;
    }
});

document.getElementById('reset-button').addEventListener('click', resetImage);

function resetImage() {
    if (!imaginePrezenta) {
        alert('Nu exista nicio imagine de resetat.');
        return;
    }

    canvas.width = imagineInitiala.width;
    canvas.height = imagineInitiala.height;
    image.src = imagineInitiala.src; 
    scala = 1; 
    context.drawImage(image, 0, 0); 
}

document.getElementById('save-button').addEventListener('click', saveImage);

function saveImage() {
    if (!imaginePrezenta) {
        alert('Nu exista nicio imagine de salvat.');
        return;
    }

    const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        tempContext.drawImage(image, 0, 0, image.width, image.height);
        
        tempCanvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = '';
            link.click();
        }, 'image/png'); 
}