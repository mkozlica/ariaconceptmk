function sendMail(safeLink) {
    var emailData = new FormData();
    emailData.append('email', JSON.stringify({
        to: 'sovljaned@gmail.com',
        subject: 'Email from application',
        body: safeLink
    }));
    $.ajax({
        url: 'api/email',
        data: emailData,
        processData: false,
        contentType: false,
        type: 'POST'
    })
}
