<a name="ExpressWrapper"></a>

## ExpressWrapper
ExpressWrapper class

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| configuration | <code>Object</code> | module own configuration |
| port | <code>Number</code> | the port on which to start the Express Application |
| dependencies | <code>Object</code> | tool's dependencies injected by Cement according to tool's configuration |
| app | <code>Express</code> | instance of an Express Application |
| server | <code>Http.Server</code> | instance of a HTTP Server |
| isServerStarting | <code>Boolean</code> | whether the HTTP Server has began starting or not |
| routes | <code>Map.&lt;Map&gt;</code> | A Map of Maps of all the routes that have been applied in the Express App. 1st level key is the HTTP Method, 2nd is the path, value is the handler method. |


* [ExpressWrapper](#ExpressWrapper)
    * [new ExpressWrapper(configuration, [dependencies])](#new_ExpressWrapper_new)
    * [.start()](#ExpressWrapper+start)

<a name="new_ExpressWrapper_new"></a>

### new ExpressWrapper(configuration, [dependencies])
ExpressWrapper constructor


| Param | Type | Description |
| --- | --- | --- |
| configuration | <code>Object</code> | module own configuration |
| [dependencies] | <code>Object</code> | tool's dependencies injected by Cement according to tool's configuration |

**Example**  
```js
See how Cement instantiate tools
```
<a name="ExpressWrapper+start"></a>

### expressWrapper.start()
Starts the HTTP Server using configured port

**Kind**: instance method of <code>[ExpressWrapper](#ExpressWrapper)</code>  
