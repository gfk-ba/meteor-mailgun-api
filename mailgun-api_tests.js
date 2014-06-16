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

        testMailgun.api.events().__proto__.get = function () {
            calledWith = arguments;
            oldGet.apply(this, arguments);
        };

        testMailgun.getEvents(testFilter);

        test.equal(
            calledWith[0],
            {"test":123},
            'Should pass given filter object as filter'
        );

        testMailgun.getEvents();

        test.equal(
            calledWith[0],
            {},
            'Should pass empty object as filter when no filter is given as argument'
        );
    });

    Tinytest.add('Mailgun - getEvents - Future should return the events in the response', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'}),
            testError = new Error(['Testing errors']),
            testResponse = {
                items: [
                    {
                        event: testMailgun.CONST.EVENTTYPES.ACCEPTED,
                        timestamp: '14234991213.01'
                    }
                ]
            };

        testMailgun.api.events().__proto__.get = function (filter, cb) {
            cb(testError);
        };

        var result1 = testMailgun.getEvents({}).wait();

        test.equal(
            result1,
            {
                error: testError,
                items: []
            },
            'Should return the given error'
        );

        testMailgun.api.events().__proto__.get = function (filter, cb) {
            cb(undefined, testResponse);
        };

        var result2 = testMailgun.getEvents({}).wait();

        test.equal(
            result2,
            {
                error: undefined,
                items: testResponse.items
            },
            'Should return items in the response given by the api'
        );

        test.equal(
            (result2.items[0].date / 1000).toString(),
            testResponse.items[0].timestamp,
            'Should add a date object to the event'
        );
    });

    Tinytest.add('Mailgun - getEvents - When the given filter contains a beginDate and endDate ', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'}),
            testResponse = {
                items: [
                    {
                        event: testMailgun.CONST.EVENTTYPES.ACCEPTED
                    }
                ]
            },
            beginDate = new Date() - 1000,
            endDate = new Date(),
            actualFilter;

        testMailgun.api.events().__proto__.get = function (filter, cb) {
            actualFilter = filter;
            cb(undefined, testResponse);
        };

        var result = testMailgun.getEvents({
            beginDate: beginDate,
            endDate: new Date()
        }).wait();

        test.equal(
            actualFilter.begin,
            (beginDate / 1000).toString(),
            'Should add a begin property to the filter passed to mailgun-js'
        );

        test.equal(
            actualFilter.end,
            (endDate / 1000).toString(),
            'Should add a begin property to the filter passed to mailgun-js'
        );

        test.isUndefined(
            actualFilter.beginDate,
            'Should not pass beginDate trough to mailgun-js'
        );

        test.isUndefined(
            actualFilter.endDate,
            'Should not pass beginDate trough to mailgun-js'
        );
    });

    Tinytest.add('Mailgun - getEvents - When the given filter contains a value for ascending ', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'}),
            valueForAscending;

        testMailgun.api.events().__proto__.get = function (filter, cb) {
            valueForAscending = filter.ascending;
            cb();
        };

        testMailgun.getEvents({
            ascending: true
        }).wait();


        test.equal(
            valueForAscending,
            'yes',
            'When ascending is true it should pass yes to mailgun'
        );

        testMailgun.getEvents({
            ascending: false
        }).wait();


        test.equal(
            valueForAscending,
            'no',
            'When ascending is false it should pass no to mailgun'
        );

        testMailgun.getEvents({
            ascending: 'no'
        }).wait();


        test.equal(
            valueForAscending,
            'no',
            'When ascending is no it should pass no to mailgun'
        );


        testMailgun.getEvents({
            ascending: 'yes'
        }).wait();


        test.equal(
            valueForAscending,
            'yes',
            'When ascending is yes it should pass yes to mailgun'
        );
    });

    Tinytest.add('Mailgun - getEvents - When the given filter contains a value for pretty ', function (test) {
        var testMailgun = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'}),
            valueForPretty;

        testMailgun.api.events().__proto__.get = function (filter, cb) {
            valueForPretty = filter.pretty;
            cb();
        };

        testMailgun.getEvents({
            pretty: true
        }).wait();


        test.equal(
            valueForPretty,
            'yes',
            'When pretty is true it should pass yes to mailgun'
        );

        testMailgun.getEvents({
            pretty: false
        }).wait();


        test.equal(
            valueForPretty,
            'no',
            'When pretty is false it should pass no to mailgun'
        );

        testMailgun.getEvents({
            pretty: 'no'
        }).wait();


        test.equal(
            valueForPretty,
            'no',
            'When pretty is no it should pass no to mailgun'
        );


        testMailgun.getEvents({
            pretty: 'yes'
        }).wait();


        test.equal(
            valueForPretty,
            'yes',
            'When pretty is yes it should pass yes to mailgun'
        );
    });

//</editor-fold>
} ());