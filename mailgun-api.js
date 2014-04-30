var mailgunJS = Npm.require('mailgun-js');

Mailgun = (function () {
    /***
     * Constructs a new instance of the mailgun wrapper
     * @param {Object} options
     * @param {String} options.apiKey The api key to use in communication with mailgun
     * @param {String} options.domain The domain to use in communication with mailgun
     * @constructor
     */
    var constructor = function (options) {
        this.api = new mailgunJS({
            apiKey: options.apiKey,
            domain: options.domain
        });
    };

    var Future = Npm.require('fibers/future');

    /***
     * Sends the email to mailgun
     *
     * @param {Object} emailObject
     * @param {String} emailObject.to Address to which to sent the email
     * @param {String} emailObject.cc Address to which to cc the email
     * @param {String} emailObject.bcc Address to which to bcc the email
     * @param {String} [emailObject.html] The html version of the email
     * @param {String} [emailObject.text] The text version of the email
     * @param {String} [emailObject.subject] the subject of the email
     * @param {Array} [emailObject.tags] Tags to sent to mailgun
     * @param {Object} options [options={}] The options to use for sending the email
     * @param {String} [options.testmode] Adds mailgun testmode parameter
     * @returns {Object} result
     * @returns {Object} result.error Object containing the error given during the sending of the mail
     * @returns {String} result.message response returned by email provider wrapper
     */
    constructor.prototype.send = function (emailObject, options) {
        var future = new Future();

        options = options || {};

        if(options.testmode) {
            emailObject['o:testmode'] = true;
        }

        if(emailObject.tags) {
            emailObject['o:tag'] = _.clone(emailObject.tags);
            delete emailObject.tags;
        }

        this.api.messages().send(emailObject, function (err, body) {
            future.return({error: err, message: body});
        });

        return future;
    };

    return constructor;
}());
