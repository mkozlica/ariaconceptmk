/// import * as Autodesk from "@types/forge-viewer";

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/api/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);
    }
}
//, 'MaterialSwatchExtensionUI'
function initViewer(container) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, function () {
            const config = {
                extensions: ['MaterialSwatchExtension'],
                theme: 'light-theme',
                profileSettings: {
                    name: "niceSetting",
                    settings: {
                        ambientShadows: false,
                        lightPreset: 'Photo Booth',
                        envMapBackground: false
                    }
                }
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            resolve(viewer);
        });
    });
}

function loadModel(viewer, urn, xform, keepModels) {
    return new Promise(function (resolve, reject) {
        function onDocumentLoadSuccess(doc) {
            const viewable = doc.getRoot().getDefaultGeometry();
            const options = {
                preserveView: true,
                keepCurrentModels: keepModels,
                placementTransform: xform,
                globalOffset: { x: 0, y: 0, z: 0 }
            };
            viewer.loadDocumentNode(doc, viewable, options).then(model => resolve(model)).then(() => collectComponents()).catch(reject);
            viewer.setViewFromArray([245, 153, 360, 30, 120, 32, 0, 1, 0, 0.874, 0.7854, undefined, 0]);

        }
        function onDocumentLoadFailure(code, message, errors) {
            reject({ code, message, errors });
        }
        viewer.setLightPreset(4); // Photo Booth
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function unloadModel(viewer, manifestNode) {
    return new Promise(function (resolve, reject) {
        viewer.unloadModel(manifestNode).then(resolve).catch(reject);
    });
}