/**
 * A wrapper around fetch that handles authentication tokens in a robust way.
 * 
 * Logic:
 * 1. If accessToken is missing but refreshToken exists, try to refresh first.
 * 2. If the request fails with 401 (Unauthorized), try to refresh the token and retry once.
 * 3. Only if both tokens fail or are missing, return the error.
 */
export const fetchWithAuth = async (url, options = {}, { dispatch, refreshAction }) => {
    let accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Helper to perform the actual fetch
    const doFetch = async (token) => {
        // Don't override existing Authorization if provided (though rare with this helper)
        const headers = {
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        // If body is FormData, don't set Content-Type header to let browser set boundary
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        return fetch(url, { ...options, headers });
    };

    // 1. Initial Check: If no access token but we have a refresh token, try to refresh first
    if (!accessToken && refreshToken && refreshAction) {
        try {
            const result = await dispatch(refreshAction());
            if (result.meta?.requestStatus === 'fulfilled') {
                accessToken = localStorage.getItem('accessToken');
            }
        } catch (e) {
            console.warn('Initial token refresh failed during pre-fetch check:', e);
        }
    }

    // 2. Initial Request Attempt
    let response = await doFetch(accessToken);

    // 3. Retry Logic: If 401 Unauthorized occurs, try auto-refreshing once
    if (response.status === 401 && refreshToken && refreshAction) {
        try {
            const result = await dispatch(refreshAction());
            if (result.meta?.requestStatus === 'fulfilled') {
                const newAccessToken = localStorage.getItem('accessToken');
                // Retry the request with the fresh token
                response = await doFetch(newAccessToken);
            }
        } catch (e) {
            console.error('Token refresh failed during 401 retry:', e);
        }
    }

    return response;
};
