Swagger Methods
============================
#### HTTP methods that are supported by Swagger 2.0

[![Cross-Platform Compatibility](https://apidevtools.org/img/os-badges.svg)](https://travis-ci.com/APIDevTools/swagger-methods)

[![Build Status](https://api.travis-ci.com/APIDevTools/swagger-methods.svg)](https://travis-ci.com/APIDevTools/swagger-methods)

[![Coverage Status](https://coveralls.io/repos/github/APIDevTools/swagger-methods/badge.svg?branch=master)](https://coveralls.io/github/APIDevTools/swagger-methods?branch=master)
[![Dependencies](https://david-dm.org/APIDevTools/swagger-methods.svg)](https://david-dm.org/APIDevTools/swagger-methods)

[![npm](https://img.shields.io/npm/v/swagger-methods.svg?branch=master)](https://www.npmjs.com/package/swagger-methods)
[![License](https://img.shields.io/npm/l/swagger-methods.svg)](LICENSE)

This is an array of lower-case HTTP method names that are supported by the [Swagger 2.0 spec](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md).

This module is [tested](test/index.spec.js) against the [Swagger 2.0 schema](https://www.npmjs.com/package/swagger-schema-official)


Installation
--------------------------
Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm):

```bash
npm install swagger-methods
```


Usage
--------------------------

```javascript
var methods = require('swagger-methods');

methods.forEach(function(method) {
  console.log(method);
});

// get
// put
// post
// delete
// options
// head
// patch
```


Contributing
--------------------------
I welcome any contributions, enhancements, and bug-fixes.  [File an issue](https://github.com/APIDevTools/swagger-methods/issues) on GitHub and [submit a pull request](https://github.com/APIDevTools/swagger-methods/pulls).

#### Building/Testing
To build/test the project locally on your computer:

1. **Clone this repo**<br>
`git clone https://github.com/APIDevTools/swagger-methods.git`

2. **Install dev dependencies**<br>
`npm install`

3. **Run the unit tests**<br>
`npm test`


License
--------------------------
[MIT license](LICENSE). Use it however you want.
