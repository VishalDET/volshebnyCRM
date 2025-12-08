import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { createQuery } from '@redux/querySlice'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import { useForm } from '@hooks/useForm'

const CreateQuery = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const initialValues = {
        clientName: '',
        email: '',
        phone: '',
        destination: '',
        travelDate: '',
        returnDate: '',
        adults: 1,
        children: 0,
        infants: 0,
        budget: '',
        requirements: '',
    }

    const validate = (values) => {
        const errors = {}
        if (!values.clientName) errors.clientName = 'Client name is required'
        if (!values.email) errors.email = 'Email is required'
        if (!values.phone) errors.phone = 'Phone is required'
        if (!values.destination) errors.destination = 'Destination is required'
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

            <form onSubmit={onSubmit} className="card max-w-4xl">
                <h3 className="text-lg font-semibold mb-6">Client Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input
                        label="Client Name"
                        name="clientName"
                        value={values.clientName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.clientName}
                        touched={touched.clientName}
                        required
                    />

                    <Input
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
                    />

                    <Input
                        label="Destination"
                        name="destination"
                        value={values.destination}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.destination}
                        touched={touched.destination}
                        required
                    />
                </div>

                <h3 className="text-lg font-semibold mb-6">Travel Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                    <Input
                        label="Budget"
                        name="budget"
                        type="number"
                        value={values.budget}
                        onChange={handleChange}
                        placeholder="Estimated budget"
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
            </form>
        </div>
    )
}

export default CreateQuery
