# Service Node Service Template
The [Service Node](https://www.catchtechnologies.com/service-node/) allows you to run your own custom services. A custom service is a node.js application that Service Node launches instances of as child processes. Different service instances communicate with each other through a publish/subscribe (pusub) bus.  

This template includes:  
- pubsub messaging with the catch-messaging package  
- an example of the package.json fields Service Node uses for:  
  - building the service  
  - launching service instances with custom parameters  
  - defining commands the service can receive  
  - defining responses the service can send  

## redis pubsub  
Service Node uses (redis)[https://redis.io] pubsub for messaging between services. Values are published to a channel and any service listening on that channel is informed whenever the channel is published to.  A pubsub message consists of a channel and a value. The value may be empty.  

Your service can use the pubsub bus directly with [node-redis](https://github.com/NodeRedis/node-redis#pubsub), or use Catch Messaging.

## Catch Messaging  
Catch Messaging integrates redis pubsub with a messaging format that works with the Service Node dashboard. Your app must be programmed to accept commands and emit responses as strings.  

Default commands and responses are defined in package.json. The messages can be modified per instance in Service Node's dashboard and csv files can be imported through the dashboard to handle large numbers of messages.  

Catch Messaging analyzes the pubsub channels for each command and response to prevent loops. If a command uses the same channel as one of the responses, the command will not subscribe to the channel.  

## Service Parameters  
Service parameter values are entered in Service Node's dashboard passed to your application when the service instance is started.  

This template uses [yargs](https://www.npmjs.com/package/yargs) to parse service parameters.  

The following parameter types are support:
- `serviceName` The service name is always passed to to the service instance as argv.serviceName. serviceName should not be included in package.json.   
- `string` A string.  
- `number` A number.  
- `bool` Either `true` or `false`.  
- `array` An array of strings. One array element is selectable in Service Node's dashboard.  

Here is an example of how the `parameters` field should look in package.json:  
```json
"parameters": [
    {
      "parameter": "stringParameter",
      "name": "Sample String Parameter",
      "type": "string",
      "default": "",
      "required": true,
      "placeholder": "Enter the string.",
      "tooltip": "A sample string parameter."
    },
    {
      "parameter": "numberParameter",
      "name": "Sample Number Parameter",
      "type": "number",
      "default": 23,
      "required": false,
      "placeholder": "Enter the number.",
      "tooltip": "A sample number parameter."
    },
    {
      "parameter": "debug",
      "name": "Debug",
      "type": "bool",
      "default": false,
      "required": false,
      "placeholder": "",
      "tooltip": "Prints debug messages when enabled."
    },
    {
      "parameter": "arrayParameter",
      "name": "Sample Array Parameter",
      "type": "array",
      "options": [
        {
          "label": "Value 1",
          "value": "value 1"
        },
        {
          "label": "Value 2",
          "value": "value 2"
        }
      ],
      "default": "string",
      "required": false,
      "tooltip": "A sample array parameter."
    }
  ]
``` 

## Service Commands  
Service Commands are sent to your application with [repl](https://nodejs.org/api/repl.html) and parsed to call a function.  

Defining your commands in package.json allows them to be edited in Service Node's dashboard and be assigned to a pubsub channel.  

In the following example, when another service publishes to `example.service.connect`, the string `connect` will be sent to the `processCommand()` function in this template.  

Set `useHex` to true to use hexadecimal formatting for the command.  

`endWith` defines the final charachter(s) of the command. Valid values are:  
- `none` No extra characters.  
- `r` Carriage return.  
- `n` Line feed.  
- `rn` Carriage return and Line feed.  

The pubsub value can be passed into the command by including the string `#PAYLOAD#` in the command pattern.  

Here is an example of how the `commands` field should look in package.json:  
```json
"commands": [
    {
      "name": "Connect",
      "editable": true,
      "pattern": "connect",
      "useHex": false,
      "endWith": "none",
      "descriptions": [
        {
          "title": "Description",
          "body": "Connects the service."
        }
      ],
      "channel": "example.service.connect"
    },
    {
      "name": "Disconnect",
      "editable": true,
      "pattern": "disconnect",
      "useHex": false,
      "endWith": "none",
      "descriptions": [
        {
          "title": "Description",
          "body": "Disconnects the service."
        }
      ],
      "channel": "example.service.disconnect"
    },
    {
      "name": "Send Command",
      "editable": true,
      "pattern": "#PAYLOAD#",
      "useHex": false,
      "endWith": "none",
      "descriptions": [
        {
          "title": "Description",
          "body": "Sends the channel value to the service."
        }
      ],
      "channel": "example.service.send"
    }
  ]
```
## Service Responses  
Service Responses are sent from your application to the Catch Messaging package and published to the channel defined.  

Defining your responses in package.json allows them to be edited in Service Node's dashboard and be assigned to a pubsub channel.  

In the following example, when your app sends the string `connected` to Catch Messaging, a value of `null` is published to the channel `example.service.connected`.  

`useHex` and `endWith` fields are used the same way as Service Commands.  

`useRegularExpression` allows you to embed a value to be published in the response string. Include `^(.+)$` in the response pattern to embed a value. Everything not included in the pattern before the `(` will be published as the value.  

### Regular Expression Example  
If the pattern is defined as:  
``^lighting load = (.+)$``  

And the service sends to Catch Messaging:  
`lighting load = 77`  

The value `77` gets published the channel defined for the response.  

Here is an example of how the `responses` field should look in package.json:  
```json
"responses": [
    {
      "name": "Connected",
      "editable": true,
      "pattern": "connected",
      "useHex": false,
      "endWith": "none",
      "descriptions": [
        {
          "title": "Description",
          "body": "Indicates when the service is connected."
        }
      ],
      "channel": "example.service.connected"
    },
    {
      "name": "Disconnected",
      "editable": true,
      "pattern": "disconnected",
      "useHex": false,
      "endWith": "none",
      "descriptions": [
        {
          "title": "Description",
          "body": "Indicates when the service is disconnected."
        }
      ],
      "channel": "example.service.disconnected"
    },
    {
      "name": "Received",
      "editable": true,
      "pattern": "^(.+)$",
      "useHex": false,
      "endWith": "none",
      "useRegularExpression": true,
      "descriptions": [
        {
          "title": "Description",
          "body": "Returns all replies without special ending characters from the service."
        }
      ],
      "channel": "example.service.received"
    }
  ]
  ```

## Declaring Build Assets  
After your service is uploaded to Service Node, it is built into a single file using [pkg](https://github.com/zeit/pkg).  

The entry point of you application must be included in the `bin` field of package.json:  
`"bin": "main.js"`  

Define any external assets your build requires in package.json as follows (this example includes all `.js` files from a directory named `js`):  
```json
"pkg": {
  "scripts": "js/**/*.js"
}
```
See [the pkg repository](https://github.com/vercel/pkg#config) for more information on including external assets.  

## Create A Test Build  
It is a good idea to create a test build before uploading to Service Node to see if there are any issues. See [the pkg repository](https://github.com/vercel/pkg) for details.  

## Deploy To Service Node  
To prepare your application for Service Node, compress all the needed files into a `.zip` file. Service Node runs npm install during the build process, so there is no need to include the `node_modules` folder. Any unneeded files should be excluded to keep the compressed file size down for uploading.  

Then click the Gear icon on you Service Node dashboard, navigate to `Service Library`and click `Upload New Service`.  

Service Node then does the following:  
- Uploads the zip file.  
- Unzips it.  
- Runs npm install.  
- Runs pkg.  
- Saves the file compiled with pkg and package.json to create future service instances.  
- Deletes all other files.  

## Using the Service  
To create an instance of your service, click the Gear icon on you Service Node dashboard, navigate to `Services`and click `Add New Service`. Select your service from the list, give it a name, adjust the parameters and messages and click save. The service will automatically start when saved and every time Service Node starts.  