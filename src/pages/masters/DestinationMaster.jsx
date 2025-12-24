import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import Select from '@components/Select'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageDestination, manageCountry, manageCity } from '@api/masters.api'
import { toast } from 'react-hot-toast'

const DestinationMaster = () => {
    const [destinations, setDestinations] = useState([])
    const [countries, setCountries] = useState([])
    const [cityOptions, setCityOptions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ countryId: '', cityId: '', destinationName: '', places: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchDestinations()
        fetchCountries()
    }, [])

    const fetchCountries = async () => {
        try {
            const payload = {
                countryId: 0,
                countryName: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const response = await manageCountry(payload)
            if (response.data && response.data.data) {
                setCountries(response.data.data.map(c => ({
                    value: c.countryId,
                    label: c.countryName
                })))
            }
        } catch (error) {
            console.error('Error fetching countries:', error)
        }
    }

    const fetchCities = async (countryId) => {
        if (!countryId) {
            setCityOptions([])
            return
        }

        try {
            const payload = {
                cityId: 0,
                cityName: "string",
                countryId: parseInt(countryId),
                stateId: 0,
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const response = await manageCity(payload)
            if (response.data) {
                let fetchedCities = []
                if (Array.isArray(response.data)) {
                    fetchedCities = response.data
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    fetchedCities = response.data.data
                } else if (response.data.success && response.data.data) {
                    fetchedCities = response.data.data
                }

                setCityOptions(fetchedCities.map(c => ({
                    value: c.cityId,
                    label: c.cityName
                })))
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            toast.error('Error loading cities')
        }
    }

    const fetchDestinations = async () => {
        setIsLoading(true)
        try {
            const payload = {
                destinationId: 0,
                destinationName: "string",
                countryId: 0,
                cityId: 0,
                places: "string",
                createdBy: 0,
                modifyBy: 0,
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            console.log('Fetching destinations with payload:', payload)
            const response = await manageDestination(payload)
            console.log('Destinations Response:', response)
            console.log('Response data:', response.data)
            console.log('Response status:', response.status)

            if (response.data) {
                if (Array.isArray(response.data)) {
                    console.log('Setting destinations from direct array')
                    setDestinations(response.data)
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    console.log('Setting destinations from response.data.data')
                    setDestinations(response.data.data)
                } else if (response.data.success && response.data.data) {
                    console.log('Setting destinations from success response')
                    setDestinations(response.data.data)
                } else {
                    console.log('Unexpected response structure:', response.data)
                    toast.error('Unexpected response format')
                }
            } else {
                toast.error('Failed to fetch destinations')
            }
        } catch (error) {
            console.error('Error fetching destinations:', error)
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            })
            toast.error('Error loading destinations: ' + (error.response?.data?.message || error.message))
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'countryId', label: 'Country ID' },
        { key: 'cityId', label: 'City ID' },
        { key: 'destinationName', label: 'Destination Name' },
        { key: 'places', label: 'Places' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.destinationId)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = async (row) => {
        // Fetch cities for the country being edited before opening modal
        if (row.countryId) {
            await fetchCities(row.countryId)
        }

        setFormData({
            countryId: row.countryId,
            cityId: row.cityId,
            destinationName: row.destinationName,
            places: row.places || ''
        })
        setEditingId(row.destinationId)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.countryId || !formData.cityId || !formData.destinationName) {
            toast.error('Please fill all required fields')
            return
        }

        try {
            const payload = {
                destinationId: editingId || 0,
                destinationName: formData.destinationName,
                countryId: parseInt(formData.countryId),
                cityId: parseInt(formData.cityId),
                places: formData.places || '',
                createdBy: 0,
                modifyBy: 0,
                isActive: true,
                isDeleted: false,
                spType: editingId ? "U" : "C"
            }

            const response = await manageDestination(payload)
            console.log('Save Response:', response.data)

            const isSuccess = response.data && (
                response.data.success === true ||
                response.status === 200
            )

            if (isSuccess) {
                toast.success(editingId ? 'Destination updated successfully' : 'Destination added successfully')
                fetchDestinations()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save destination')
            }
        } catch (error) {
            console.error('Error saving destination:', error)
            toast.error('Error saving destination')
        }
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (deleteId) {
            try {
                const payload = {
                    destinationId: deleteId,
                    destinationName: "",
                    countryId: 0,
                    cityId: 0,
                    places: "",
                    createdBy: 0,
                    modifyBy: 0,
                    isActive: true,
                    isDeleted: true,
                    spType: "D"
                }

                const response = await manageDestination(payload)
                console.log('Delete Response:', response.data)

                const isSuccess = response.data && (
                    response.data.success === true ||
                    response.status === 200
                )

                if (isSuccess) {
                    toast.success('Destination deleted successfully')
                    fetchDestinations()
                    setDeleteId(null)
                    setIsDeleteModalOpen(false)
                } else {
                    toast.error(response.data?.message || 'Failed to delete destination')
                }
            } catch (error) {
                console.error('Error deleting destination:', error)
                toast.error('Error deleting destination')
            }
        }
    }

    const closeModal = () => {
        setFormData({ countryId: '', cityId: '', destinationName: '', places: '' })
        setCityOptions([])
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Destination Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Destinations' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Destination</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={destinations} emptyMessage="No destinations added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Destination" : "Add Destination"}>
                <div className="space-y-4">
                    <Select
                        label="Country *"
                        name="countryId"
                        value={formData.countryId}
                        onChange={(e) => {
                            const newCountryId = e.target.value;
                            setFormData({ ...formData, countryId: newCountryId, cityId: '' }) // Reset city when country changes
                            fetchCities(newCountryId)
                        }}
                        options={countries}
                        placeholder="Select Country"
                    />
                    <Select
                        label="City *"
                        name="cityId"
                        value={formData.cityId}
                        onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                        options={cityOptions}
                        placeholder="Select City"
                        disabled={!formData.countryId}
                    />
                    <Input
                        label="Destination Name *"
                        value={formData.destinationName}
                        onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                        placeholder="Enter destination name"
                    />
                    <div>
                        <Input
                            label="Places (Optional, comma separated)"
                            value={formData.places}
                            onChange={(e) => setFormData({ ...formData, places: e.target.value })}
                            placeholder="E.g. Taj Mahal, Red Fort"
                        />
                        <p className="text-xs text-secondary-500 mt-1">Separate multiple places with commas</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Destination"
                message="Are you sure you want to delete this destination? This action cannot be undone."
            />
        </div>
    )
}

export default DestinationMaster
