$(document).ready(function () {
    startConnection();
});

function createAppBundleActivity() {
    startConnection(function () {
        writeLog("Defining appbundle and activity for " + "Autodesk.Inventor + 2022");
        createAppBundle(function () {
            createActivity(function () {
                collectAndSend();
            });
        });
    });
}

function createAppBundle(cb) {
    jQuery.ajax({
        url: 'api/forge/designautomation/appbundles',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            bundleName: 'PlywoodWorkPlugin',
            zipFileName: 'PlywoodWorkPlugin.bundle',
            engine: 'Autodesk.Inventor+2022'
        }),
        success: function (res) {
            writeLog('AppBundle: ' + res.appBundle + ', v' + res.version);
            if (cb) cb();
        }
    });
}

function createActivity(cb) {
    jQuery.ajax({
        url: 'api/forge/designautomation/activities',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            bundleName: 'PlywoodWorkPlugin',
            activityName: 'PlywoodWork',
            engine: 'Autodesk.Inventor+2022'
        }),
        success: function (res) {
            writeLog('Activity: ' + res.activity);
            if (cb) cb();
        }
    });
}

var myProgressBar;
var myPopupWindow;
var totalPanelNumber = 0;

function startWorkItem(wiData, activityName, message) {
    panelCounter = 1;
    myPopupWindow = document.getElementById('overlay');
    myPopupWindow.style.display = 'block';
    myProgressBar = document.getElementById('progressBar');
    console.log(wiData);

    startConnection(function () {
        var formData = new FormData();
        var allData = JSON.stringify({
            modules: wiData,
            filename: fileName,
            activityName: activityName,
            username: userName,
            browerConnectionId: connectionId
        });
        formData.append('data', allData);
        writeLog(message);
        $.ajax({
            url: 'api/forge/designautomation/workitems',
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (res) {
                writeLog('Workitem started: ' + res.workItemId);
            }
        });
    });
}

function writeLog(text) {
    //console.log(text);
    $('#infoContent').append('<div style="border-top: 1px dashed #C0C0C0">' + text + '</div>');
    var elem = document.getElementById('infoContent');
    //elem.scrollTop = elem.scrollHeight;
}

var connection;
var connectionId;
var panelCounter = 0;
var sumOfElements = 0;

function startConnection(onReady) {
    if (connection && connection.connectionState) { if (onReady) onReady(); return; }
    connection = new signalR.HubConnectionBuilder().withUrl("/api/signalr/designautomation").build();
    connection.start()
        .then(function () {
            connection.invoke('getConnectionId')
                .then(function (id) {
                    connectionId = id; // we'll need this...
                    if (onReady) onReady();
                });
        });

    connection.on("downloadResult", function (url) {
        sendMail('<h1>Ima li koga?</h1><p>Hoćemo li u ponedeljak da sastančimo?</p><br><a href="' + url + '">Evo ako nekom treba plakar za predsoblje</a>');
    });

    connection.on("onComplete", function (message, outputFileName) {
        writeLog('It is done!');
        fileName = outputFileName;
        console.log(message);
    });

    connection.on("translateModel", function (urn) {
        //writeLog(urn);        
        onModelSelected(viewer, urn);
    });

    connection.on("onProgress", function (message) {
        var response = JSON.parse(message);
        if (response.progress == 'new panel') {
            panelCounter++;
            myProgressBar.style.width = panelCounter * 70 / (sumOfElements) + '%';
        }
    });
}

