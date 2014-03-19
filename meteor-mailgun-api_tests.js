Tinytest.add('MeteorMailgunAPI - Test API', function (test) {
    var testMailgun = new Mailgun('Test', 'mail.somewhere.com');
    test.equal(
        typeof testMailgun.api,
        'object',
        'Expect Mailgun.api to be a object'
    );
});