import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for data fetching with loading and error states
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Array} dependencies - Dependencies array for re-fetching
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetchFunction()
            setData(response.data)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [fetchFunction])

    useEffect(() => {
        fetchData()
    }, [...dependencies, fetchData])

    const refetch = useCallback(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch }
}

export default useFetch
