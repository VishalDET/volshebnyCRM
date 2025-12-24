import { useState, useCallback } from 'react'

/**
 * Custom hook for form state management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler function
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, onSubmit, validate) => {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }))
        }
    }, [errors])

    const handleBlur = useCallback((e) => {
        const { name } = e.target
        setTouched(prev => ({
            ...prev,
            [name]: true
        }))

        // Validate on blur if validation function provided
        if (validate) {
            const validationErrors = validate(values)
            if (validationErrors[name]) {
                setErrors(prev => ({
                    ...prev,
                    [name]: validationErrors[name]
                }))
            }
        }
    }, [values, validate])

    const handleSubmit = useCallback(async (e) => {
        console.log('useForm handleSubmit triggered')
        e.preventDefault()

        // Validate all fields
        if (validate) {
            const validationErrors = validate(values)
            setErrors(validationErrors)

            if (Object.keys(validationErrors).length > 0) {
                // Mark all fields as touched to show errors in UI
                const allTouched = {}
                Object.keys(values).forEach(key => {
                    allTouched[key] = true
                })
                setTouched(allTouched)
                return
            }
        }

        setIsSubmitting(true)
        try {
            await onSubmit(values)
        } catch (error) {
            console.error('Form submission error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }, [values, validate, onSubmit])

    const resetForm = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
        setIsSubmitting(false)
    }, [initialValues])

    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }))
    }, [])

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }))
    }, [])

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setFieldError,
        setValues,
    }
}

export default useForm
