const editBox = document.getElementById('edit-box');
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
            editBox.innerHTML = `<img id="imagine" src="${event.target.result}">`;
            editBox.style.border = 'none';

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                editBox.removeEventListener(eventName, preventDefaults, false);
            });

            editBox.classList.remove('drag-over');
        };
        
        reader.readAsDataURL(file);
    } else {
        alert("Incarca o poza!");
    }
}


document.getElementById('zoom-in').addEventListener('click', () => {
    scale += 0.05; 
    updateImageScale();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    scale -= 0.05; 
    updateImageScale();
});

function updateImageScale() {
    const image = document.getElementById('imagine'); 
    if (image) {
        image.style.transform = `scale(${scale})`; 
        //image.style.transformOrigin = 'top left'; // Focalizarea zoom-ului în colțul stâng sus
    }
}

document.getElementById('save-button').addEventListener('click', saveImage);

function saveImage() {
    const image = document.getElementById('imagine');
    if (!image) {
        alert("Nu există nicio imagine de salvat.");
        return;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    context.drawImage(image, 0, 0);

    canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '';
        link.click();
    }, 'image/png'); 
}