var componentId = 1;
var children = [];
var parent = -1;
var panels = [];
var kantTapes = [];
//var myModels = [];
var me = 0;
var objectTree = [];
var counter = 1;
var finished = false;
var branch = {};

function collectComponents() {
    panels = [];
    kantTapes = [];
    viewer.getObjectTree(function (objectTree) {
        tree = objectTree;
        tree.enumNodeChildren(1, (child) => {
            let childName = tree.getNodeName(child);
            if (childName == 'Solid1') {
                let parentNodeId = tree.getNodeParentId(child);
                let parentName = tree.getNodeName(parentNodeId);
                if (parentName.includes('Panel')) {
                    panels.push(child);
                }
                if (parentName.includes('ABS')) {
                    kantTapes.push(child);
                }
            }
        }, true);
    });
}

var tree; // the instance tree

async function applyColor() {

    /********************************************************
     * ovako je nekad bilo i ne radi
     * Po novom pokrenuće se workitem koji će uraditi primenu boja
     * ******************************************************
     * 
    let myMaterial = createMaterial(viewer, '#ff0000');
    setMaterial(viewer, myMaterial);
    viewer.getExtension('MaterialSwatchExtension', (materialSwatchExt) => {
        materialSwatchExt.applyPresetOnList(colorName, viewer.impl.get3DModels()[0], panels);
        viewer.impl.invalidate(true, true, true);
    });
    viewer.impl.invalidate(true, true, true);*/

    var jsonColorData = JSON.stringify({ 'InsideColor': insideColor, 'OutsideColor': outsideColor });
    sumOfElements = totalPanelNumber * 2;
    startWorkItem(jsonColorData, 'ColorizeCabinets', 'Applying colors...')
}
/**************************************************
 * Ova funkcija će dobro raditi za jednolične boje
 * pa zbvog toga je ostavljam a ako se desi da je korisnik izabrao dezen
 * onda mora da se radi preko forga
 * **********************************************/
function createMaterial(viewer, color) {
    let myMaterial;
    const textLoader = new THREE.TextureLoader();
    textLoader.load('/assets/images/Wood_025_SD/Wood_025_roughness.jpg',
        function () {
            myMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(color)
            });
            const materials = viewer.impl.matman();
            materials.addMaterial('CustomMaterial', myMaterial, true);
        },
        undefined,
        function (err) {
            console.log(err);
        }
    );
    return myMaterial;
}

function setMaterial(viewer, material) {
    const model = viewer.model;
    const tree = model.getInstanceTree();
    const frags = model.getFragmentList();
    const dbids = viewer.getSelection();
    for (const dbid of dbids) {
        tree.enumNodeFragments(dbid, (fragid) => {
            frags.setMaterial(fragid, material);
        });
    }
    model.unconsolidate(); // If the model is consolidated, material changes won't have any effect
}
