// JSDoc type definitions for company-related API shapes

/**
 * @typedef {Object} Company
 * @property {string} account_key - Company account key
 * @property {string} name - Company name
 * @property {string} [legal_name] - Legal company name
 * @property {string} [registration_number] - Company registration number
 * @property {string} [tax_id] - Tax ID / VAT number
 * @property {string} [industry] - Industry type
 * @property {string} [website] - Company website
 * @property {string} [email] - Company email
 * @property {string} [phone] - Company phone
 * @property {string} [address] - Company address
 * @property {string} [city] - City
 * @property {string} [state] - State/Province
 * @property {string} [country] - Country
 * @property {string} [postal_code] - Postal/ZIP code
 * @property {string} [logo_url] - Company logo URL
 * @property {Object} [metadata] - Additional company data
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} CompanyProfile
 * @property {string} account_key - Company account key
 * @property {string} name - Company name
 * @property {string} [description] - Company description
 * @property {string} [logo_url] - Company logo URL
 * @property {string} [website] - Company website
 * @property {string} [email] - Contact email
 * @property {string} [phone] - Contact phone
 * @property {Object} [social_media] - Social media links
 * @property {Object} [metadata] - Additional profile data
 */

/**
 * @typedef {Object} CompanyRegisterRequest
 * @property {string} name - Company name
 * @property {string} [legal_name] - Legal company name
 * @property {string} [industry] - Industry type
 * @property {string} [email] - Company email
 * @property {string} [phone] - Company phone
 * @property {string} [address] - Company address
 * @property {string} [country] - Country
 */

/**
 * @typedef {Object} UpdateCompanyProfileRequest
 * @property {string} [name] - Company name
 * @property {string} [description] - Company description
 * @property {string} [logo_url] - Company logo URL
 * @property {string} [website] - Company website
 * @property {string} [email] - Contact email
 * @property {string} [phone] - Contact phone
 * @property {Object} [social_media] - Social media links
 * @property {Object} [metadata] - Additional profile data
 */

// Export nothing at runtime; file is used for JSDoc imports
export default {};
