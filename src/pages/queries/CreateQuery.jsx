import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { createQuery } from '@redux/querySlice'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import DestinationSelector from '@components/DestinationSelector'
import { useForm } from '@hooks/useForm'

const CreateQuery = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const initialValues = {
        clientName: '',
        email: '',
        phone: '',
        destinations: [],
        travelDate: '',
        returnDate: '',
        adults: 1,
        children: 0,
        childrenAges: [],
        infants: 0,
        budget: '',
        requirements: '',
        totalDays: 0,
    }

    const validate = (values) => {
        const errors = {}
        if (!values.clientName) errors.clientName = 'Client name is required'
        if (!values.email) errors.email = 'Email is required'
        if (!values.phone) errors.phone = 'Phone is required'
        if (!values.destinations || values.destinations.length === 0) {
            errors.destinations = 'At least one destination is required'
        }
        if (!values.travelDate) errors.travelDate = 'Travel date is required'
        return errors
    }

    const handleSubmit = async (values) => {
        try {
            await dispatch(createQuery(values)).unwrap()
            navigate('/queries')
        } catch (error) {
            console.error('Failed to create query:', error)
        }
    }

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit: onSubmit } = useForm(
        initialValues,
        handleSubmit,
        validate
    )

    // Calculate total travel days when dates change
    useEffect(() => {
        if (values.travelDate && values.returnDate) {
            const travel = new Date(values.travelDate)
            const returnD = new Date(values.returnDate)
            const diffTime = Math.abs(returnD - travel)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            // Update totalDays if it's different
            if (diffDays !== values.totalDays) {
                handleChange({ target: { name: 'totalDays', value: diffDays } })
            }
        }
    }, [values.travelDate, values.returnDate])

    // Update childrenAges array when children count changes
    useEffect(() => {
        const childrenCount = parseInt(values.children) || 0
        const currentAges = values.childrenAges || []

        if (childrenCount !== currentAges.length) {
            const newAges = Array(childrenCount).fill('').map((_, index) =>
                currentAges[index] !== undefined ? currentAges[index] : ''
            )
            handleChange({ target: { name: 'childrenAges', value: newAges } })
        }
    }, [values.children])

    // Handle individual child age change
    const handleChildAgeChange = (index, age) => {
        const newAges = [...(values.childrenAges || [])]
        newAges[index] = age
        handleChange({ target: { name: 'childrenAges', value: newAges } })
    }

    return (
        <div>
            <PageHeader
                title="Create New Query"
                subtitle="Add a new travel query"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: 'Create' }
                ]}
            />

            <form onSubmit={onSubmit} className="card max-w-4xl p-0">
                <div className='card-header bg-gray-200 p-4 rounded-t-lg'>
                    <div className='flex justify-between items-center'>
                        <h3 className="text-lg font-semibold mb-6">Client Information</h3>
                        <div className='flex items-center gap-4'>
                            <Input
                                label="QueryNo"
                                name="queryNo"
                                value={values.queryNo}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.queryNo}
                                touched={touched.queryNo}
                                required
                                className="w-44 "
                            />

                            <Select
                                label="Handler"
                                name="handler"
                                value={values.handler}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.handler}
                                touched={touched.handler}
                                required
                                className="w-48"
                            />
                        </div>
                    </div>
                </div>

                <div className='card-body p-4'>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-4">
                        <Select
                            label="Client Name"
                            name="clientName"
                            value={values.clientName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.clientName}
                            touched={touched.clientName}
                            required
                        />

                        {/* <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        touched={touched.email}
                        required
                    />

                    <Input
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.phone}
                        touched={touched.phone}
                        required
                    /> */}

                        <div className="md:col-span-2">
                            <DestinationSelector
                                label="Destinations"
                                name="destinations"
                                value={values.destinations}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.destinations}
                                touched={touched.destinations}
                                required
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-6">Travel Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Input
                            label="Travel Date"
                            name="travelDate"
                            type="date"
                            value={values.travelDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.travelDate}
                            touched={touched.travelDate}
                            required
                        />

                        <Input
                            label="Return Date"
                            name="returnDate"
                            type="date"
                            value={values.returnDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Total Days
                            </label>
                            <div className="input bg-gray-50 flex items-center justify-center font-semibold text-primary-600">
                                {values.totalDays > 0 ? `${values.totalDays} ${values.totalDays === 1 ? 'Day' : 'Days'}` : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Input
                            label="Adults"
                            name="adults"
                            type="number"
                            min="1"
                            value={values.adults}
                            onChange={handleChange}
                        />

                        <Input
                            label="Children"
                            name="children"
                            type="number"
                            min="0"
                            value={values.children}
                            onChange={handleChange}
                        />

                        <Input
                            label="Infants"
                            name="infants"
                            type="number"
                            min="0"
                            value={values.infants}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Children Ages Section */}
                    {values.children > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-md font-semibold mb-4 text-blue-900">Children Ages</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: parseInt(values.children) || 0 }).map((_, index) => (
                                    <div key={index}>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                                            Child {index + 1}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="17"
                                            value={values.childrenAges[index] || ''}
                                            onChange={(e) => handleChildAgeChange(index, e.target.value)}
                                            className="input w-full"
                                            placeholder="Age"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Input
                            label="Budget"
                            name="budget"
                            type="number"
                            value={values.budget}
                            onChange={handleChange}
                            placeholder="Estimated budget"
                        />
                        <Select
                            label="Query Status"
                            name="queryStatus"
                            type="text"
                            value={values.queryStatus}
                            onChange={handleChange}
                            placeholder="Query Status"
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ]}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Special Requirements
                        </label>
                        <textarea
                            name="requirements"
                            value={values.requirements}
                            onChange={handleChange}
                            rows="4"
                            className="input"
                            placeholder="Any special requirements or notes..."
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/queries')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Create Query
                        </Button>
                    </div>
                </div>

            </form>
        </div>
    )
}

export default CreateQuery
