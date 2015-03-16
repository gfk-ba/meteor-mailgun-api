(function () {
    'use strict';
//<editor-fold desc="Instantiation tests">
	describe('Mailgun - Test API', function () {
		var sandbox;
		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('Should create a object for .api', function () {
			var testMailgun = new Mailgun({});
			expect(testMailgun.api).to.be.a('object');
		});

		it('When given options - expect apiKey to be set', function () {
			var testApiKey = 'Test',
				testMailgun = new Mailgun({ apiKey: testApiKey, domain: 'mail.somewhere.com'});
			expect(testMailgun.api.apiKey).to.equal(testApiKey);
		});

		it('When given options - expect Domain to be set', function () {
			var testApiKey = 'Test',
				testDomain = 'mail.somewhere.com',
				testMailgun = new Mailgun({ apiKey: testApiKey, domain: testDomain});
			expect(testMailgun.api.domain).to.equal(testDomain);
		});
	});
//</editor-fold>

//<editor-fold desc="Send tests">
	describe('Mailgun - #Send', function () {
		var sandbox, instance;
		beforeEach(function () {
			sandbox = sinon.sandbox.create();
			instance = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('Expect testmode to be passed on', function () {
			var send = sandbox.stub(instance, '_send').returns({wait: function () { return {response: '', error: ''};}});

			instance.send({from:'test@test.com'}, {
				testmode: true
			});

			expect(send.args[0][0]['o:testmode']).to.equal(true);
		});

		it('Should create a valid emailobject', function () {
			var send = sandbox.stub(instance, '_send').returns({wait: function () { return {response: '', error: ''};}});

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

			instance.send(_.clone(testPayload));
			var expected = _.clone(testPayload);

			expected['o:tag'] = expected.tags;
			delete expected.tags;

			expect(send).to.have.been.calledWith(expected);
		});

		it('Should save email to disk when options.saveEmailTo is defined', function () {
			var send = sandbox.stub(instance, '_send').returns({wait: function () { return {response: '', error: ''};}}),
				fs = Npm.require('fs'),
				mkdirp = Npm.require('mkdirp');

			var writeFile = sandbox.stub(fs, 'writeFile', function (target, content, cb) {
				cb();
			});

			var mkdirpStub = sandbox.stub(mkdirp, 'mkdirp', function (nothing, cb) {
				cb(null, null);
			});

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

			var testOptions = {
				saveEmailTo: '/some/test/dir/bla.html'
			};

			instance.send(_.clone(testPayload), testOptions);

			var expected = testOptions.saveEmailTo.split('/');
			expected.pop();
			expected = expected.join('/');

			expect(mkdirpStub).to.have.been.calledWith(expected);
			expect(writeFile).to.have.been.calledWith(testOptions.saveEmailTo, testPayload.html);
		});

	});
//</editor-fold>

//<editor-fold desc="getEvents tests">
	describe('Mailgun - #getEvents', function () {
		var sandbox, instance;
		beforeEach(function () {
			sandbox = sinon.sandbox.create();
			instance = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('Should have constants for the different events', function () {
			expect(instance.CONST).to.be.a('object');
			expect(instance.CONST.EVENTTYPES).to.be.a('object');
			expect(_.size(instance.CONST.EVENTTYPES)).to.be.at.least(1);
		});

		it('Should return the events in the response', function () {
			var testError = new Error(['Testing errors']),
				testResponse = {
					items: [
						{
							event: instance.CONST.EVENTTYPES.ACCEPTED,
							timestamp: '14234991213.01'
						}
					]
				};

			instance.api.events().__proto__.get = function (filter, cb) {
				cb(testError);
			};

			var result1 = instance.getEvents({}).wait();

			expect(result1).to.eql({error: testError, items:[]});

			instance.api.events().__proto__.get = function (filter, cb) {
				cb(undefined, testResponse);
			};

			var result2 = instance.getEvents({}).wait();

			expect(result2).to.eql({
				error: undefined,
				items: testResponse.items
			});

			expect((result2.items[0].date / 1000).toString()).to.equal(testResponse.items[0].timestamp);
		});

		it('When given a filter - When called with beginDate/endDate - Should convert the beginDate and endDate to a begin and end timestamp', function () {
			var testResponse = {
					items: [
						{
							event: instance.CONST.EVENTTYPES.ACCEPTED
						}
					]
				},
				beginDate = new Date() - 1000,
				endDate = new Date(),
				actualFilter;

			instance.api.events().__proto__.get = function (filter, cb) {
				actualFilter = filter;
				cb(undefined, testResponse);
			};

			instance.getEvents({
				beginDate: beginDate,
				endDate: new Date()
			}).wait();

			expect(actualFilter.begin).to.equal((beginDate / 1000).toString());
			expect(actualFilter.end).to.equal((endDate / 1000).toString());
			expect(actualFilter.beginDate).to.be.an('undefined');
			expect(actualFilter.endDate).to.be.an('undefined');
		});

		it('When given a filter - When the given filter contains a value for ascending - Should convert true/false to yes/no', function () {
			var yes = 'yes', no = 'no', valueForAscending;

			instance.api.events().__proto__.get = function (filter, cb) {
				valueForAscending = filter.ascending;
				cb();
			};

			instance.getEvents({
				ascending: true
			}).wait();

			expect(valueForAscending).to.equal(yes);

			instance.getEvents({
				ascending: false
			}).wait();

			expect(valueForAscending).to.equal(no);
		});

		it('When given a filter - When the given filter contains a value for ascending - Should not convert yes or no', function () {
			var yes = 'yes', no = 'no', valueForAscending;

			instance.api.events().__proto__.get = function (filter, cb) {
				valueForAscending = filter.ascending;
				cb();
			};

			instance.getEvents({
				ascending: yes
			}).wait();


			expect(valueForAscending).to.equal(yes);

			instance.getEvents({
				ascending: no
			}).wait();

			expect(valueForAscending).to.equal(no);
		});

		it('When given a filter - When the given filter contains a value for pretty - Should convert true/false to yes/no', function () {
			var yes = 'yes', no = 'no', valueForPretty;

			instance.api.events().__proto__.get = function (filter, cb) {
				valueForPretty = filter.pretty;
				cb();
			};

			instance.getEvents({
				pretty: true
			}).wait();

			expect(valueForPretty).to.equal(yes);

			instance.getEvents({
				pretty: false
			}).wait();

			expect(valueForPretty).to.equal(no);
		});

		it('When given a filter - When the given filter contains a value for pretty - Should not convert yes or no', function () {
			var yes = 'yes', no = 'no', valueForPretty;

			instance.api.events().__proto__.get = function (filter, cb) {
				valueForPretty = filter.pretty;
				cb();
			};

			instance.getEvents({
				pretty: yes
			}).wait();


			expect(valueForPretty).to.equal(yes);

			instance.getEvents({
				pretty: no
			}).wait();

			expect(valueForPretty).to.equal(no);
		});


	});
//</editor-fold>

//<editor-fold desc="handleEvents tests">
	describe('Mailgun - #handleEvents', function () {
		var sandbox, instance, testResponse, testResponseItem, getEvents, testFilter, testHandlers, eventTypes, testItems;

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
			instance = new Mailgun({ apiKey: 'Test', domain: 'mail.somewhere.com'});

			testResponse = {
				"items": [
				],
				"errors": undefined
			};

			testResponseItem = {
				"tags": [],
				"envelope": {
					"transport": "smtp",
					"sender": "postmaster@samples.mailgun.org",
					"sending-ip": "184.173.153.199"
				},
				"delivery-status": {
					"message": "",
					"code": 0,
					"description": null
				},
				"campaigns": [],
				"user-variables": {},
				"flags": {
					"is-authenticated": true,
					"is-test-mode": false
				},
				"timestamp": 1377208314.173742,
				"message": {
					"headers": {
						"to": "recipient@example.com",
						"message-id": "20130822215151.29325.59996@samples.mailgun.org",
						"from": "sender@example.com",
						"subject": "Sample Message"
					},
					"attachments": [],
					"recipients": [
						"recipient@example.com"
					],
					"size": 31143
				},
				"recipient": "recipient@example.com",
				"event": "delivered"
			};

			getEvents = sandbox.stub(instance, 'getEvents').returns({
				wait: function () {
					return testResponse;
				}
			});

			testFilter = {};
			testHandlers = {};

			_.each(eventTypes, function (event) {
				testHandlers[event] = sinon.spy();
			});

			testHandlers.before = sinon.spy();

			eventTypes = instance.CONST.EVENTTYPES;
			testItems = testResponse.items;
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('Should call getEvents', function () {
			testFilter = {begin:123};

			instance.handleEvents(testFilter);

			expect(getEvents).to.have.been.calledWith(testFilter);
		});

		it('When called with eventHandlers - Should call the appropiate handler for the appropiate event', function () {
			var testData = {};

			_.each(eventTypes, function (event) {
				var testItem = _.clone(testResponseItem);
				testItem.event = event;
				testItems.push(testItem);

				testData[event] = testItem;
			});

			instance.handleEvents(testFilter, testHandlers);

			_.each(eventTypes, function (event) {
				expect(testHandlers.before).to.have.been.calledBefore(testHandlers[event]);
				expect(testHandlers.before).to.have.been.calledWith(testData[event]);
				expect(testHandlers[event]).to.have.been.calledWith(testData[event]);
			});
		});

		it('When called with eventHandlers - When getEvents returns a error - It should return that error', function () {
			var testError = new Error('Foobar');

			testResponse = {
				error: testError
			};

			var res = instance.handleEvents(testFilter, testHandlers);

			expect(res.error).to.eql(testError);
		});


		it('When called without eventHandlers - it should return a error', function () {
			var res = instance.handleEvents({});

			expect(_.isString(res.error.message)).to.equal(true);
		});
	});
//</editor-fold>


} ());
