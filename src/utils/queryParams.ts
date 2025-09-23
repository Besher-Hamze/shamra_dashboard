/**
 * Utility function to clean query parameters by removing empty values
 * @param params - Object with query parameters
 * @returns Cleaned object with only non-empty values
 */
export const cleanQueryParams = (params: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(params).filter(([_, value]) =>
            value !== undefined && value !== null && value !== ''
        )
    );
};

/**
 * Utility function to clean specific query parameters
 * @param params - Object with query parameters
 * @param keysToClean - Array of keys to clean
 * @returns Cleaned object
 */
export const cleanSpecificParams = (
    params: Record<string, any>,
    keysToClean: string[]
): Record<string, any> => {
    const cleaned = { ...params };
    keysToClean.forEach(key => {
        if (cleaned[key] === '' || cleaned[key] === null) {
            delete cleaned[key];
        }
    });
    return cleaned;
};
