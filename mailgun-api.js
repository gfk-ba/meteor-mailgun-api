var mailgunJS = Npm.require('mailgun-js');

Mailgun = (function () {
    'use strict';
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
     * @param {String} [emailObject.to] Address to which to sent the email
     * @param {String} [emailObject.cc] Address to which to cc the email
     * @param {String} [emailObject.bcc] Address to which to bcc the email
     * @param {String} [emailObject.html] The html version of the email
     * @param {String} [emailObject.text] The text version of the email
     * @param {String} [emailObject.subject] the subject of the email
     * @param {Array} [emailObject.tags] Tags to sent to mailgun
     * @param {Object} options [options={}] The options to use for sending the email
     * @param {String} [options.testmode] Adds mailgun testmode parameter
     * @returns {Object} result
     * @returns {Object} result.error Object containing the error given during the sending of the mail
     * @returns {String} result.response response returned by email provider wrapper
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

        this.api.messages().send(emailObject, function (error, response) {
            response = response || {};
            future.return({error: error, response: response});
        });

        return future;
    };

    /***
     * Checks if a key exists if so replaces the value with a string valued 'yes' or 'no'
     *
     * @param {Object} obj The object that holds the keys to convert
     * @param {Array|String} keys the key(s) to convert to a value mailgun understands
     * @private
     */
    constructor.prototype._convertBooleans = function (obj, keys) {
        var value;
        keys = _.isArray(keys) ? keys : [keys];


        _.each(keys, function (key) {
            value = obj[key];

            if (!_.isUndefined(value)) {
                if (_.isBoolean(value)) {
                    value = value ? 'yes' : 'no';
                } else if (_.isString(value)) {
                    value = value === 'no' ? 'no' : 'yes';
                } else {
                    value = !!value;
                }
                obj[key] = value;
            }
        });
    };
    /***
     * Converts a date string or date object to a RFC2822 timestring
     * @param {Date|String} date the date to convert to a RFC2822 timestring
     * @returns {String} The RFC2822 Timestring
     * @private
     */
    constructor.prototype._convertDateToTimeString = function (date) {
        date = date instanceof Date ? date : new Date(date);
        return (date / 1000).toString();
    };

    /***
     * Converts RFC2822 Timestring to a Date object
     * @param {String} timestring the RFC2822 timestring as returned by mailgun
     * @returns {Date} The date object
     * @private
     */
    constructor.prototype._convertTimeStringToDate = function (timestring) {
        return new Date(timestring * 1000);
    };


    /***
     * Checks events for the given filter.
     * @param filter [filter={}] The filter to use for retrieving the events see: http://documentation.mailgun.com/api-events.html#filter-field
     * @param {Date|String} [filter.beginDate] The beginning of the time range to select log records from. By default it is the time of the request
     * @param {Date|String} [filter.endDate] The end of the time range and the direction of the log record traversal. If end is less than begin, then traversal is performed in the timestamp descending order, otherwise in timestamp ascending order. By default, if ascending is yes, then it is a date in the distant future, otherwise a date in the distant past.
     * @param {Boolean} [filter.ascending=false] The direction of log record traversal. If end is also specified, then the relation between begin and end should agree with the ascending value, otherwise an error will be returned. The default value is deduced from the begin and end relation. If end is not specified, then the value is no, effectively defining traversal direction from begin, to the past, until the end of time.
     * @param {Boolean} [filter.pretty=true] Defaults to true on the server
     * @returns {Future}
     */
    constructor.prototype.getEvents = function (filter) {
        var future = new Future(),
            self = this;
        filter = filter || {};

        if (filter.beginDate) {
            filter.begin = this._convertDateToTimeString(filter.beginDate);
            delete filter.beginDate;
        }

        if (filter.endDate) {
            filter.end = this._convertDateToTimeString(filter.endDate);
            delete filter.endDate;
        }

        this._convertBooleans(filter, ['ascending', 'pretty']);

        this.api.events().get(filter, function (error, response) {
            response = response || {};
            var items = response.items || [];
            _.each(response.items, function (item) {
                item.date = self._convertTimeStringToDate(item.timestamp);
            });
            future.return({error: error, items: items});
        });

        return future;
    };

    constructor.prototype.CONST = {
        EVENTTYPES: {
            ACCEPTED: 'accepted',
            REJECTED: 'rejected',
            DELIVERED: 'delivered',
            FAILED: 'failed',
            OPENED: 'openend',
            CLICKED: 'clicked',
            UNSUBSCRIBED: 'unsubscribed',
            COMPLAINED: 'complained',
            STORED: 'stored'
        }
    };

    return constructor;
}());
