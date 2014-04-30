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


Note
-----
www.pleasegiveuslotsofmoney.com as domain maybe a bit obvious.


Contributions
-------------
Any contributions are welcome. Please create an issue on github to start a discussion about the contribution you're planning to make.