const editBox = document.getElementById('edit-box');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let imagePresent;
let image = new Image();
let initialImage = new Image();
let isSelecting;
let isAreaSelected;
let startX, startY, endX, endY;
let scale = 1;

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

editBox.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            image.src = event.target.result;
            initialImage.src = event.target.result;
            
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
        imagePresent = true;
    } else {
        alert("Incarca o poza!");
    }
}

document.getElementById('select-button').addEventListener('click', () => {
    if (imagePresent) {
        canvas.addEventListener('mousedown', startSelection);
        canvas.addEventListener('mousemove', updateSelection);
        canvas.addEventListener('mouseup', finishSelection);
    } else {
        alert("Nicio imagine nu este incarcata pentru a face selectia.");
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
    if (!imagePresent) {
        alert('Imaginea nu poate fi marita.');
        return;
    }
    scale += 0.1; 
    updateImageScale();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (!imagePresent) {
        alert('Imaginea nu poate fi micsorata.');
        return;
    }
    if (scale >= 0.2) {
        scale -= 0.1; 
        updateImageScale();
    }
});

function updateImageScale() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);  
}

document.getElementById('crop-button').addEventListener('click', cropSelection);

function cropSelection() {
    if (!isAreaSelected) {
        alert("Nu este selectata nicio zona pentru decupare.");
        return;
    }

    const cropWidth = endX - startX - 4;
    const cropHeight = endY - startY - 4;
    startX += 2;
    startY += 2;

    if (cropWidth <= 0 || cropHeight <= 0) {
        alert("Dimensiunile selectiei sunt invalide.");
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

document.getElementById('reset-button').addEventListener('click', resetImage);

function resetImage() {
    if (!imagePresent) {
        alert('Nu exista nicio imagine de resetat.');
        return;
    }

    canvas.width = initialImage.width;
    canvas.height = initialImage.height;
    image.src = initialImage.src; 
    scale = 1; 
    context.drawImage(image, 0, 0); 
}

document.getElementById('save-button').addEventListener('click', saveImage);

function saveImage() {
    if (!imagePresent) {
        alert('Nu exista nicio imagine de salvat.');
        return;
    }

    const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = initialImage.width;
        tempCanvas.height = initialImage.height;
        tempContext.drawImage(image, 0, 0, initialImage.width, initialImage.height);
        
        tempCanvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = '';
            link.click();
        }, 'image/png'); 
}