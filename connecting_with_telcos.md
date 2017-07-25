# Connecting with telcos
This document outlines the basic requests that should be made of telco providers when we approach them to integrate with their systems. We we _can_ connect in other ways, a basic, JSON-based REST API is the web standard and it is what we look for.

## Sending SMS from Mogli to local recipients
In order to send SMS messages, we will make an HTTP post to a URL that you specify with basic authentication and a content type of application/json. It will contain the recipient address and text as key:value pairs. Using CURL for testing purposes, the post will look like this: 
 
```sh
curl -X POST \
  https://www.something- orange.com/api/send \
  -H 'authorization: Basic dGF5bG9yOnNlY3JldA==' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{"recipient":959011728, " text": "Bonjour le monde!"}'
```

For additional clarity here, see Orange's API documentation in Niger: https://developer.orange.com/apis/sms-ne/api-reference
 
## Receiving SMS from local recipients

We will expect that Orange will make a similar HTTP post to our url (https://www.openfn.org/inbox/something-secret) with the content of the message and the sender whenever an SMS is received.

Note that these posts are delivered over HTTPS and use modern standard authentication ("Basic Auth") but that there is no VPN connection required.
