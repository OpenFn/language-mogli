import { execute as commonExecute } from 'language-common';
import jsforce from 'jsforce';
import request from 'request';
import { curry, mapValues, flatten } from 'lodash-fp';

/** @module Adaptor */

/**
 * @typedef {Object} State
 * @property {object} data JSON Data.
 * @property {Array<Reference>} references History of all previous operations.
 */

/**
 * @typedef {Function} Operation
 * @param {State} state
 */

export const createSMS = curry(function(params, state) {

  function assembleError({ response, error }) {
    if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
    if (error) return error;
    return new Error(`Server responded with ${response.statusCode}`)
  }

  let {connection, references} = state;
  const { loginUrl } = state.configuration;

  const body = expandReferences(state, params)
  body.type = "Inbound";

  console.log("Creating new inbound message in Mogli:");
  console.log("======================================");
  console.log("  Sender phone number: " + body.sender);
  console.log("  Message content: \"" + body.message + "\" \n");

  console.log(connection.instanceUrl)

  const url = connection.instanceUrl.concat('/services/apexrest/Mogli_SMS/v1/sms')
  console.log(url + "\" \n");


  return new Promise((resolve, reject) => {
    request.post({
      url: url,
      'auth': {
        'bearer': connection.accessToken
      },
      json: body
    }, function(error, response, postResponseBody){
      error = assembleError({error, response})
      if (error) {
        console.error("POST failed.")
        // console.error(response);
        reject(error);
      } else {
        console.log("POST succeeded.");
        resolve(body);
      }
    })
  })
  .then(function(recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state, references: [recordResult, ...state.references]
    }
  })

});

export const reference = curry(function(position, {references}) {
  return references[position].id;
})


function createConnection(state) {
  const { loginUrl } = state.configuration;

  if (!loginUrl) {
    throw new Error("loginUrl missing from configuration.")
  }

  return { ...state, connection: new jsforce.Connection({ loginUrl }) }
}

function login(state) {

  const {username, password, securityToken} = state.configuration
  let { connection } = state;
  console.info(`Logging in as ${username}.`);

  return connection.login( username, password + securityToken )
    .then(() => state)

}

export function execute(...operations) {

  const initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null,
    configuration: {}
  }

  return state => {
    // Note: we no longer need `steps` anymore since `commonExecute`
    // takes each operation as an argument.
    return commonExecute(
      createConnection,
      login,
      ...flatten(operations),
      cleanupState
    )({ ...initialState, ...state })

  };

}


/**
 * Removes unserializable keys from the state.
 * @constructor
 * @param {State} state
 * @returns {State}
 */
function cleanupState(state) {
  delete state.connection;
  return state;
}

export function steps(...operations) {
  return flatten(operations);
}

function expandReferences(state, attrs) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

export { lookup, relationship } from './sourceHelpers';

export {
  each, join, fields, field, source, sourceValue, map, combine,
  merge, dataPath, dataValue, referencePath, lastReferenceValue,
  index, beta, toArray, arrayToString, alterState
} from 'language-common';