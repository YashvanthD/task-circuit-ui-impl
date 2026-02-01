// JSDoc type definitions for fish-related API shapes

/**
 * @typedef {Object} Farm
 * @property {string} farm_id - Farm ID
 * @property {string} account_key - Account key
 * @property {string} name - Farm name
 * @property {string} [location] - Farm location (e.g., "Lat: 12.34, Long: 56.78")
 * @property {number} [area_acres] - Total area in acres
 * @property {string} [water_source] - Water source (e.g., "River", "Well")
 * @property {string} [owner] - Owner name
 * @property {string} [contact] - Contact information
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} FarmsListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Farm>} data.farms - Array of farms
 */

/**
 * @typedef {Object} Pond
 * @property {string} pond_id - Pond ID
 * @property {string} account_key - Account key
 * @property {string} farm_id - Parent farm ID
 * @property {string} name - Pond name/number
 * @property {number} [size_sqm] - Pond area in square meters
 * @property {number} [depth_m] - Average depth in meters
 * @property {number} [capacity] - Water capacity in liters
 * @property {'stocked'|'empty'|'maintenance'} [status] - Pond status
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} PondsListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Pond>} data.ponds - Array of ponds
 */

/**
 * @typedef {Object} Species
 * @property {string} species_id - Species ID
 * @property {string} account_key - Account key
 * @property {string} name - Common name
 * @property {string} [scientific_name] - Scientific name
 * @property {'freshwater'|'marine'|'brackish'} [category] - Water category
 * @property {string} [code] - Species code
 * @property {'freshwater'|'marine'|'brackish'} [type] - Water type
 * @property {number} [optimal_temp_min] - Optimal temperature min (°C)
 * @property {number} [optimal_temp_max] - Optimal temperature max (°C)
 * @property {number} [optimal_ph_min] - Optimal pH min
 * @property {number} [optimal_ph_max] - Optimal pH max
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} SpeciesListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Species>} data.species - Array of species
 */

/**
 * @typedef {Object} Stock
 * @property {string} stock_id - Stock ID
 * @property {string} account_key - Account key
 * @property {string} pond_id - Pond ID
 * @property {string} species_id - Species ID
 * @property {number} quantity - Fish quantity/count
 * @property {number} [initial_count] - Initial fish count
 * @property {number} [current_count] - Current fish count
 * @property {number} [avg_weight_g] - Average weight in grams
 * @property {string} [stocking_date] - Date when stocked
 * @property {string} stocked_at - ISO timestamp when stocked
 * @property {string} [expected_harvest_at] - Expected harvest date
 * @property {'active'|'completed'|'terminated'} status - Stock status
 * @property {string} [terminated_at] - ISO timestamp when terminated
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when updated
 */

/**
 * @typedef {Object} StocksListResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {Array<Stock>} data.stocks - Array of stocks
 */

/**
 * @typedef {Object} Feeding
 * @property {string} feeding_id - Feeding ID
 * @property {string} account_key - Account key
 * @property {string} stock_id - Stock ID
 * @property {string} pond_id - Pond ID
 * @property {string} feed_date - Date when fed
 * @property {string} [feed_time] - Time when fed
 * @property {string} [feed_type] - Type of feed
 * @property {number} quantity_kg - Feed amount in kg
 * @property {number} [cost_per_kg] - Cost per kg
 * @property {number} [amount] - Feed amount in kg (alias)
 * @property {string} fed_at - ISO timestamp when fed
 * @property {string} [fed_by] - User key who fed
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} Sampling
 * @property {string} sampling_id - Sampling ID
 * @property {string} account_key - Account key
 * @property {string} stock_id - Stock ID
 * @property {string} pond_id - Pond ID
 * @property {string} sample_date - Date when sampled
 * @property {number} sample_size - Number of fish sampled (alias: sample_count)
 * @property {number} sample_count - Number of fish sampled
 * @property {number} avg_weight_g - Average weight in grams
 * @property {number} [min_weight_g] - Minimum weight in grams
 * @property {number} [max_weight_g] - Maximum weight in grams
 * @property {number} [total_weight] - Total weight in grams
 * @property {string} sampled_at - ISO timestamp when sampled
 * @property {string} [sampled_by] - User key who sampled
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} Harvest
 * @property {string} harvest_id - Harvest ID
 * @property {string} account_key - Account key
 * @property {string} stock_id - Stock ID
 * @property {string} pond_id - Pond ID
 * @property {string} harvest_date - Date when harvested
 * @property {number} quantity - Number of fish harvested (alias: count)
 * @property {number} count - Number of fish harvested
 * @property {number} total_weight_kg - Total weight in kg
 * @property {number} [avg_weight_g] - Average weight in grams
 * @property {number} [price_per_kg] - Price per kg
 * @property {string} harvested_at - ISO timestamp when harvested
 * @property {string} [harvested_by] - User key who harvested
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} Mortality
 * @property {string} mortality_id - Mortality ID
 * @property {string} account_key - Account key
 * @property {string} stock_id - Stock ID
 * @property {string} pond_id - Pond ID
 * @property {string} mortality_date - Date when occurred
 * @property {number} quantity - Number of fish died (alias: count)
 * @property {number} count - Number of fish died
 * @property {string} [cause] - Cause of mortality
 * @property {string} [notes] - Additional notes
 * @property {string} occurred_at - ISO timestamp when occurred
 * @property {string} [reported_by] - User key who reported
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} Purchase
 * @property {string} purchase_id - Purchase ID
 * @property {string} account_key - Account key
 * @property {string} purchase_date - Date when purchased
 * @property {string} item_type - Type of item (e.g., 'feed', 'equipment')
 * @property {string} item_name - Item name
 * @property {number} quantity - Quantity purchased
 * @property {string} [unit] - Unit of measurement (e.g., 'kg', 'pieces')
 * @property {number} [price_per_unit] - Price per unit
 * @property {string} [supplier] - Supplier name
 * @property {string} [species_id] - Species ID (for fish purchases)
 * @property {number} [total_cost] - Total cost
 * @property {string} purchased_at - ISO timestamp when purchased
 * @property {string} [purchased_by] - User key who purchased
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} Transfer
 * @property {string} transfer_id - Transfer ID
 * @property {string} account_key - Account key
 * @property {string} from_pond_id - Source pond ID
 * @property {string} to_pond_id - Destination pond ID
 * @property {string} stock_id - Stock ID
 * @property {string} transfer_date - Date when transferred
 * @property {number} quantity - Number of fish transferred (alias: count)
 * @property {number} count - Number of fish transferred
 * @property {string} [reason] - Reason for transfer
 * @property {string} transferred_at - ISO timestamp when transferred
 * @property {string} [transferred_by] - User key who transferred
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} Maintenance
 * @property {string} maintenance_id - Maintenance ID
 * @property {string} account_key - Account key
 * @property {string} pond_id - Pond ID
 * @property {string} type - Maintenance type (e.g., 'cleaning', 'repair', 'water_change')
 * @property {string} [description] - Maintenance description
 * @property {'manual'|'iot'} [source] - Source of maintenance record
 * @property {string} performed_at - ISO timestamp when performed
 * @property {string} [performed_by] - User key who performed
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} Treatment
 * @property {string} treatment_id - Treatment ID
 * @property {string} account_key - Account key
 * @property {string} stock_id - Stock ID
 * @property {string} pond_id - Pond ID
 * @property {string} type - Treatment type (e.g., 'medication', 'vaccination')
 * @property {string} [medication] - Medication name
 * @property {string} [dosage] - Dosage information
 * @property {number} [withdrawal_days] - Withdrawal period in days
 * @property {'manual'|'ai'} [source] - Source of treatment record
 * @property {string} administered_at - ISO timestamp when administered
 * @property {string} [administered_by] - User key who administered
 * @property {Object} [metadata] - Additional metadata
 * @property {string} created_at - ISO timestamp when created
 */

/**
 * @typedef {Object} WaterQuality
 * @property {string} pond_id - Pond ID
 * @property {number} [temperature] - Water temperature in °C
 * @property {number} [ph] - pH level
 * @property {number} [dissolved_oxygen] - Dissolved oxygen in mg/L
 * @property {number} [ammonia] - Ammonia level in mg/L
 * @property {number} [nitrite] - Nitrite level in mg/L
 * @property {number} [nitrate] - Nitrate level in mg/L
 * @property {string} measured_at - ISO timestamp when measured
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} StockSummary
 * @property {number} total_feedings - Total number of feedings
 * @property {number} total_samplings - Total number of samplings
 * @property {number} total_harvests - Total number of harvests
 * @property {number} current_biomass_kg - Current biomass in kg
 * @property {number} [stock_id] - Stock ID
 * @property {number} [initial_count] - Initial count
 * @property {number} [current_count] - Current count
 * @property {number} [total_fed] - Total feed amount in kg
 * @property {number} [total_mortality] - Total fish died
 * @property {number} [total_harvested] - Total fish harvested
 * @property {number} [avg_growth_rate] - Average growth rate
 * @property {number} [fcr] - Feed Conversion Ratio
 * @property {number} [survival_rate] - Survival rate percentage
 */

/**
 * @typedef {Object} StockSummaryResponse
 * @property {boolean} success - Always true
 * @property {Object} data - Response data
 * @property {StockSummary} data.summary - Stock summary
 */

// Legacy Fish type for backward compatibility
/**
 * @typedef {Object} Fish
 * @property {string|number} [id]
 * @property {string} [_id]
 * @property {string} [speciesCode]
 * @property {string} [species_code]
 * @property {string} [commonName]
 * @property {string} [common_name]
 * @property {string} [scientificName]
 * @property {string} [scientific_name]
 * @property {number} [averageSizeCm]
 * @property {number} [weightKg]
 * @property {number} [lifespanYears]
 * @property {string} [type]
 * @property {string} [habitat]
 * @property {string} [distribution]
 * @property {string} [conservationStatus]
 * @property {Object} [taxonomicClassification]
 * @property {Object} [economicValueInr]
 * @property {Object} [metadata]
 */

// Export nothing at runtime; file is used for JSDoc imports
export default {};


