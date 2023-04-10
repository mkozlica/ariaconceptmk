// dimensions are in cm
const panelWidth = 208;
const panelHeigth = 275;
const panelThk = 1.9;

const panelOffset = 1.0;

const maxModulHeight = panelHeigth - 2 * panelOffset;

const minShelfDistance = 29.0;
const maxShelfDistance = 40.0;

// general function for calculating min and max value with respect of ModuleHeigth
function getAllowableHeight(whereToPush, minValue, maxValue, minimum, maximum) {
    var i = 0;
    var next = true;
    var min = 0.0;
    var max = 0.0;
    do {
        min = minValue(i);
        if (min < minimum) {
            min = minimum;
        }
        max = maxValue(i);
        if (max > maximum) {
            max = maximum;
            next = false;
        }
        whereToPush.push({ min: min, max: max });
        i++;
    } while (next);
}
let userName = '';

let fromWallToWall = true;
let fromWall = false;
let toWall = false;
let free = false;

let overallWidth = 300.0;
let totalHeight = 27.5;
let totalDepth = 60.0;
let legHeight = 8.0;

//ukrasne lajsne za zatvaranje okolo plakara ako ima zidove
let leftMask = 4.0;
let topMask = 4.0;
let rightMask = 4.0;

//ukrasni panel za levu i desnu stranu ako nema zida
let coveringPanelThk = 1.9;

let hasBackplate = true;
let hasLEDlight = false;
let hasDoorHandle = false;
let moduleHeight = 0.0;
let globalDoorType = 1; // Left door
let insideColor = '';
let outsideColor = '';

/*******************************************
 *  dimensions for coats and pants module  *
 *******************************************/
let coatsHeight = 160.0;
let pantsHeight = 100.0

let coatsShelfDistMin = 29.0;
let coatsShelfDist = 29.0;
let coatsShelfDistMax = 40.0;

let coatsModuleHeightMin = 163.8;
let coatsModuleHeight = 163.8;
let coatsModuleHeightMax = 275.0;

let coatsModuleDepthMin = 50.0;
let coatsModuleDepth = 50.0;
let coatsModuleDepthMax = 68.0;

let coatsModuleWidthMin = 35.0;
let coatsModuleWidth = 35.0;
let coatsModuleWidthMax = 75.0;
/******************************
 * Allowable height for Pants *
];******************************/
let allowableHeightsForPants = [];
function calcMinValesForPants(i) {
    return panelThk + pantsHeight + i * (panelThk + coatsShelfDistMin) + panelThk;
}
function calcMaxValesForPants(i) {
    return panelThk + pantsHeight + i * (panelThk + coatsShelfDistMax) + panelThk;
}
getAllowableHeight(allowableHeightsForPants, calcMinValesForPants, calcMaxValesForPants, coatsModuleHeightMin, coatsModuleHeightMax);

/******************************
 * Allowable height for Coats *
 ******************************/
let allowableHeightsForCoats = [];
function calcMinValuesForCoats(i) {
    return panelThk + coatsHeight + i * (panelThk + coatsShelfDistMin) + panelThk
}
function calcMaxValuesForCoats(i) {
    return panelThk + coatsHeight + i * (panelThk + coatsShelfDistMax) + panelThk
}
getAllowableHeight(allowableHeightsForCoats, calcMinValuesForCoats, calcMaxValuesForCoats, coatsModuleHeightMin, coatsModuleHeightMax);


/***********************************
 *  dimensions for devices module  *
 ***********************************/
let deviceHeight = 160.0;

let deviceWidth = 14.0;

let devicesLowerShelfDist = 30.4;

let devicesUpperShelfDistMin = 29.0;
let devicesUpperShelfDist = 29.0;
let devicesUpperShelfDistMax = 40.0;

let devicesModuleHeightMin = 163.8;
let devicesModuleHeight = 163.8;
let devicesModuleHeightMax = 275.0;

let devicesModuleDepthMin = 45.0;
let devicesModuleDepth = 45.0;
let devicesModuleDepthMax = 68.0;

let devicesModuleWithMin = 49.0;
let devicesModuleWith = 49.0;
let devicesModuleWidthMax = 75.0;
/********************************
 * Allowable height for Devices *
 ********************************/
let allowableHeightsForDevices = [];
function calcMinValuesForDevices(i) {
    return panelThk + deviceHeight + i * (panelThk + devicesUpperShelfDistMin) + panelThk
}
function calcMaxValuesForDevices(i) {
    return panelThk + deviceHeight + i * (panelThk + devicesUpperShelfDistMax) + panelThk
}
getAllowableHeight(allowableHeightsForDevices, calcMinValuesForDevices, calcMaxValuesForDevices, devicesModuleHeightMin, devicesModuleHeightMax);

/**********************************
 *  dimensions for shirts module  *
 **********************************/
let shirtHeight = 100.0;

let shirtsShelfDistMin = 29.0;
let shirtsShelfDist = 29.0;
let shirtsShelfDistMax = 40.0;

let shirtsModuleHeightMin = 205.7;
let shirtsModuleHeight = 205.7;
let shirtsModuleHeightMax = 275.0;

let shirtsModuleDepthMin = 50.0;
let shirtsModuleDepth = 50.0;
let shirtsModuleDepthMax = 68.0;

let shirtsModuleWithMin = 40.6;
let shirtsModuleWith = 40.6;
let shirtsModuleWidthMax = 75.0;

/******************************
 * Allowable height for Shirts *
 ******************************/
let allowableHeightsForShirts = [];
function calcMinValuesForShirts(i) {
    return panelThk + shirtHeight + panelThk + shirtHeight + i * (panelThk + shirtsShelfDistMin) + panelThk
}
function calcMaxValuesForShirts(i) {
    return panelThk + shirtHeight + panelThk + shirtHeight + i * (panelThk + shirtsShelfDistMax) + panelThk
}
getAllowableHeight(allowableHeightsForShirts, calcMinValuesForShirts, calcMaxValuesForShirts, shirtsModuleHeightMin, shirtsModuleHeightMax);


/************************************
 *  dimensions for sweeters module  *
 ************************************/
let sweetersShelfDistMin = 29.5;
let sweetersShelfDist = 29.5;
let sweetersShelfDistMax = 40.0;

let sweetersModuleHeightMin = 110.0;
let sweetersModuleHeight = 110.0;
let sweetersModuleHeightMax = 275.0;

let sweetersModuleDepthMin = 35.0;
let sweetersModuleDepth = 35.0;
let sweetersModuleDepthMax = 68.0;

let sweetersModuleWidthMin = 35.0;
let sweetersModuleWidth = 35.0;
let sweetersModuleWidthMax = 75.0;
/*********************************
 * Allowable height for Sweeters *
 *********************************/
let allowableHeightsForSweeters = [];
function calcMinValuesForSweeters(i) {
    return panelThk + (i + 3) * (panelThk + sweetersShelfDistMin);
}
function calcMaxValuesForSweeters(i) {
    return panelThk + (i + 3) * (panelThk + sweetersShelfDistMax);
}
getAllowableHeight(allowableHeightsForSweeters, calcMinValuesForSweeters, calcMaxValuesForSweeters, sweetersModuleHeightMin, sweetersModuleHeightMax);

/***********************************
 *  dimensions for jewelry module  *
 ***********************************/
let jewelryBootHeight = 60.2;

let jewelryDrawersHeight = 46.0;
let jewelryDrawerQty = 2;

let jewelryUpperShelfDistMin = 29.0;
let jewelryUpperShelfDist = 29.0;
let jewelryUpperShelfDistMax = 40.0;

let jewelryModuleHeightMin = 110.0;
let jewelryModuleHeight = 110.0;
let jewelryModuleHeightMax = 275.0;

let jewelryModuleDepthMin = 35.0;
let jewelryModuleDepth = 35.0;
let jewelryModuleDepthMax = 68.0;

let jewelryModuleWithMin = 35.0;
let jewelryModuleWith = 35.0;
let jewelryModuleWidthMax = 75.0;
/********************************
 * Allowable height for Jewelry *
 ********************************/
let allowableHeightsForJewerly = [];
function calcMinValuesForJewerly(i) {
    return panelThk + jewelryBootHeight + jewelryDrawersHeight + i * (panelThk + jewelryUpperShelfDistMin) + panelThk
}
function calcMaxValuesForJewerly(i) {
    return panelThk + jewelryBootHeight + jewelryDrawersHeight + i * (panelThk + jewelryUpperShelfDistMax) + panelThk
}
getAllowableHeight(allowableHeightsForJewerly, calcMinValuesForJewerly, calcMaxValuesForJewerly, jewelryModuleHeightMin, jewelryModuleHeightMax);

/**************************************
 *  dimensions for combinated module  *
 **************************************/
let cmbModuleHeightMin = 230.0;
let cmbModuleHeight = 230.0;
let cmbModuleHeightMax = 275.0;

let bottomCmbModuleHeight = 35.5 + 0.3;

let middleCmbModuleHeight = 150.0;

let cmbModuleWithMin = 35.0;
let cmbModuleWith = 35.0;
let cmbModuleWidthMax = 75.0;

let bottomAndTopCmbModuleDepthMin = cmbModuleWithMin - 2.2;
let bottomAndTopCmbModuleDepth = cmbModuleWith - 2.2;
let bottomAndTopCmbModuleDepthMax = cmbModuleWidthMax - 2.2;

let middleCmbModuleDepthMin = 35.0;
let middleCmbModuleDepth = 35.0;
let middleCmbModuleDepthMax = 68.0;

let bottomDrawerQty = 2.0;
let bottomDrawerSpace = bottomCmbModuleHeight / bottomDrawerQty;