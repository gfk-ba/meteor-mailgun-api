Mailgun API
=====================
[![Build Status](https://secure.travis-ci.org/gfk-ba/meteor-mailgun-api.png)](http://travis-ci.org/gfk-ba/meteor-mailgun-api)

Mailgun API - Mailgun api implementation for Meteor.

Description
------------
Meteor wrapper for [mailgun-js](https://www.npmjs.org/package/mailgun-js)
This module wraps base functionality you'd want from the mailgun.api. Use this if you want to abstract away raw mailgun api useage.
Feel free to add more wrapper methods and submit them via pull request.
The instance of the npm module lives in Mailgun.api so use that for calling methods in https://github.com/1lobby/mailgun-js

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
* **String** *emailObject.to* Address to which to sent the email
* **String** *emailObject.cc* Address to which to cc the email
* **String** *emailObject.bcc* Address to which to bcc the email
* **String** *[emailObject.html]* The html version of the email
* **String** *[emailObject.text]* The text version of the email
* **String** *[emailObject.subject]* the subject of the email
* **Array** *[emailObject.tags]* Tags to sent to mailgun
* **Object** *options* [options={}] The options to use for sending the email
* **String** *[options.testmode]* Adds mailgun testmode parameter

Note
-----
www.pleasegiveuslotsofmoney.com as domain maybe a bit obvious.


Contributions
-------------
Any contributions are welcome. Please create an issue on github to start a discussion about the contribution you're planning to make.