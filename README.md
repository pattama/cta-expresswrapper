# NodeJS Express Wrapper tool for Compass Test Automation

This tool wraps an Express application. It is useful for 
- defining HTTP routes dynamically 
- sharing the same Express instance on several Bricks and/or Tools (e.g. using the same port for HTTP requests)

## Initialization

# Initialization
This chapter describes the configuration for a REST API brick.

The Express Wrapper Tool requires a `cta-logger` Tool as a dependency.

```js
const config = {
  tools: [
    {
      name: 'logger',
      module: 'cta-logger',
      properties: {},
      scope: 'all',
    },
    {
      name: 'my-express',
      module: 'cta-expresswrapper',
      properties: {
        port: 3000, // port number on which the Express Application should listen
      },
    },
  ],
  bricks: [],
};
```
