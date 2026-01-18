/**
 * API Configuration
 * Base URL and API-related settings.
 *
 * @module config/api
 */

// Base URL for API calls
export const BASE_URL = process.env.REACT_APP_BACKEND_URL ||  'http://localhost:5000';

// API timeouts (in milliseconds)
export const API_TIMEOUT = 30000;
export const API_UPLOAD_TIMEOUT = 60000;

// Retry configuration
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000;

// Cache settings (in milliseconds)
export const CACHE_STALE_MS = 5 * 60 * 1000; // 5 minutes

