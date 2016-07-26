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
Starts the Express Application using configured port

**Kind**: instance method of <code>[ExpressWrapper](#ExpressWrapper)</code>  
