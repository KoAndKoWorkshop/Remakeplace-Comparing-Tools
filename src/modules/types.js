/**
 * @typedef {Object} RawReMarket
 * @property {Array<Object>} interiorFurniture
 * @property {Array<Object>} interiorFixture
 * @property {Array<Object>} exteriorFurniture
 * @property {Array<Object>} exteriorFixture
 * @property {Array<Object>} houseWalls
 */

/**
 * @typedef {Object} NormalizedItem
 * @property {'interiorFurniture' | 'interiorFixture' | 'exteriorFurniture' | 'exteriorFixture' | 'grouped' | 'dye'} source
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
