(function () {
    'use strict';
    Npm.depends({
        'mailgun-js': '0.5.4',
        'mkdirp': '0.3.5'
    });

    Package.describe({
        summary: "Mailgun API - Mailgun api implementation for Meteor."
    });

    Package.on_use(function(api) {
        // Allow us to detect 'insecure'.
        api.use('insecure', {weak: true});

        api.add_files('mailgun-api.js', ['server']);
        api.export('Mailgun', ['server']);
    });

    Package.on_test(function (api) {
        api.use(['mailgun-api', 'tinytest', 'munit', 'sinon', 'chai']);

        api.add_files('mailgun-api_tests.js', ['server']);
    });
} ());