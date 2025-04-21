'use strict';

// Dependencies.
const RecursiveIterator = require('recursive-iterator');

/**
 * Checks if tag is already contained withing target.
 * The tag is an object of type http://swagger.io/specification/#tagObject
 * The target, is the part of the swagger specification that holds all tags.
 * @function
 * @param {object} target - Swagger object place to include the tags data.
 * @param {object} tag - Swagger tag object to be included.
 * @returns {boolean} Does tag is already present in target
 */
function _tagDuplicated(target, tag) {
	// Check input is workable.
	if (target && target.length && tag) {
		for (let i = 0; i < target.length; i = i + 1) {
			let targetTag = target[i];
			// The name of the tag to include already exists in the taget.
			// Therefore, it's not necessary to be added again.
			if (targetTag.name === tag.name) {
				return true;
			}
		}
	}

	// This will indicate that `tag` is not present in `target`.
	return false;
}

/**
 * Adds the tags property to a swagger object.
 * @function
 * @param {object} conf - Flexible configuration.
 */
function _attachTags(conf) {
	let tag = conf.tag;
	let swaggerObject = conf.swaggerObject;
	let propertyName = conf.propertyName;

	// Correct deprecated property.
	if (propertyName === 'tag') {
		propertyName = 'tags';
	}

	if (Array.isArray(tag)) {
		for (let i = 0; i < tag.length; i = i + 1) {
			if (!_tagDuplicated(swaggerObject[propertyName], tag[i])) {
				swaggerObject[propertyName].push(tag[i]);
			}
		}
	} else {
		if (!_tagDuplicated(swaggerObject[propertyName], tag)) {
			swaggerObject[propertyName].push(tag);
		}
	}
}

/**
 * Merges two objects
 * @function
 * @param {object} obj1 - Object 1
 * @param {object} obj2 - Object 2
 * @returns {object} Merged Object
 */
function _objectMerge(obj1, obj2) {
	let obj3 = {};
	for (let attr in obj1) {
		if (obj1.hasOwnProperty(attr)) {
			obj3[attr] = obj1[attr];
		}
	}
	for (let name in obj2) {
		if (obj2.hasOwnProperty(name)) {
			obj3[name] = obj2[name];
		}
	}
	return obj3;
}

/**
 * Adds necessary swagger schema object properties.
 * @see https://goo.gl/Eoagtl
 * @function
 * @param {object} swaggerObject - The object to receive properties.
 * @returns {object} swaggerObject - The updated object.
 */
function swaggerizeObj(swaggerObject) {
	swaggerObject.swagger = '2.0';
	swaggerObject.paths = swaggerObject.paths || {};
	swaggerObject.definitions = swaggerObject.definitions || {};
	swaggerObject.responses = swaggerObject.responses || {};
	swaggerObject.parameters = swaggerObject.parameters || {};
	swaggerObject.securityDefinitions = swaggerObject.securityDefinitions || {};
	swaggerObject.tags = swaggerObject.tags || [];
	return swaggerObject;
}

/**
 * List of deprecated or wrong swagger schema properties in singular.
 * @function
 * @returns {array} The list of deprecated property names.
 */
function _getSwaggerSchemaWrongProperties() {
	return [
		'consume',
		'produce',
		'path',
		'tag',
		'definition',
		'securityDefinition',
		'scheme',
		'response',
		'parameter',
		'deprecated'
	];
}

/**
 * Makes a deprecated property plural if necessary.
 * @function
 * @param {string} propertyName - The swagger property name to check.
 * @returns {string} The updated propertyName if neccessary.
 */
function _correctSwaggerKey(propertyName) {
	let wrong = _getSwaggerSchemaWrongProperties();
	if (wrong.indexOf(propertyName) > 0) {
		// Returns the corrected property name.
		return propertyName + 's';
	}
	return propertyName;
}

/**
 * Handles swagger propertyName in pathObject context for swaggerObject.
 * @function
 * @param {object} swaggerObject - The swagger object to update.
 * @param {object} pathObject - The input context of an item for swaggerObject.
 * @param {string} propertyName - The property to handle.
 */
function _organizeSwaggerProperties(swaggerObject, pathObject, propertyName) {
	let simpleProperties = [
		'consume',
		'consumes',
		'produce',
		'produces',
		// 'path',
		// 'paths',
		'schema',
		'schemas',
		'securityDefinition',
		'securityDefinitions',
		'response',
		'responses',
		'parameter',
		'parameters',
		'definition',
		'definitions',
	];

	// Common properties.
	if (simpleProperties.indexOf(propertyName) !== -1) {
		let keyName = _correctSwaggerKey(propertyName);
		let definitionNames = Object
			.getOwnPropertyNames(pathObject[propertyName]);
		for (let k = 0; k < definitionNames.length; k = k + 1) {
			let definitionName = definitionNames[k];
			swaggerObject[keyName][definitionName] =
				pathObject[propertyName][definitionName];
		}
		// Tags.
	} else if (propertyName === 'tag' || propertyName === 'tags') {
		let tag = pathObject[propertyName];
		_attachTags({
			tag: tag,
			swaggerObject: swaggerObject,
			propertyName: propertyName,
		});
		// Paths.
	} else {
		let routes = Object
			.getOwnPropertyNames(pathObject[propertyName]);

		for (let k = 0; k < routes.length; k = k + 1) {
			let route = routes[k];
			if(!swaggerObject.paths){
				swaggerObject.paths = {};
			}
			swaggerObject.paths[route] = _objectMerge(
				swaggerObject.paths[route], pathObject[propertyName][route]
			);
		}
	}
}

/**
 * Adds the data in to the swagger object.
 * @function
 * @param {object} swaggerObject - Swagger object which will be written to
 * @param {object[]} data - objects of parsed swagger data from yml or jsDoc
 *                          comments
 */
function addDataToSwaggerObject(swaggerObject, data) {
	if (!swaggerObject || !data) {
		throw new Error('swaggerObject and data are required!');
	}

	for (let i = 0; i < data.length; i = i + 1) {
		let pathObject = data[i];
		let propertyNames = Object.getOwnPropertyNames(pathObject);
		// Iterating the properties of the a given pathObject.
		for (let j = 0; j < propertyNames.length; j = j + 1) {
			let propertyName = propertyNames[j];
			// Do what's necessary to organize the end specification.
			_organizeSwaggerProperties(swaggerObject, pathObject, propertyName);
		}
	}
}

/**
 * Aggregates a list of wrong properties in problems.
 * Searches in object based on a list of wrongSet.
 * @param {Array|object} list - a list to iterate
 * @param {Array} wrongSet - a list of wrong properties
 * @param {Array} problems - aggregate list of found problems
 */
function seekWrong(list, wrongSet, problems) {
	let iterator = new RecursiveIterator(list, 0, false);
	for (let item = iterator.next(); !item.done; item = iterator.next()) {
		let isDirectChildOfProperties =
			item.value.path[item.value.path.length - 2] === 'properties';

		if (wrongSet.indexOf(item.value.key) > 0 && !isDirectChildOfProperties) {
			problems.push(item.value.key);
		}
	}
}

/**
 * Returns a list of problematic tags if any.
 * @function
 * @param {Array} sources - a list of objects to iterate and check
 * @returns {Array} problems - a list of problems encountered
 */
function findDeprecated(sources) {
	let wrong = _getSwaggerSchemaWrongProperties();
	// accumulate problems encountered
	let problems = [];
	sources.forEach(function(source) {
		// Iterate through `source`, search for `wrong`, accumulate in `problems`.
		seekWrong(source, wrong, problems);
	});
	return problems;
}

module.exports = {
	addDataToSwaggerObject: addDataToSwaggerObject,
	swaggerizeObj: swaggerizeObj,
	findDeprecated: findDeprecated,
};