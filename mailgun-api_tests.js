(function () {
    'use strict';
//<editor-fold desc="Instantiation tests">
    Tinytest.add('Mailgun - Test API', function (test) {
        var testMailgun = new Mailgun({});
        test.equal(
            typeof testMailgun.api,
            'object',
            'Expect Mailgun.api to be a object'
        );
    });

    Tinytest.add('Mailgun - When given options - Expect api options to be set', function (test) {
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
//</editor-fold>

//<editor-fold desc="Send tests">
    Tinytest.add('Mailgun - Send - Expect options to be passed', function (test) {
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

    Tinytest.add('Mailgun - Send - Should construct a proper message', function (test) {
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

    Tinytest.add('Mailgun - Send - Call callback with right arguments', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});
        var testError = {
            foo: 'bar'
        };

        var testResponse = {
            id: '<123@mailgun.org>',
            message: 'Queued. Thank you'
        };

        var testCb = function (error, response) {
            test.equal(
                error,
                testError,
                'Should pass given error to callback'
            );

            test.equal(
                response,
                testResponse,
                'Should pass given response to callback'
            );
        };

        testMailgun.api.messages().__proto__.send = function (data, cb) {
            cb(testError, testResponse);
        };

        testMailgun.send({}, testCb);
    });
//</editor-fold>

//<editor-fold desc="getEvents tests">
    Tinytest.add('Mailgun - getEvents - Should have constants for the different events', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});
        test.equal(
            typeof testMailgun.CONST,
            'object',
            'Expect Mailgun.api to have a CONST object in prototype'
        );

        test.equal(
            typeof testMailgun.CONST.EVENTTYPES,
            'object',
            'Expect Mailgun.api to have a CONST.EVENTTYPES object in prototype'
        );

        test.isTrue(
            _.size(testMailgun.CONST.EVENTTYPES) > 0,
            'CONST.EVENTTYPES object to not be empty'
        );
    });

    Tinytest.add('Mailgun - getEvents - Should call api.get', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'}),
            testFilter = {
                test: 123
            },
            oldGet = testMailgun.api.get,
            calledWith;

        testMailgun.api.get = function () {
            calledWith = arguments;
            oldGet.apply(this, arguments);
        };

        testMailgun.getEvents(testFilter);

        test.equal(
            calledWith[0],
            '/events',
            'Should pass /events as first argument'
        );

        test.equal(
            calledWith[1],
            testFilter,
            'Should pass given filter object as filter'
        );

        testMailgun.getEvents();

        test.equal(
            calledWith[1],
            {},
            'Should pass empty object as filter when no filter is given as argument'
        );
    });

    Tinytest.add('Mailgun - getEvents - Future should return api response', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'}),
            testError = new Error(['Testing errors']),
            testResponse = {message: 'BlaBlaBla!', foo: 'Bar!'};

        testMailgun.api.get = function (endPoint, filter, cb) {
            cb(testError);
        };

        var result1 = testMailgun.getEvents({}).wait();

        test.equal(
            result1,
            {
                error: testError,
                response: undefined
            },
            'Should return the given error'
        );

        testMailgun.api.get = function (endPoint, filter, cb) {
            cb(undefined, testResponse);
        };

        var result2 = testMailgun.getEvents({}).wait();

        test.equal(
            result2,
            {
                error: undefined,
                response: testResponse
            },
            'Should return response given by the api'
        );
    });

//</editor-fold>
} ());