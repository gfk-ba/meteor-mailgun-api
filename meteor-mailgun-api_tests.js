Tinytest.add('MeteorMailgunAPI - Test API', function (test) {
    var testMailgun = new Mailgun({});
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

Tinytest.add('MeteorMailgunAPI - Send - Expect options to be passed', function (test) {
    var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});
    var givenData = {};

    var actualSend = testMailgun.api.messages().__proto__.send; //TODO: Find a better way of spying with tinytest
    testMailgun.api.messages().__proto__.send = function (data) {
        givenData = data;
        actualSend.apply(this, arguments);
    };

    testMailgun.send({from:'test@test.com'}, {
        testmode: true
    });

    test.equal(
        givenData['o:testmode'],
        true,
        'Expect o:testmode to be true'
    );
});

Tinytest.add('MeteorMailgunAPI - Send - Should construct a proper message', function (test) {
    var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});
    var givenData = {};

    var actualSend = testMailgun.api.messages().__proto__.send; //TODO: Find a better way of spying with tinytest
    testMailgun.api.messages().__proto__.send = function (data) {
        givenData = data;
        actualSend.apply(this, arguments);
    };

    var testPayload = {
        "to": "test@test.com",
        "from": "no-reply@test.com",
        "html": "<html><head></head><body>This is a test</body></html>",
        "text": "This is a test",
        "subject": "testSubject",
        "tags": [
            "some",
            "test",
            "tags"
        ]
    };

    testMailgun.send(_.clone(testPayload));

    test.equal(
        givenData.to,
        testPayload.to,
        'Should pass to'
    );

    test.equal(
        givenData.cc,
        undefined,
        'Should not add a cc when not given'
    );

    test.equal(
        givenData.bcc,
        undefined,
        'Should not add a bcc when not given'
    );

    test.equal(
        givenData.from,
        testPayload.from,
        'Should pass from'
    );



    test.equal(
        givenData.html,
        testPayload.html,
        'Should pass html'
    );

    test.equal(
        givenData.text,
        testPayload.text,
        'Should pass text'
    );

    test.equal(
        givenData.subject,
        testPayload.subject,
        'Should pass subject'
    );

    test.equal(
        givenData['o:tag'],
        testPayload.tags,
        'Should pass tags'
    );
});