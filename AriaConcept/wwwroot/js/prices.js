function totalModulePrice(moduleObject, hasHandle, hasBackPlate, colorInIndex, colorOutIndex) {

    var moduleType = moduleObject.type;
    var width = moduleObject.width;
    var heigth = moduleObject.heigth;
    var doorType = moduleObject.doorType;
    var depth = totalDepth;

    var moduleSize = getSizeName(width);
    var moduleColor = getColorName(colorInIndex);
    var baseModulePrice = modulePrice(moduleType, moduleColor, moduleSize, heigth, depth);

    var priceForBackPlate = backPlatePrice(hasBackPlate, heigth, width);

    var doorColor = getColorName(colorOutIndex);
    var totalPriceForDoor = doorPrice(doorType, hasHandle, heigth, width, doorColor);

    var totalPrice = baseModulePrice + priceForBackPlate + totalPriceForDoor;
    return Math.round(totalPrice);
}
function coverPrice(configuration) {
    switch (configuration) {
        case "w2w":
            return prices1[0];
        case "fw":
            return prices1[1];
        case "tw":
            return prices1[2];
        default:
            return prices1[3];
    }
}
function modulePrice(module, color, size, moduleHeight, moduleDepth) {
    var baseModulePrice = prices2[getColorIndex(color)].data[getSizeIndex(size)].price[getModuleByName(module)];

    // TODO pribavi vrednosti za visinu i dubinu modula
    var hCoeff = getModuleHeightCoeff(moduleHeight);
    var dCoeff = getModuleDepthCoeff(moduleDepth);

    return baseModulePrice * hCoeff * dCoeff;
}
/* price for sliding door, swing door or no door*/
function doorPrice(doorType, hasDoorHandle, height, width, color) {
    var doorSizeName = getSizeName(width);
    var baseDoorPrice = prices6[getSizeIndex(doorSizeName)].price[getColorIndex(color)];

    var priceForDoorOptions = function (cond) {
        if (cond) {
            return prices8[0];
        }
        return prices8[1];
    }
    if (doorType == 0) {
        return 0;
    }
    if (doorType == 3) {
        return baseDoorPrice * getBackHeightCoeff(height) * getSlidingDoorWidthCoeff(width) + priceForDoorOptions(hasDoorHandle);
    }
    return baseDoorPrice * getBackHeightCoeff(height) * getBackWidthCoeff(width) + priceForDoorOptions(hasDoorHandle);
}
function backPlatePrice(hasBackPlate, height, width) {
    if (hasBackPlate) {
        return prices7[1] * getBackHeightCoeff(height) * getBackWidthCoeff(width);
    }
    return prices7[0] * getBackHeightCoeff(height) * getBackWidthCoeff(width);
}

function getColorIndex(color) {
    return colorNames.indexOf(color);
}
function getSizeIndex(size) {
    return sizeNames.indexOf(size);
}
function getModuleByName(name) {
    return moduleNames.indexOf(name);
}
// na osnovu izabranog diva boje prosleduje se index diva i odradjuje se vrsata boje
function getColorName(index) {
    return colorDistribution[index];
}
function getSizeName(dimension) {
    if (dimension <= 45) {
        return "small";
    }
    if (45 < dimension && dimension <= 60) {
        return "medium";
    }
    return "large";
}

function getModuleHeightCoeff(inputValue) {
    if (inputValue <= 170) {
        return RS[0];
    }
    if (170 < inputValue && inputValue <= 240) {
        return RS[1];
    }
    return RS[2];
}
function getModuleDepthCoeff(inputValue) {
    if (inputValue <= 45) {
        return TU[0];
    }
    if (45 < inputValue && inputValue <= 58) {
        return TU[1];
    }
    return TU[2];
}
function getBackHeightCoeff(inputValue) {
    if (inputValue <= 170) {
        return VW[0];
    }
    if (170 < inputValue && inputValue <= 240) {
        return VW[1];
    }
    return VW[2];
}
function getBackWidthCoeff(inputValue) {
    if (inputValue <= 45) {
        return YZ[0];
    }
    if (45 < inputValue && inputValue <= 58) {
        return YZ[1];
    }
    return YZ[2];
}
function getSlidingDoorWidthCoeff(inputValue) {
    if (inputValue <= 45) {
        return PQ[0];
    }
    if (45 < inputValue && inputValue <= 58) {
        return PQ[1];
    }
    return PQ[2];
}

var moduleNames = ["Pants", "Coats", "Shirts", "Devices", "Jewelry", "Sweeters", "Splited"];
var colorNames = ["white", "standard", "premium"];
var sizeNames = ["small", "medium", "large"];
var doorNames = ["swing", "sliding"]
var colorDistribution = ["white", "white", "white", "white", "standard", "standard", "standard", "premium", "premium", "premium"];

var RS = [0.9, 1, 1.2];
var TU = [0.9, 1, 1.2];
var VW = [0.9, 1, 1.2];
var YZ = [0.9, 1, 1.2];
var PQ = [0.9, 1, 1.2];

// fixed price for cover
var prices1 = [100, 200, 300, 400];

// fixed price for modules based on color, size and module type
var prices2 = [
    {
        //white
        data:
            [
                {
                    price: [100, 101, 102, 103, 104, 105, 107]
                },
                {
                    price: [110, 111, 112, 113, 114, 115, 116]
                },
                {
                    price: [120, 121, 122, 123, 124, 125, 126]
                }
            ]
    },
    {
        //standard
        data:
            [
                {
                    price: [200, 201, 202, 203, 204, 205, 206]
                },
                {
                    price: [240, 241, 242, 243, 244, 245, 246]
                },
                {
                    price: [280, 281, 282, 283, 284, 285, 286]
                }
            ]
    },
    {
        //premium
        data:
            [
                {
                    price: [300, 301, 302, 303, 304, 305, 306]
                },
                {
                    price: [345, 346, 347, 348, 349, 350, 351]
                },
                {
                    price: [390, 391, 392, 393, 394, 395, 396]
                }
            ]
    }
];

// fixed price for doors based on color and size
var prices6 = [
    //small
    {
        price: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109]
    },
    //medium
    {
        price: [110, 111, 112, 113, 114, 115, 116, 117, 118, 119]
    },
    //large
    {
        price: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129]
    }
];

// fixed price for backplate
var prices7 = [0, 200];

// prices for door options
var prices8 = [100, 200, 300];

