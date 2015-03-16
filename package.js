'use strict';

function configurePackage (api) {
	Npm.depends({
		'mailgun-js': '0.6.8',
		'mkdirp': '0.3.5'
	});

	api.use('insecure', {weak: true});

	if (api.versionsFrom) {
		api.versionsFrom('METEOR@0.9.0');

	}

	api.add_files('mailgun-api.js', ['server']);
}




Package.describe({
	summary: 'Mailgun API - Mailgun api implementation for Meteor.',
	version: '1.0.0',
	git: 'https://github.com/gfk-ba/meteor-mailgun-api'
});

Package.on_use(function(api) {
	configurePackage(api);
	api.export('Mailgun', ['server']);
});

Package.on_test(function (api) {
	configurePackage(api);

	api.use(['gfk:mailgun-api', 'tinytest@1.0.0', 'gfk:munit@1.0.0', 'mdj:chai@1.0.0', 'mdj:sinon@1.0.0'], 'server');

	api.add_files('mailgun-api_tests.js', ['server']);
});
