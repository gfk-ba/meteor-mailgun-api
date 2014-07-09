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

		it('Should put a instance of mailgun-js on api', function () {
			var mailgunJs = Npm.require('mailgun-js'),
				testMailgun = new Mailgun({});

			expect(testMailgun.api).to.be.instanceof(mailgunJs);
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

		it('Should call api.get', function () {
			var testFilter = {
					test: 123
				},
				oldGet = instance.api.get,
				calledWith;

			//Manual stub because sinon doesn't like it when you try to stub something in __proto__
			instance.api.events().__proto__.get = function () {
				calledWith = arguments;
				oldGet.apply(this, arguments);
			};

			instance.getEvents(testFilter);

			expect(calledWith[0]).to.eql({"test":123});

			instance.getEvents();

			expect(calledWith[0]).to.eql({});
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
} ());