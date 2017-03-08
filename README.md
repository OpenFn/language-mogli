Language Mogli [![Build Status](https://travis-ci.org/OpenFn/language-mogli.svg?branch=master)](https://travis-ci.org/OpenFn/language-mogli)
==============

Language Pack for building expressions and operations to interact with Mogli SMS.

Documentation
-------------

#### sample configuration
```js
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "loginUrl": "https://instance_name.surveycto.com",
  "securityToken": "xxx123",
  "secret": "abc456"
}
```

### Create inbound SMS
```js
createSMS(
  fields(
    field("sender", dataValue("from_number")),
    field("receivedAt", dataValue("timestamp")),
    field("message", dataValue("message"))
  )
);
```

<!-- TODO: determine update process -->
<!-- ### Update SMS status
```js
updateSMS(
  fields(
    field("Id", dataValue("externalId")),
    field("status", dataValue("status"))
  )
);
``` -->

[Docs](docs/index)

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

### Old Mogli inbound SMS creation used language-salesforce
```js
create("Mogli_SMS__SMS__c", fields(
  field("Mogli_SMS__Direction__c", "Inbound"),
  field("Mogli_SMS__Message__c", dataValue("message")),
  // Here we are adding a "+" in front of the number...
  field("Mogli_SMS__Phone_Number__c", function (state) {
    return ("+".concat(dataValue("msisdn")(state)));
  }),
  field("Mogli_SMS__Status__c", "Received Successfully")
));
```

### Old Mogli outbound SMS status update used language-salesforce
```js
update("Mogli_SMS__SMS__c", fields(
  field("Id", dataValue("externalId")),
  // Status must be set to either "Sent Successfully" or the error text.
  field("Mogli_SMS__Status__c", function(state) {
    if (state.data.response.statusCode == 200) {
      return "Sent Successfully";
    } else {
      return state.data.response.body;
    }
  })
));
```
