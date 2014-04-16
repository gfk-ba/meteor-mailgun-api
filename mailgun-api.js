var mailgunJS = Npm.require('mailgun-js');

Mailgun = (function () {
    var constructor = function (options) {
        options = options || {};
        this.api = new mailgunJS(options);
    };

    return constructor;
}());
