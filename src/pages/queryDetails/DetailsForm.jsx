import { useParams } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Input from '@components/Input'
import Button from '@components/Button'
import { useForm } from '@hooks/useForm'

const DetailsForm = () => {
    const { id } = useParams()

    const initialValues = {
        hotelName: '',
        hotelCategory: '',
        mealPlan: '',
        sightseeing: '',
        transportation: '',
        notes: '',
    }

    const handleSubmit = async (values) => {
        console.log('Saving details:', values)
    }

    const { values, handleChange, handleSubmit: onSubmit, isSubmitting } = useForm(initialValues, handleSubmit)

    return (
        <div>
            <PageHeader
                title="Query Details"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: `Query #${id}`, href: `/queries/${id}` },
                    { label: 'Details' }
                ]}
            />
            <form onSubmit={onSubmit} className="card max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input label="Hotel Name" name="hotelName" value={values.hotelName} onChange={handleChange} />
                    <Input label="Hotel Category" name="hotelCategory" value={values.hotelCategory} onChange={handleChange} />
                    <Input label="Meal Plan" name="mealPlan" value={values.mealPlan} onChange={handleChange} />
                    <Input label="Sightseeing" name="sightseeing" value={values.sightseeing} onChange={handleChange} />
                    <Input label="Transportation" name="transportation" value={values.transportation} onChange={handleChange} />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Notes</label>
                    <textarea name="notes" value={values.notes} onChange={handleChange} rows="4" className="input" />
                </div>
                <div className="flex gap-3 justify-end">
                    <Button type="submit" variant="primary" loading={isSubmitting}>Save Details</Button>
                </div>
            </form>
        </div>
    )
}

export default DetailsForm
