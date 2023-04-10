// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

var myCustomCloset = {};

function create3DModel(jsonFormatData) {
    sumOfElements = totalPanelNumber;
    startWorkItem(jsonFormatData, 'PlywoodWork', 'Uploading input file...')
}

function collectAndSend() {
    moduleHeight = totalHeight - legHeight;
    if (moduleHeight > maxModulHeight) {
        topMask = moduleHeight - maxModulHeight;
        moduleHeight = maxModulHeight;
    }
    else {
        moduleHeight = totalHeight - legHeight - topMask;
    }

    myCustomCloset.OverallWidth = overallWidth;
    myCustomCloset.TopMaskHeigth = topMask;
    myCustomCloset.HasLeftMask = hasMaskOn('left');
    myCustomCloset.HasRightMask = hasMaskOn('right');
    myCustomCloset.OverallHeigth = totalHeight;
    myCustomCloset.OverallDepth = totalDepth;
    myCustomCloset.LegHeigth = legHeight;
    myCustomCloset.InsideColor = 'InsideColor';
    myCustomCloset.OutsideColor = 'OutsideColor';
    myCustomCloset.DoorType = globalDoorType;
    myCustomCloset.AllModuleModels = [];

    for (var i = 0; i < myWardrobe.length; i++) {
        myCustomCloset.AllModuleModels.push(createModulesObject(i));
    }
    var closetData = JSON.stringify(myCustomCloset);

    //logout(closetData);
    create3DModel(closetData);
}

function hasMaskOn(side) {
    let output = false;

    if (side == 'left' && (fromWall || fromWallToWall)) {
        output = true;
    }
    if (side == 'right' && (toWall || fromWallToWall)) {
        output = true;
    }
    return output;
}
function getSelectedType(module) {
    let e = document.getElementById(module);
    return e.options[e.selectedIndex].text;
}
function createModulesObject(moduleNumber) {
    let result;
    let moduleType = myWardrobe[moduleNumber].type;
    switch (moduleType) {
        case 'Coats':
        case 'Pants':
            result = createObjectForCoatsAndPants(moduleNumber, moduleType);
            break;
        case 'Shirts':
            result = createObjectForShirts(moduleNumber);
            break;
        case 'Devices':
            result = createObjectForDevices(moduleNumber);
            break;
        case 'Sweeters':
            result = createObjectForSweeters(moduleNumber);
            break;
        case 'Jewelry':
            result = createObjectForJewelry(moduleNumber);
            break;
        case 'Splited':
            result = createObjectForSplited(moduleNumber);
            break;
        default:
    }
    return result;
}
function createObjectForCoatsAndPants(moduleNumber, moduleType) {
    let moduleTypeEnumNumber = 1;
    let coatsOrPantsHeight = coatsHeight;
    if (moduleType == "Pants") { moduleTypeEnumNumber = 2; coatsOrPantsHeight = pantsHeight; }
    let minHeigthWOShelfs = coatsOrPantsHeight + 2 * panelThk;
    let maxHeigthWOShelfs = minHeigthWOShelfs + coatsShelfDistMin + panelThk;
    let doorType = myWardrobe[moduleNumber].doorType;
    let moduleDepth = totalDepth - getTotalDepthCorrection(doorType);
    let shelfNumber = myWardrobe[moduleNumber].shelfQty;
    if (shelfNumber < 0) { shelfNumber = 0; }
    let corpusPanelNumber = 4;
    if (hasBackplate) { corpusPanelNumber = 5; }
    let firstShelfElevation = coatsOrPantsHeight + panelThk;
    let shelfDistance = 0.0;
    if (shelfNumber != 0) {
        shelfDistance = Math.round((moduleHeight - firstShelfElevation - panelThk) / shelfNumber * 10) / 10;
    }
    let result = {
        "Height": moduleHeight,
        "Width": myWardrobe[moduleNumber].width,
        "Depth": moduleDepth,
        "ModuleName": "Module" + (moduleNumber + 1),
        "ModuleType": moduleTypeEnumNumber,
        "HasBackPlate": hasBackplate,
        "HasLEDLight": hasLEDlight,
        "HasDoorHandle": hasDoorHandle,
        "DoorType": doorType,
        "ShelfPattern": [
            {
                "ShelfQty": shelfNumber - 1,
                "ShelfDistance": shelfDistance,
                "Panel": { "Id": corpusPanelNumber + 1 }
            }
        ],
        "Panels": []
    };
    let panelNumber = calculateShelfNumber(2, shelfNumber, moduleHeight, minHeigthWOShelfs, maxHeigthWOShelfs) + corpusPanelNumber; // Left, Right, Bottom, Top Back?
    totalPanelNumber += panelNumber;
    for (var i = 0; i < panelNumber; i++) {
        result.Panels.push(createPanelObjects(i));
        if (i == corpusPanelNumber) {
            result.Panels[i].Elevation = firstShelfElevation;
            result.Panels[i].HardConnected = true;
        }
        if (i == (corpusPanelNumber + 1)) {
            result.Panels[i].Elevation = firstShelfElevation + shelfDistance;
        }
    }
    return result;
}
function createObjectForShirts(moduleNumber) {
    let shelfNumber = myWardrobe[moduleNumber].shelfQty;
    if (shelfNumber < 0) { shelfNumber = 0; }
    let doorType = myWardrobe[moduleNumber].doorType;
    let corpusPanelNumber = 4;
    if (hasBackplate) { corpusPanelNumber = 5; }
    let minHeigthWOShelfs = shirtsModuleHeightMin;
    let maxHeigthWOShelfs = minHeigthWOShelfs + shirtsShelfDistMin + panelThk;
    let moduleDepth = totalDepth - getTotalDepthCorrection(doorType);
    let firstShelfElevation = shirtHeight + panelThk;
    let secondShelfElevation = 2 * firstShelfElevation;
    let shelfDistance = 0.0;
    if (shelfNumber != 0) {
        shelfDistance = Math.round((moduleHeight - secondShelfElevation - panelThk) / shelfNumber * 10) / 10;
    }

    let result = {
        "Height": moduleHeight,
        "Width": myWardrobe[moduleNumber].width,
        "Depth": moduleDepth,
        "ModuleName": "Module" + (moduleNumber + 1),
        "ModuleType": 3,
        "HasBackPlate": hasBackplate,
        "HasLEDLight": hasLEDlight,
        "HasDoorHandle": hasDoorHandle,
        "DoorType": doorType,
        "ShelfPattern": [
            {
                "ShelfQty": shelfNumber - 1,
                "ShelfDistance": shelfDistance,
                "Panel": { "Id": corpusPanelNumber + 1 }
            }
        ],
        "Panels": []
    };
    let panelNumber = calculateShelfNumber(3, shelfNumber, moduleHeight, minHeigthWOShelfs, maxHeigthWOShelfs) + corpusPanelNumber; // Left, Right, Bottom, Top Back?
    totalPanelNumber += panelNumber;
    for (var i = 0; i < panelNumber; i++) {
        result.Panels.push(createPanelObjects(i));
        if (i == corpusPanelNumber) {
            result.Panels[i].Elevation = firstShelfElevation;
            result.Panels[i].HardConnected = true;
        }
        if (i == (corpusPanelNumber + 1)) {
            result.Panels[i].Elevation = secondShelfElevation;
        }
    }
    return result;
}
function createObjectForDevices(moduleNumber) {
    let corpusPanelNumber = 4;
    if (hasBackplate) { corpusPanelNumber = 5; }
    let doorType = myWardrobe[moduleNumber].doorType;
    let moduleDepth = totalDepth - getTotalDepthCorrection(doorType);
    let minHeigthWOShelfs = devicesModuleHeightMin;
    let maxHeigthWOShelfs = minHeigthWOShelfs + devicesUpperShelfDistMin + panelThk;
    if (minHeigthWOShelfs <= moduleHeight && moduleHeight <= maxHeigthWOShelfs) {
        deviceHeight = moduleHeight - 2 * panelThk;
    } else if (maxHeigthWOShelfs < moduleHeight) {
        deviceHeight = 160;
    }
    let firstShelfElevation = devicesLowerShelfDist + panelThk;
    let secondShelfElevation = deviceHeight + panelThk;
    let shelfNumberBelow = 4;
    let shelfDistanceBelow = devicesLowerShelfDist + panelThk;
    let shelfNumberAbove = myWardrobe[moduleNumber].shelfQty;
    if (shelfNumberAbove < 0) { shelfNumberAbove = 0; }
    let shelfDistanceAbove = 0.0;
    if (shelfNumberAbove != 0) {
        shelfDistanceAbove = Math.round((moduleHeight - panelThk - (deviceHeight + panelThk)) / shelfNumberAbove * 10) / 10;
    }
    let result = {
        "Height": moduleHeight,
        "Width": myWardrobe[moduleNumber].width,
        "Depth": moduleDepth,
        "ModuleName": "Module" + (moduleNumber + 1),
        "ModuleType": 4,
        "HasBackPlate": hasBackplate,
        "HasLEDLight": hasLEDlight,
        "HasDoorHandle": hasDoorHandle,
        "DoorType": doorType,
        "ShelfPattern": [
            {
                "ShelfQty": shelfNumberBelow,
                "ShelfDistance": shelfDistanceBelow,
                "Panel": { "Id": corpusPanelNumber + 1 }
            },
            {
                "ShelfQty": shelfNumberAbove - 1,
                "ShelfDistance": shelfDistanceAbove,
                "Panel": { "Id": corpusPanelNumber + 3 }
            }
        ],
        "Panels": []
    };
    let panelNumber = calculateShelfNumber(4, shelfNumberAbove, moduleHeight, minHeigthWOShelfs, maxHeigthWOShelfs) + corpusPanelNumber; // Left, Right, Bottom, Top Back?
    totalPanelNumber += panelNumber;
    for (var i = 0; i < panelNumber; i++) {
        result.Panels.push(createPanelObjects(i));
        if (i == corpusPanelNumber) {
            result.Panels[i].Width = secondShelfElevation;
            result.Panels[i].Transition = deviceWidth;
            result.Panels[i].Orientation = 0;
            result.Panels[i].Position = 0;
        }
        if (i == corpusPanelNumber + 1) {
            result.Panels[i].Elevation = firstShelfElevation;
        }
        if (i == corpusPanelNumber + 2) {
            result.Panels[i].Elevation = secondShelfElevation;
        }
        if (i == corpusPanelNumber + 3) {
            result.Panels[i].Elevation = secondShelfElevation + shelfDistanceAbove + panelThk;
        }
    }
    return result;
}
function createObjectForSweeters(moduleNumber) {
    let shelfNumber = myWardrobe[moduleNumber].shelfQty;
    if (shelfNumber < 0) { shelfNumber = 0; }
    let corpusPanelNumber = 4;
    if (hasBackplate) { corpusPanelNumber = 5; }
    let doorType = myWardrobe[moduleNumber].doorType;
    let moduleDepth = totalDepth - getTotalDepthCorrection(doorType);
    let minHeigthWOShelfs = sweetersModuleHeightMin;
    let maxHeigthWOShelfs = minHeigthWOShelfs + sweetersShelfDistMin + panelThk;
    let shelfDistance = 0.0;
    if (shelfNumber != 0) { shelfDistance = Math.round((moduleHeight - panelThk) / shelfNumber * 10) / 10; }
    let shelfNumbers = distributeShelfs(shelfDistance, shelfNumber);
    let result = {
        "Height": moduleHeight,
        "Width": myWardrobe[moduleNumber].width,
        "Depth": moduleDepth,
        "ModuleName": "Module" + (moduleNumber + 1),
        "ModuleType": 5,
        "HasBackPlate": hasBackplate,
        "HasLEDLight": hasLEDlight,
        "HasDoorHandle": hasDoorHandle,
        "DoorType": doorType,
        "ShelfPattern": [
            {
                "ShelfQty": shelfNumbers[1],
                "ShelfDistance": shelfDistance,
                "Panel": { "Id": corpusPanelNumber + 1 }
            },
            {
                "ShelfQty": shelfNumbers[2],
                "ShelfDistance": shelfDistance,
                "Panel": { "Id": corpusPanelNumber + 2 }
            }
        ],
        "Panels": []
    };
    let panelNumber = calculateShelfNumber(3, shelfNumber - 3, moduleHeight, minHeigthWOShelfs, maxHeigthWOShelfs) + corpusPanelNumber; // Left, Right, Bottom, Top Back?
    totalPanelNumber += panelNumber;
    for (var i = 0; i < panelNumber; i++) {
        result.Panels.push(createPanelObjects(i));
        if (i == corpusPanelNumber) {
            result.Panels[i].Elevation = shelfDistance * shelfNumbers[0];
        }
        if (i == corpusPanelNumber + 1) {
            result.Panels[i].Elevation = shelfDistance;
        }
        if (i == corpusPanelNumber + 2) {
            result.Panels[i].Elevation = shelfDistance + shelfDistance * shelfNumbers[0];
        }
    }
    return result;
}
function createObjectForJewelry(moduleNumber) {
    let shelfNumber = myWardrobe[moduleNumber].shelfQty;
    if (shelfNumber < 0) { shelfNumber = 0; }
    let doorType = myWardrobe[moduleNumber].doorType;
    let corpusPanelNumber = 4;
    let moduleDepth = totalDepth - getTotalDepthCorrection(doorType);
    let minHeigthWOShelfs = jewelryModuleHeightMin;
    let maxHeigthWOShelfs = minHeigthWOShelfs + jewelryUpperShelfDistMin + panelThk;
    let spaceForDrawer = moduleDepth;
    if (hasBackplate) { corpusPanelNumber = 5; spaceForDrawer -= 1.8000; }
    let heightDrawerSection = jewelryDrawersHeight;
    let heightOpenSection = jewelryBootHeight + panelThk;
    let shelfDistance = 0.0;
    if (shelfNumber != 0) { shelfDistance = Math.round((moduleHeight - panelThk - (heightOpenSection + heightDrawerSection)) / shelfNumber * 10) / 10; }
    let drawerDistance = jewelryDrawersHeight / jewelryDrawerQty;
    let result = {
        "Height": moduleHeight,
        "Width": myWardrobe[moduleNumber].width,
        "Depth": moduleDepth,
        "ModuleName": "Module" + (moduleNumber + 1),
        "ModuleType": 6,
        "HasBackPlate": hasBackplate,
        "HasLEDLight": hasLEDlight,
        "HasDoorHandle": hasDoorHandle,
        "DoorType": doorType,
        "ShelfPattern": [
            {
                "ShelfQty": shelfNumber - 1,
                "ShelfDistance": shelfDistance,
                "Panel": { "Id": corpusPanelNumber + 1 }
            }
        ],
        "Drawer": {
            "Id": 1,
            "DrawerType": 0,
            "DrawerClass": 0,
            "Width": myWardrobe[moduleNumber].width,
            "Heigth": drawerDistance,
            "Depth": spaceForDrawer,
            "Elevation": heightOpenSection
        },
        "DrawerPattern":
        {
            "DrawerQty": jewelryDrawerQty,
            "DrawerDistance": drawerDistance,
            "Drawer": { "Id": 1 }
        },
        "Panels": []
    };
    let panelNumber = calculateShelfNumber(2, shelfNumber, moduleHeight, minHeigthWOShelfs, maxHeigthWOShelfs) + corpusPanelNumber; // Left, Right, Bottom, Top Back?
    totalPanelNumber += panelNumber;
    for (var i = 0; i < panelNumber; i++) {
        result.Panels.push(createPanelObjects(i));
        if (i == corpusPanelNumber) {
            result.Panels[i].Elevation = heightOpenSection + heightDrawerSection;
            result.Panels[i].HardConnected = true;
        }
        if (i == (corpusPanelNumber + 1)) {
            result.Panels[i].Elevation = heightOpenSection + heightDrawerSection + shelfDistance;
        }
    }
    return result;
}
function createObjectForSplited(moduleNumber) {
    let shelfNumber = myWardrobe[moduleNumber].shelfQty;
    if (shelfNumber < 0) { shelfNumber = 0; }
    let doorType = 0;
    let corpusPanelNumber = 12;
    let moduleDepth = totalDepth - panelThk;
    let spaceForDrawer = moduleDepth;
    if (hasBackplate) { corpusPanelNumber = 15; spaceForDrawer -= 1.8000; }
    let shelfDistance = 0.0;
    if (shelfNumber != 0) {
        shelfDistance = Math.round((moduleHeight - panelThk - (bottomCmbModuleHeight + middleCmbModuleHeight)) / shelfNumber * 10) / 10;
    }
    let drawerDistance = bottomDrawerSpace;
    let drawerQty = bottomDrawerQty;
    let result = {
        "Height": moduleHeight,
        "Width": myWardrobe[moduleNumber].width,
        "Depth": moduleDepth,
        "ModuleName": "Module" + (moduleNumber + 1),
        "ModuleType": 7,
        "HasBackPlate": hasBackplate,
        "HasLEDLight": false,
        "HasDoorHandle": hasDoorHandle,
        "DoorType": doorType,
        "ShelfPattern": [
            {
                "ShelfQty": shelfNumber - 1,
                "ShelfDistance": shelfDistance,
                "Panel": { "Id": corpusPanelNumber + 1 }
            }
        ],
        "Drawer": {
            "Id": 1,
            "DrawerType": 1,
            "DrawerClass": 0,
            "Width": myWardrobe[moduleNumber].width,
            "Heigth": drawerDistance,
            "Depth": spaceForDrawer,
            "Elevation": 0.0
        },
        "DrawerPattern":
        {
            "DrawerQty": drawerQty,
            "DrawerDistance": drawerDistance,
            "Drawer": { "Id": 1 }
        },
        "Panels": []
    };
    let panelNumber = corpusPanelNumber + 1;
    totalPanelNumber += panelNumber;
    for (var i = 0; i < panelNumber; i++) {
        result.Panels.push(createPanelObjects(i));
        if (i == corpusPanelNumber) {
            result.Panels[i].Elevation = bottomCmbModuleHeight + middleCmbModuleHeight + shelfDistance;
            result.Panels[i].HardConnected = false;
        }
    }
    return result;
}
function createPanelObjects(number) {
    let panel = {
        "Id": number,
        "Width": 60,
        "Depth": 40,
        "Elevation": 0,
        "Transition": 0,
        "Position": 3,
        "Orientation": 1,
        "LeftConnection": {
            "Id": 1,
            "Connection": 1
        },
        "RightConnection": {
            "Id": 1,
            "Connection": 1
        },
        "HardConnected": false,
        "ChildrenConnections": [],
        "HasKantTape": {
            "Left": false,
            "Top": false,
            "Right": false,
            "Bottom": false
        }
    };
    return panel;
}
function calculateShelfNumber(initialNumber, shelfQty, moduleHeight, limitMin, limitMax) {
    if (shelfQty <= 1) {
        initialNumber--;
    }
    if (limitMin <= moduleHeight && moduleHeight < limitMax) {
        initialNumber--;
    }
    return initialNumber;
}
function distributeShelfs(shelfDistance, spaceNumber) {
    let shelfNumber = spaceNumber - 1;
    let shelfIndexon1100 = Math.round(sweetersModuleHeightMin / shelfDistance);
    let shelfQtyBelowFix = shelfIndexon1100 - 1;
    let shelfQtyAboveFix = shelfNumber - shelfQtyBelowFix - 1;
    return [shelfIndexon1100, shelfQtyBelowFix, shelfQtyAboveFix];
}
function getTotalDepthCorrection(doorTypeNumber) {
    if (doorTypeNumber == 3 || doorTypeNumber == 0) {
        return 0.0;
    }
    return panelThk;
}
function getDoorTypeNumber(doorType) {
    switch (doorType) {
        case "None":
            return 0;
        case "Left Door":
            return 1;
        case "Right Door":
            return 2;
        default:
            return 3;
    }
}
function getSelectedDoorType() {
    if (getStatusFrom('globalDoorTypeNone')) {
        return 0;
    }
    if (getStatusFrom('globalDoorTypeLeft')) {
        return 1;
    }
    if (getStatusFrom('globalDoorTypeRight')) {
        return 2;
    }
    return 3;
}
function getValueFrom(objectId) {
    return document.getElementById(objectId).value / 10.0;
}
function getStatusFrom(objectId) {
    return document.getElementById(objectId).checked;
}
function setValueIn(newValue, objectId) {
    var component = document.getElementById(objectId);
    component.value = newValue;
}
function logout(text) {
    console.log(text);
}