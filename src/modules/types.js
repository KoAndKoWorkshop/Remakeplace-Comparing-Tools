/**
 * @typedef {Object} RawReMarket
 * @property {Array<Object>} interiorFurniture
 * @property {Array<Object>} interiorFixture
 * @property {Array<Object>} exteriorFixture
 */

/**
 * @typedef {Object} NormalizedItem
 * @property {'interiorFurniture' | 'interiorFixture' | 'exteriorFixture' | 'grouped' | 'dye'} source
 * @property {number} itemId
 * @property {string} name
 * @property {number} quantity
 * @property {string|null} color
 * @property {string|null} dyeName
 * @property {string|null} dyeId
 * @property {number|null} materialItemId
 * @property {string|null} level
 * @property {string|null} fixtureType
 */

export {}
