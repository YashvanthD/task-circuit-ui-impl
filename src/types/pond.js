// JSDoc type definitions for pond-related API shapes
/**
 * @typedef {Object} Pond
 * @property {string} [pond_id]
 * @property {string} [id]
 * @property {string} [farm_name]
 * @property {string} [farmName]
 * @property {string|Object} [pond_location]
 * @property {string|number} [pond_area]
 * @property {string|number} [pond_volume]
 * @property {string} [pond_type]
 * @property {string} [pond_shape]
 * @property {Array<Object>} [currentStock]
 * @property {Array<Object>} [waterQuality]
 * @property {string} [last_update]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} PondListResponse
 * @property {Array<Pond>} ponds
 */

/**
 * Generic API response that wraps data.
 * @template T
 * @typedef {Object} ApiResponse
 * @property {T} data
 * @property {boolean} [success]
 * @property {string} [timestamp]
 */

// Export nothing at runtime; file is used for JSDoc imports: `@typedef {import('../types/pond').Pond} Pond`
export default {};

