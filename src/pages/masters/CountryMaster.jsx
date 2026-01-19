import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import MastersNavigation from '@components/MastersNavigation'
import { Pencil, Trash2 } from 'lucide-react'
import ConfirmModal from '@components/ConfirmModal'
import { manageCountry, manageCity } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { MapPin } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'

const CountryMaster = () => {
    const { user } = useAuth()
    const [countries, setCountries] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '' })
    const [cities, setCities] = useState([])
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [isCityModalOpen, setIsCityModalOpen] = useState(false)
    const [cityFormData, setCityFormData] = useState({ cityName: '', isActive: true })
    const [editingCityId, setEditingCityId] = useState(null)
    const [cityDeleteModalOpen, setCityDeleteModalOpen] = useState(false)
    const [cityToDeleteId, setCityToDeleteId] = useState(null)

    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchCountries()
    }, [])

    const fetchCountries = async () => {
        setIsLoading(true)
        try {
            const payload = {
                countryId: 0,
                countryName: "string",
                isActive: true,
                isDeleted: false,
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                spType: "R"
            }
            const response = await manageCountry(payload)
            console.log('API Response:', response.data) // Debug log

            // Check if response has data - adjust based on actual API structure
            if (response.data) {
                // If data is directly an array
                if (Array.isArray(response.data)) {
                    setCountries(response.data)
                }
                // If data has a nested data property
                else if (response.data.data && Array.isArray(response.data.data)) {
                    setCountries(response.data.data)
                }
                // If data has isValid flag
                else if (response.data.isValid && response.data.data) {
                    setCountries(response.data.data)
                }
                else {
                    console.log('Unexpected response structure:', response.data)
                    toast.error('Unexpected response format')
                }
            } else {
                toast.error('Failed to fetch countries')
            }
        } catch (error) {
            console.error('Error fetching countries:', error)
            toast.error('Error loading countries')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'countryName', label: 'Country Name' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => openCityModal(row)} className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50 transition-colors" title="Manage Cities">
                        <MapPin className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.countryId)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = (row) => {
        setFormData({ name: row.countryName })
        setEditingId(row.countryId)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.name) return

        try {
            const payload = {
                countryId: editingId || 0,
                countryName: formData.name,
                isActive: true,
                isDeleted: false,
                createdBy: user?.id || 0,
                roleId: user?.roleId || 0,
                spType: editingId ? "U" : "C"
            }

            const response = await manageCountry(payload)
            console.log('Save Response:', response.data) // Debug log

            // Check for success - handle multiple response structures
            const isSuccess = response.data && (
                response.data.isValid === true ||
                response.data.success === true ||
                response.status === 200
            )

            if (isSuccess) {
                toast.success(editingId ? 'Country updated successfully' : 'Country added successfully')
                fetchCountries()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save country')
            }
        } catch (error) {
            console.error('Error saving country:', error)
            toast.error('Error saving country')
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
                    countryId: deleteId,
                    countryName: "",
                    isActive: true,
                    isDeleted: true,
                    createdBy: user?.id || 0,
                    roleId: user?.roleId || 0,
                    spType: "D"
                }

                const response = await manageCountry(payload)
                console.log('Delete Response:', response.data) // Debug log

                // Check for success - handle multiple response structures
                const isSuccess = response.data && (
                    response.data.isValid === true ||
                    response.data.success === true ||
                    response.status === 200
                )

                if (isSuccess) {
                    toast.success('Country deleted successfully')
                    fetchCountries()
                    setDeleteId(null)
                    setIsDeleteModalOpen(false)
                } else {
                    toast.error(response.data?.message || 'Failed to delete country')
                }
            } catch (error) {
                console.error('Error deleting country:', error)
                toast.error('Error deleting country')
            }
        }
    }

    // ============ CITY MANAGEMENT ============

    const openCityModal = (country) => {
        setSelectedCountry(country)
        setCities([]) // Clear previous cities
        setIsCityModalOpen(true)
        fetchCities(country.countryId)
    }

    const fetchCities = async (countryId) => {
        try {
            // Assuming fetch uses the same structure but filters might be needed or backend handles it via separate endpoint if implemented
            // Currently using manageCity with 'R'
            // NOTE: API payload for fetch might need countryId filter if supported, or it fetches all and we filter.
            // Based on user request: "cities can be added to respective countries".
            // Let's assume 'R' fetches all or we pass countryId in payload if supported.
            // Using logic similar to Destination Master fetch

            const payload = {
                cityId: 0,
                cityName: "string",
                countryId: parseInt(countryId), // Passing countryId for server-side filtering
                stateId: 0,
                isActive: true,
                isDeleted: false,
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                spType: "R"
            }
            const response = await manageCity(payload)
            console.log('Cities Response:', response.data)

            if (response.data) {
                let fetchedCities = []
                if (Array.isArray(response.data)) {
                    fetchedCities = response.data
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    fetchedCities = response.data.data
                } else if (response.data.success && response.data.data) {
                    fetchedCities = response.data.data
                }

                // Client-side filter as a safeguard if API returns all cities
                const filteredCities = fetchedCities.filter(c => c.countryId === parseInt(countryId))
                setCities(filteredCities)

            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            toast.error('Error loading cities')
        }
    }

    const handleCitySave = async () => {
        if (!cityFormData.cityName) return
        if (!selectedCountry) return

        try {
            const payload = {
                cityId: editingCityId || 0,
                cityName: cityFormData.cityName,
                countryId: selectedCountry.countryId,
                stateId: 0,
                isActive: true,
                isDeleted: false,
                createdBy: user?.id || 0,
                roleId: user?.roleId || 0,
                spType: editingCityId ? "U" : "C"
            }

            const response = await manageCity(payload)
            const isSuccess = response.data && (
                response.data.success === true ||
                response.status === 200 ||
                response.data.isValid === true
            )

            if (isSuccess) {
                toast.success(editingCityId ? 'City updated successfully' : 'City added successfully')
                fetchCities(selectedCountry.countryId)
                closeCityForm()
            } else {
                toast.error(response.data?.message || 'Failed to save city')
            }
        } catch (error) {
            console.error('Error saving city:', error)
            toast.error('Error saving city')
        }
    }

    const handleCityEdit = (city) => {
        setCityFormData({ cityName: city.cityName, isActive: city.isActive })
        setEditingCityId(city.cityId)
    }

    const confirmCityDelete = (id) => {
        setCityToDeleteId(id)
        setCityDeleteModalOpen(true)
    }

    const handleCityDelete = async () => {
        if (!cityToDeleteId || !selectedCountry) return

        try {
            const payload = {
                cityId: cityToDeleteId,
                cityName: "",
                countryId: selectedCountry.countryId,
                stateId: 0,
                isActive: true,
                isDeleted: true,
                createdBy: user?.id || 0,
                roleId: user?.roleId || 0,
                spType: "D"
            }

            const response = await manageCity(payload)
            const isSuccess = response.data && (
                response.data.success === true ||
                response.status === 200 ||
                response.data.isValid === true
            )

            if (isSuccess) {
                toast.success('City deleted successfully')
                fetchCities(selectedCountry.countryId)
                setCityDeleteModalOpen(false)
                setCityToDeleteId(null)
            } else {
                toast.error(response.data?.message || 'Failed to delete city')
            }

        } catch (error) {
            console.error('Error deleting city:', error)
            toast.error('Error deleting city')
        }
    }

    const closeCityForm = () => {
        setCityFormData({ cityName: '', isActive: true })
        setEditingCityId(null)
    }

    const closeModal = () => {
        setFormData({ name: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Country Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Countries' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Country</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={countries} emptyMessage="No countries added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Country" : "Add Country"}>
                <div className="space-y-4">
                    <Input
                        label="Country Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter country name"
                    />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
                </div>
            </Modal>

            {/* City Management Modal */}
            <Modal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
                title={`Manage Cities - ${selectedCountry?.countryName || ''}`}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Add/Edit City Form */}
                    <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                            <Input
                                label={editingCityId ? "Edit City Name" : "Add New City"}
                                value={cityFormData.cityName}
                                onChange={(e) => setCityFormData({ ...cityFormData, cityName: e.target.value })}
                                placeholder="Enter city name"
                            />
                        </div>
                        <div className="flex gap-2 pb-1">
                            {editingCityId && (
                                <Button variant="secondary" onClick={closeCityForm}>Cancel</Button>
                            )}
                            <Button variant="primary" onClick={handleCitySave}>
                                {editingCityId ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </div>

                    {/* Cities List */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3">City Name</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cities.length > 0 ? (
                                    cities.map((city) => (
                                        <tr key={city.cityId} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{city.cityName}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleCityEdit(city)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmCityDelete(city.cityId)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                                            No cities found for this country.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            {/* City Delete Confirmation */}
            <ConfirmModal
                isOpen={cityDeleteModalOpen}
                onClose={() => setCityDeleteModalOpen(false)}
                onConfirm={handleCityDelete}
                title="Delete City"
                message="Are you sure you want to delete this city?"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Country"
                message="Are you sure you want to delete this country? This action cannot be undone."
            />
        </div>
    )
}

export default CountryMaster
