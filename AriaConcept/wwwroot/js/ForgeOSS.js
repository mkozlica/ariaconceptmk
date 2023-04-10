

function setupBucket(userName) {
    let formData = new FormData();
    formData.append('bucketKey', userName);
    $.ajax({
        url: 'api/forge/oss/buckets',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ bucketKey: userName }),
        success: function (res) {
            writeLog('bucket ' + res + ' is setup');
        }
    });
}
