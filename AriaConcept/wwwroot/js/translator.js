var viewer;
initViewer(document.getElementById('preview')).then(forgeViewer => {
    viewer = forgeViewer;
});

async function setupModelSelection(viewer, selectedUrn) {
    const dropdown = document.getElementById('models');
    dropdown.innerHTML = '';
    try {
        const resp = await fetch('/api/derivative');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const models = await resp.json();

        dropdown.innerHTML = models.map(model => `<option value=${model.urn} ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`).join('\n');
        dropdown.onchange = () => onModelSelected(viewer, dropdown.value);
        if (dropdown.value) {
            onModelSelected(viewer, dropdown.value);
        }
    } catch (err) {
        alert('Could not list models. See the console for more details.');
        console.error(err);
    }
}

async function translateSelectedModel(viewer, urn) {
    let data = new FormData();
    data.append('model-id', 'id');
    data.append('model-urn', urn);
    data.append('model-zip-entrypoint', 'CustomCabinets.iam');
    try {
        const resp = await fetch('/api/derivative', { method: 'POST', body: data });
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        onModelSelected(viewer, urn);
    } catch (err) {
        alert(`Could not translate model. See the console for more details.`);
        console.error(err);
    } finally {
        clearNotification();
    }
}

async function onModelSelected(viewer, urn) {
    if (window.onModelSelectedTimeout) {
        clearTimeout(window.onModelSelectedTimeout);
        delete window.onModelSelectedTimeout;
    }
    window.location.hash = urn;
    try {
        const resp = await fetch(`/api/derivative/${urn}/status`);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const status = await resp.json();
        switch (status.status) {
            case 'n/a':
                showNotification(`Model has not been translated. Translation in progress.`);
                translateSelectedModel(viewer, urn);
                break;
            case 'inprogress':
            case 'pending':
                showNotification(`Model is being translated (${status.progress})...`);
                window.onModelSelectedTimeout = setTimeout(onModelSelected, 2000, viewer, urn);
                break;
            case 'success':
                clearNotification();
                myPopupWindow = document.getElementById('overlay');
                myPopupWindow.style.display = 'none';
                const xform = new THREE.Matrix4().makeTranslation(0, 0, 0);
                loadModel(viewer, urn, xform, false);
                break;
            case 'failed':
            case 'timeout':
            default:
                showNotification(`Translation failed. <ul>${status.messages.map(msg => `<li>${JSON.stringify(msg)}</li>`).join('')}</ul>`);
                break;
        }
    } catch (err) {
        alert('Could not load model. See the console for more details.');
        console.error(err);
    }
}
function showNotification(message) {
    const infoContent = document.getElementById('infoContent');
    infoContent.innerHTML = `<div class="notification">${message}</div>`;
    infoContent.style.display = 'flex';
}
function clearNotification() {
    const infoContent = document.getElementById('infoContent');
    infoContent.innerHTML = '';
}