Mailgun = (function () {
    var constructor = function (api_key, domain) {
        this.api = Npm.require('mailgun-js')(api_key, domain);
    };

    return constructor;
}());
