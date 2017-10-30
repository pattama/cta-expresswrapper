# cta-expresswrapper [ ![build status](https://git.sami.int.thomsonreuters.com/compass/cta-expresswrapper/badges/master/build.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-expresswrapper/commits/master) [![coverage report](https://git.sami.int.thomsonreuters.com/compass/cta-expresswrapper/badges/master/coverage.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-expresswrapper/commits/master)

Web Application using [Express (expressjs.com)](https://expressjs.com) Modules for Compass Test Automation, One of Libraries in CTA-OSS Framework

## General Overview

### Overview

In this module, **_cta-expresswrapper_**, we're implementing _cta-tool_ using **Express** as **web application**.

## Guidelines

We aim to give you brief guidelines here.

1. [Usage](#1-usage)
1. [Structure](#2-structure)
1. [Constructor](#3-constructor)
1. [Configuration](#4-configuration)
1. [Express.listen() via ExpressWrapper.start()](#5-express-listen-via-expresswrapper-start-)

### 1. Usage
```javascript
'use strict';

const ExpressWrapper = require('cta-expresswrapper');

const instance = new ExpressWrapper(dependencies, configuration);
instance.start();
```

We use [**ExpressWrapper.start()**](#5-express-listen-via-expresswrapper-start-) to start the **Express**.

[back to top](#guidelines)

### 2. Structure

In **cta-expresswrapper**, the **ExpressWrapper** class is extending **Tool** from _cta-tool_ and is exported.

```javascript
'use strict';

const Tool = require('cta-tool');

class ExpressWrapper extends Tool {
  ...
}

module.exports = ExpressWrapper;
```

[back to top](#guidelines)

### 3. Constructor

Because the **ExpressWrapper** class is extending **Tool**, its constructor has **_dependencies_** and **_configuration_** as _parameters_.

```javascript
class ExpressWrapper extends Tool {
  constructor(dependencies, configuration) {
    ...
    super(dependencies, configuration);
    ...
  }
}
```

[back to top](#guidelines)

### 4. Configuration

ExpressWrapper uses **_configuration_** via _constructor_.

```javascript
class ExpressWrapper extends Tool {
  constructor(dependencies, configuration) {
    ...
    super(dependencies, configuration);
    ...
  }
}
```

Because of **Tool** (_cta-tool_) extension, the **configuration** needs to have these _fields_.

* **name** - define the tool _name_
* **singleton** - indicate whether the tool is _singleton_
* **properties** - provide _properties_

#### Port for Express to listen to

**ExpressWrapper** uses **port** _(number)_ in **properties**. Here is an example:

```javascript
const configuration = {
  name: 'my-express',
  module: 'cta-expresswrapper',
  properties: {
    port: 3000,
  },
};
```

[back to top](#guidelines)

### 5. Express.listen() via ExpressWrapper.start()

In **ExpressWrapper** class, it provides **start()** to use **Express.listen(**_port_**)**.

```javascript
const express = require('express');
const http = require('http');

class ExpressWrapper extends Tool {
  constructor(dependencies, configuration) {
    ...
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = this.properties.port;
    ...
  }

  start() {
    ...
    this.server.listen(this.port);
    ...
  }
}
```

[back to top](#guidelines)

------

## To Do

------

## Considerations

* Should we specify the version of **Express** because it's dependency?