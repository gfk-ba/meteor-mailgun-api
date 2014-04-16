Tinytest.add('MeteorMailgunAPI - Test API', function (test) {
    var testMailgun = new Mailgun();
    test.equal(
        typeof testMailgun.api,
        'object',
        'Expect Mailgun.api to be a object'
    );
});

Tinytest.add('MeteorMailgunAPI - When given options - Expect api options to be set', function (test) {
    var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});
    test.equal(
        testMailgun.api.apiKey,
        'Test',
        'Expect Mailgun.api to be a object'
    );
    test.equal(
        testMailgun.api.domain,
        'mail.somewhere.com',
        'Expect Mailgun.api to be a object'
    );
});