/**
 * @typedef {Object} ResolveSuccess
 * @property {true} ok
 * @property {string} title
 * @property {string} quality
 * @property {string} duration
 * @property {string} outputUrl
 * @property {string} thumbnail
 */

/**
 * @typedef {Object} ResolveFailure
 * @property {false} ok
 * @property {string} error
 */

/**
 * @typedef {ResolveSuccess | ResolveFailure} ResolveResult
 */

export {};
