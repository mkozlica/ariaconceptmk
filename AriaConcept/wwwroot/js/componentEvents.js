let modulesNumber = 0;
var myWardrobe = [];
var inputRange = {};
var i = 1;

function moduleWidthChanged() {
    //let sum = sumirazeAllModulesWidth() + getCoverWidth();
    //setValueIn(sum, 'totalWidth');
    //globalWidthChanged();
}
function globalWidthChanged() {
    validateWidth();
    let compensation = getCoverWidth();
    let globalWidth = parseFloat(getValueFrom('totalWidth')) - compensation;
    let sum = sumirazeAllModulesWidth();
    let coeff = globalWidth / sum;
    for (var i = 0; i < myWardrobe.length; i++) {
        var moduleWidth = myWardrobe[i].width;
        let newWidth = formatValue(moduleWidth * coeff);
        if (newWidth > 75.0) {
            newWidth = 75.0;
        }
        let minModuleWidth = getMinModuleWidth(myWardrobe[i].type);
        if (newWidth < minModuleWidth) {
            newWidth = minModuleWidth;
        }
        myWardrobe[i].width = newWidth;
    }
    //setValueIn(sumirazeAllModulesWidth() + compensation, 'totalWidth');
}
function frameChanged(config) {
    moduleWidthChanged();
    var selectedCoverPrice = document.getElementById('moduleCoverPrice');
    if (selectedCoverPrice) {
        selectedCoverPrice.innerHTML = '<p>price for cover ' + coverPrice(config) + '</p>';
    } else {
        var choosenModules = document.getElementById('myChoosenModules');
        const node = document.createElement('div');
        node.setAttribute('id', 'moduleCoverPrice');
        node.setAttribute('class', 'modulePrices');
        node.innerHTML = '<p>price for cover ' + coverPrice(config) + '</p>';
        choosenModules.appendChild(node);
    }
}
function sumirazeAllModulesWidth() {
    let sum = 0.0;
    for (var i = 0; i < myWardrobe.length; i++) {
        sum += myWardrobe[i].width;
    }
    return sum;
}
//TODO - ako ukrasne lajsne preklapaju zid onda je ovo dobra računica, ali ako ne onda se moraju dodati njihove širine
function getCoverWidth() {
    if (fromWallToWall) {
        return leftMask + rightMask;
    }
    if (fromWall) {
        return leftMask + coveringPanelThk;
    }
    if (toWall) {
        return rightMask + coveringPanelThk
    }
    return 2 * coveringPanelThk;
}
function createModuleObject(moduleType) {
    let moduleHeigth = totalHeight - legHeight - topMask;
    if (moduleHeigth > maxModulHeight) {
        moduleHeigth = maxModulHeight;
    }
    var shelfNumber = getShelfNumbers(moduleType, moduleHeigth)
    setShelfValuesInRange(shelfNumber);

    var moduleObject = {
        type: moduleType,
        width: minimum(maximum(getMinModuleWidth(moduleType), getAllowedModuleWidth()), 75),
        totalHeight: totalHeight,
        heigth: moduleHeigth,
        minShelfQty: inputRange.value,
        shelfQty: inputRange.value,
        maxShelfQty: shelfNumber[1],
        useShelfRange: !inputRange.disabled,
        doorType: 1,
        urn: '',
        guid: '',
        forgeModel: {}
    };
    return moduleObject;
}
function minimum(a, b) {
    if (a <= b) {
        return a;
    }
    else {
        return b;
    }
}
function maximum(a, b) {
    if (a >= b) {
        return a;
    }
    else {
        return b;
    }
}
function canCreate(moduleType) {
    var minValue = getMinModuleWidth(moduleType);
    var allowedValue = getAllowedModuleWidth();
    if (allowedValue < minValue) {
        return false;
    }
    return true;
}
function getAllowedModuleWidth() {
    return overallWidth - (sumirazeAllModulesWidth() + getCoverWidth());
}
function removeModule(guid) {
    var counter = 0;
    for (var module of myWardrobe) {
        if (module.guid == guid) {
            unloadModel(viewer, myWardrobe[counter].forgeModel);
            break;
        }
        counter++;
    }
    myWardrobe.splice(counter, 1);
    for (var i = counter; i < myWardrobe.length; i++) {
        let tr = myWardrobe[i].forgeModel.getPlacementTransform();
        tr.elements[12] -= 50;
        myWardrobe[i].forgeModel.setPlacementTransform(tr);
        viewer.impl.invalidate(true, true, true);
    }
    translation -= 50;
}
var translation = 0;
function addModule(moduleType) {
    if (canCreate(moduleType)) {
        //TODO - add forge model in viewer
        var moduleObject = createModuleObject(moduleType);
        var moduleCost = totalModulePrice(moduleObject, false, false, 0, 0);
        var moduleTotalHeight = moduleObject.totalHeight;
        var moduleShelfQty = moduleObject.shelfQty;
        var urnIndex = getUrnIndex(moduleTotalHeight);
        var translatedModule = translatedModules[urnIndex];
        moduleObject.urn = searchForUrn(translatedModule, moduleType, moduleShelfQty);
        loadModel(viewer, moduleObject.urn, getPosition(translation), true).then(docNode => moduleObject.forgeModel = docNode);
        myWardrobe.push(moduleObject);
        translation = translation + 50;// moduleObject.width;
        var choosenModules = document.getElementById('myChoosenModules');
        const node = document.createElement('div');
        const moduleGuid = crypto.randomUUID();
        moduleObject.guid = moduleGuid;
        node.setAttribute('id', moduleGuid)
        node.innerHTML = '<span>' + moduleType + '</span><button class="btn btn-danger" type="button" onclick="unloadSelectedModel(this)">Delete</button><span data-price="modules"> ' + moduleCost + ' EUR</span>';
        choosenModules.appendChild(node);
        return;
    }
    var space = overallWidth - getCoverWidth();
    var presumedWidth = Math.floor(space * 10.0 / (myWardrobe.length + 1)) / 10.0;
    var canCreateNewConfig = canCreateConfig(moduleType, presumedWidth);
    if (canCreateNewConfig) {
        for (var i = 0; i < myWardrobe.length; i++) {
            myWardrobe[i].width = minimum(maximum(getMinModuleWidth(moduleType), presumedWidth), 75);
        }
        addModule(moduleType);
        return;
    }
    alertUser();
}
function canCreateConfig(moduleType, presumedWidth) {
    var canAccept = true;
    for (var i = 0; i < myWardrobe.length; i++) {
        canAccept = canAccept && testCanCreate(myWardrobe[i].type, presumedWidth);
    }
    return canAccept && testCanCreate(moduleType, presumedWidth);
}
function testCanCreate(moduleType, presumedWidth) {
    var minValue = getMinModuleWidth(moduleType);
    var allowedValue = presumedWidth;
    if (allowedValue < minValue) {
        return false;
    }
    return true;
}
function getPosition(x) {
    const xform = new THREE.Matrix4().makeTranslation(x, 0, 0);
    return xform;
}
function getOffset(x) {
    const offset = new THREE.Vector3(x, 0, 0);
    return offset;
}
function searchForUrn(translatedModule, moduleType, moduleShelfQty) {
    for (var item of translatedModule.items) {
        if (item.type == moduleType && item.shelfs == moduleShelfQty) {
            return item.urn;
        }
    }
    return '';
}
function getUrnIndex(moduleTotalHeight) {
    if (moduleTotalHeight <= 176) {
        return 0;
    }
    else if (moduleTotalHeight <= 187) {
        return 1;
    }
    else if (moduleTotalHeight <= 198) {
        return 2;
    }
    else if (moduleTotalHeight <= 209) {
        return 3;
    }
    else if (moduleTotalHeight <= 218) {
        return 4;
    }
    else if (moduleTotalHeight <= 230) {
        return 5;
    }
    else if (moduleTotalHeight <= 242) {
        return 6;
    }
    else {
        return 7;
    }
}
function alertUser() {
    alert("Space is not sufficient for creation. Please edit width of existing modules.");
}
function formatValue(inputValue) {
    let outputValue = Math.round(inputValue * 10) / 10;
    return outputValue;
}
function validateWidth() {
    let newWidth = parseFloat(getValueFrom('totalWidth'));
    let needInfo = false;
    if (newWidth > 458) {
        newWidth = 458;
        needInfo = true;
    }
    if (needInfo) {
        alert('maximum width is 458 cm!');
        setValueIn(formatValue(newWidth), 'totalWidth');
    }
}
function validateDepth() {
    let newDepth = parseFloat(getValueFrom('totalDepth'));
    let needInfo = false;
    for (var i = 1; i <= modulesNumber; i++) {
        let moduleType = getSelectedType('module' + i);
        let minModuleDepth = getMinModuleDepth(moduleType);
        if (newDepth < minModuleDepth) {
            newDepth = minModuleDepth;
            needInfo = true;
            // TODO : tip elementa može biti sačuvan u nizu i posle prikazan u obaveštenju
        }
    }
    if (needInfo) {
        alert('Some elements can not accept new depth!');
        setValueIn(formatValue(newDepth), 'totalDepth');
    }
    if (newDepth >= 68.0) {
        newDepth = 68.0;
        alert('maximum depth is 68 cm!');
        setValueIn(newDepth, 'totalDepth');
    }
}
function validateHeigth() {
    let newHeigth = parseFloat(getValueFrom('totalHeight'));
    let moduleHeigth = totalHeight - legHeigth - topMask;
    if (moduleHeigth > maxModulHeight) {
        moduleHeigth = maxModulHeight;
    }
    let needInfo = false;
    for (var i = 0; i < myWardrobe.length; i++) {
        let moduleType = myWardrobe[i].type;
        let minModuleHeigth = getMinModuleHeigth(moduleType);
        if (moduleHeigth < minModuleHeigth) {
            moduleHeigth = minModuleHeigth;
            newHeigth = moduleHeigth + legHeigth + topMask;
            needInfo = true;
        }
    }
    if (needInfo) {
        alert('Some elements can not accept new heigth!');
        setValueIn(formatValue(newHeigth), 'totalHeight');
    }
    if (newHeigth > 310.0) {
        alert('Maximum heigth is 310 cm.');
        setValueIn(310.0, 'totalHeight');
    }
    calculateShelfNumberForEachModule();
}
function calculateShelfNumberForEachModule() {
    legHeight = parseFloat(getValueFrom('legHeight'));
    let newHeight = parseFloat(getValueFrom('totalHeight'));
    let moduleHeigth = newHeight - legHeight - topMask;
    if (moduleHeigth > maxModulHeight) {
        moduleHeigth = maxModulHeight;
    }
    for (var i = 0; i < myWardrobe.length; i++) {
        let moduleType = myWardrobe[i].type;
        let shelfNumber = getShelfNumbers(moduleType, moduleHeigth);
        setShelfValuesInRange(shelfNumber);

        myWardrobe[i].minShelfQty = inputRange.value;
        myWardrobe[i].maxShelfQty = shelfNumber[1];
        myWardrobe[i].shelfRange = inputRange.disabled;
    }
}
function validateLegHeight() {
    let newValue = getValueFrom('legHeight');
    if (newValue > 10.0) {
        alert('Leg height could not be longer than 10 cm');
        setValueIn(10.0, 'legHeight');
    }
    if (newValue < 8.0) {
        alert('Leg height could not be shorter than 8 cm');
        setValueIn(8.0, 'legHeight');
    }
}
function moduleTypeChanged(index) {
    let legHeigth = parseFloat(getValueFrom('legHeight'));
    let needInfoForDepth = false;
    let moduleType = getSelectedType(index);
    let requiredDepth = getMinModuleDepth(moduleType);
    let actualDepth = parseFloat(getValueFrom('totalDepth'));
    if (requiredDepth > actualDepth) {
        actualDepth = requiredDepth;
        needInfoForDepth = true;
    }
    if (needInfoForDepth) {
        alert('This element will set new depth!');
        setValueIn(actualDepth, 'totalDepth');
    }
    let needInfoForHeight = false;
    let requiredHeigth = getMinModuleHeigth(moduleType) + legHeigth + topMask;
    let actualHeigth = parseFloat(getValueFrom('totalHeight'));
    if (requiredHeigth > actualHeigth) {
        actualHeigth = requiredHeigth;
        needInfoForHeight = true;
    }
    if (needInfoForHeight) {
        alert('This element will set new heigth!');
        setValueIn(actualHeigth, 'totalHeight');
    }
    calculateShelfNumberForEachModule();
}
function getMinModuleDepth(moduleType) {
    let result = 0.0;
    switch (moduleType) {
        case 'Coats':
        case 'Pants':
        case 'Shirts':
            result = 50.0;
            break;
        case 'Devices':
            result = 45.0;
            break;
        case 'Sweeters':
        case 'Jewelry':
        case 'Splited':
            result = 35.0;
            break;
        default:
    }
    return result;
}
function getMinModuleWidth(moduleType) {
    let result = 0.0;
    switch (moduleType) {
        case 'Devices':
            result = 49.0;
            break;
        case 'Shirts':
            result = 40.6;
            break;
        case 'Coats':
        case 'Pants':
        case 'Sweeters':
        case 'Jewelry':
        case 'Splited':
            result = 35.0;
            break;
        default:
    }
    return result;
}
function getMinModuleHeigth(moduleType) {
    let result = 0.0;
    switch (moduleType) {
        case 'Coats':
        case 'Pants':
        case 'Devices':
            result = 163.8;//pazi ovo se pojavljuje i u getShelfNumbers
            break;
        case 'Shirts':
            result = 205.7;//pazi ovo se pojavljuje i u getShelfNumbers
            break;
        case 'Sweeters':
        case 'Jewelry':
            result = 110.0; //pazi ovo se pojavljuje i u getShelfNumbers
            break;
        case 'Splited':
            result = 230.0;
            break;
        default:
    }
    return result;
}
function getShelfNumbers(moduleType, newHeigth) {
    let minValue = panelThk;
    let maxValue = panelThk;
    switch (moduleType) {
        case 'Pants':
            minValue = 103.8;//pazi ovo se pojavljuje i u getMinModuleHeigth
            maxValue = 134.6;
            break;
        case 'Coats':
        case 'Devices':
            minValue = 163.8;//pazi ovo se pojavljuje i u getMinModuleHeigth
            maxValue = 194.6;
            break;
        case 'Shirts':
            minValue = 205.7;//pazi ovo se pojavljuje i u getMinModuleHeigth
            maxValue = 236.6;
            break;
        case 'Jewelry':
            minValue = 60.2 + 46.0 + 2 * panelThk; //pazi ovo se pojavljuje i u getMinModuleHeigth
            maxValue = 91.1 + 46.0 + 2 * panelThk;
            break;
        case 'Splited':
            minValue = 230.0;
            maxValue = 275.0;
        case 'Sweeters':
        default:
    }
    let maxShelfNumber = Math.floor(Math.abs(newHeigth - minValue) / (minShelfDistance + panelThk));
    let minShelfNumber = Math.ceil(Math.abs(newHeigth - maxValue) / (maxShelfDistance + panelThk));

    let output = [minShelfNumber, maxShelfNumber];
    return output;
}
function setShelfValuesInRange(shelfNumbers) {
    if (shelfNumbers[0] <= 0 && shelfNumbers[1] <= 0) {
        inputRange.value = 0;
        inputRange.disabled = true;
        return;
    }
    if (shelfNumbers[0] < 0 && shelfNumbers[1] > 0) {
        inputRange.value = shelfNumbers[1];
        inputRange.disabled = true;
        return;
    }
    if (shelfNumbers[0] == shelfNumbers[1]) {
        inputRange.value = shelfNumbers[0];
        inputRange.disabled = true;
        return;
    }
    else {
        inputRange.disabled = false;
        inputRange.min = shelfNumbers[0];
        inputRange.max = shelfNumbers[1];
        inputRange.value = shelfNumbers[0];
    }
    return;
}
function setGlobalDoorTypeToAllModules() {
    globalDoorType = getSelectedDoorType();
    for (var i = 0; i < myWardrobe.length; i++) {
        myWardrobe[i].doorType = globalDoorType;
    }
}
function saveConfiguration(selectedPosition) {
    fromWallToWall = false;
    fromWall = false;
    toWall = false;
    free = false;
    if (selectedPosition == 'w2w') {
        fromWallToWall = true;
    }
    else if (selectedPosition == 'fw') {
        fromWall = true;
    }
    else if (selectedPosition == 'tw') {
        toWall = true;
    }
    else {
        free = true;
    }
}
function saveDimensions() {
    overallWidth = parseFloat(getValueFrom('totalWidth'));
    totalHeight = parseFloat(getValueFrom('totalHeight'));
    totalDepth = parseFloat(getValueFrom('totalDepth'));
    legHeight = parseFloat(getValueFrom('legHeight'));

    possibleModules = findValidModules(totalHeight - legHeight);

    divsWithPictures = '';
    for (var i = 0; i < possibleModules.length; i++) {
        divsWithPictures += getHTMLForModule(possibleModules[i]);
    }
    document.getElementById('modules-list').innerHTML = divsWithPictures;

    $('.single-module').click(function () {
        selectedModule = $(this).attr('data-module');
        addModule(selectedModule);
        console.log(selectedModule);
        $("#orderForm #module").val(selectedModule);
        $(".sum-module").html("<p>--- " + selectedModule + "</p>");
    });

    calculateShelfNumberForEachModule();
}
function unloadSelectedModel(caller) {
    var guid = caller.parentElement.id;
    caller.parentElement.remove();
    removeModule(guid);
}
function saveCommonData() {
    hasBackplate = getStatusFrom('withBottom');
    hasLEDlight = getStatusFrom('withLED');
    hasDoorHandle = getStatusFrom('withHandle');
    setGlobalDoorTypeToAllModules();
}
function findValidModules(wantedHeight) {
    const result = [];
    if (wantedHeight >= coatsModuleHeightMin) {
        result.push('Coats');
    }
    if (wantedHeight >= coatsModuleHeightMin) {
        result.push('Pants');
    }
    if (wantedHeight >= devicesModuleHeightMin) {
        result.push('Devices');
    }
    if (wantedHeight >= shirtsModuleHeightMin) {
        result.push('Shirts');
    }
    if (wantedHeight >= sweetersModuleHeightMin) {
        result.push('Sweeters');
    }
    if (wantedHeight >= jewelryModuleHeightMin) {
        result.push('Jewelry');
    }
    if (wantedHeight >= cmbModuleHeightMin) {
        result.push('Splited');
    }
    return result;
}
function getHTMLForModule(moduleName) {
    var completeHtml = '';
    completeHtml += "<div class='single-module' data-module='" + moduleName + "'>";
    completeHtml += "<img src='/pictures/" + moduleName + ".png' >";
    //completeHtml += '<input id="add' + moduleName + 'Module" type="button" onclick="insertModuleOnList(' + "'" + moduleName + "'" + ')" value="Add this" >';
    completeHtml += '<input id="add' + moduleName + 'Module" type="button" value="Add this" >';
    completeHtml += '</div>';
    return completeHtml;
}
function insertModuleOnList(selectedModule) {
    addModule(selectedModule);
    console.log(selectedModule);
    $("#orderForm #module").val(selectedModule);
    $(".sum-module").html("<p>--- " + selectedModule + "</p>");
}
function showDiv(divId) {
    comp = 'configurationScreen'
    if (divId == comp) {
        document.getElementById(comp).style.display = "block";
    }
    else {
        document.getElementById(comp).style.display = "none";
    }
    comp = 'dimensionsScreen'
    if (divId == comp) {
        document.getElementById(comp).style.display = "block";
    }
    else {
        document.getElementById(comp).style.display = "none";
    }
    comp = 'combinationScreen'
    if (divId == comp) {
        document.getElementById(comp).style.display = "block";
    }
    else {
        document.getElementById(comp).style.display = "none";
    }
    comp = 'finishScreen'
    if (divId == comp) {
        document.getElementById(comp).style.display = "block";
    }
    else {
        document.getElementById(comp).style.display = "none";
    }
}