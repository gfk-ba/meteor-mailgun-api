Mailgun API
=====================
[![Build Status](https://secure.travis-ci.org/gfk-ba/meteor-mailgun-api.png)](http://travis-ci.org/gfk-ba/meteor-mailgun-api)

Mailgun API - Mailgun api implementation for Meteor.


Release notes
-------------
**v0.5.0** - Send no longer returns a future

Description
------------
Meteor wrapper for [mailgun-js](https://www.npmjs.org/package/mailgun-js)
This module wraps base functionality you'd want from the mailgun.api. Use this if you want to abstract away raw mailgun api useage.
Feel free to add more wrapper methods and submit them via pull request.
The instance of the npm module lives in Mailgun.api so use that for calling methods in https://github.com/1lobby/mailgun-js

There is a example application deployed at [meteor.com](http://mailgun-api-example.meteor.com) [source](https://github.com/gfk-ba/meteor-mailgun-api-example)

Installation
------------
Install this package using [Meteorite](https://github.com/oortcloud/meteorite/):

Usage
-----
Instantiate:
``` javascript
var options = {
    apiKey: 'ablalbadjkfga',
    domain: 'www.pleasegiveuslotsofmoney.com'
}
var NigerianPrinceGun = new Mailgun(options);
NigerianPrinceGun.send({
                               'to': 'test@test.com',
                               'from': 'no-reply@test.com',
                               'html': '<html><head></head><body>This is a test</body></html>',
                               'text': 'This is a test',
                               'subject': 'testSubject',
                               'tags': [
                                   'some',
                                   'test',
                                   'tags'
                               ]
                           });
```

The reference to the npm package lives in .api for example:
``` javascript
    NigerianPrinceGun.api.lists('mylist@mydomain.com').info().then(function (data) {
      console.log(data);
    }, function (err) {
      console.log(err);
    });
```

See the mailgun-js npm page for more info [mailgun-js](https://www.npmjs.org/package/mailgun-js)

API Documentation
------------


<!-- Start mailgun-api.js -->

## constructor(options)

Constructs a new instance of the mailgun wrapper

### Params: 

* **Object** *options* 
* **String** *options.apiKey* The api key to use in communication with mailgun
* **String** *options.domain* The domain to use in communication with mailgun

## send(emailObject, options)

Sends the email to mailgun

### Params: 

* **Object** *emailObject* 
* **String** *[emailObject.to]* Address to which to sent the email
* **String** *[emailObject.cc]* Address to which to cc the email
* **String** *[emailObject.bcc]* Address to which to bcc the email
* **String** *[emailObject.html]* The html version of the email
* **String** *[emailObject.text]* The text version of the email
* **String** *[emailObject.subject]* the subject of the email
* **Array** *[emailObject.tags]* Tags to sent to mailgun
* **Object** *options* [options={}] The options to use for sending the email
* **String** *[options.testmode]* Adds mailgun testmode parameter
* **String** *[options.saveEmailTo]* Specifies the location to save a copy of the html email to. Tries to create the directories if they don't exist yet

## getEvents([filter={}])

Checks events for the given filter.

### Params: 

* **filter** *[filter={}]* The filter to use for retrieving the events see: http://documentation.mailgun.com/api-events.html#filter-field
* **Date|String** *[filter.beginDate]* The beginning of the time range to select log records from. By default it is the time of the request
* **Date|String** *[filter.endDate]* The end of the time range and the direction of the log record traversal. If end is less than begin, then traversal is performed in the timestamp descending order, otherwise in timestamp ascending order. By default, if ascending is yes, then it is a date in the distant future, otherwise a date in the distant past.
* **Boolean** *[filter.ascending=false]* The direction of log record traversal. If end is also specified, then the relation between begin and end should agree with the ascending value, otherwise an error will be returned. The default value is deduced from the begin and end relation. If end is not specified, then the value is no, effectively defining traversal direction from begin, to the past, until the end of time.
* **Boolean** *[filter.pretty=true]* Defaults to true on the server

Note
-----
www.pleasegiveuslotsofmoney.com as domain maybe a bit obvious.


Contributions
-------------
Any contributions are welcome. Please create an issue on github to start a discussion about the contribution you're planning to make.
