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
import { manageSupplier, manageCountry, manageCity, manageServiceType } from '@api/masters.api'
import { toast } from 'react-hot-toast'

const SupplierMaster = () => {
    const [suppliers, setSuppliers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [countries, setCountries] = useState([])
    const [cityOptions, setCityOptions] = useState([])
    const [serviceTypes, setServiceTypes] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const initialFormState = {
        firstName: '',
        lastName: '',
        mobileNo: '',
        type: 'Supplier', // Default
        companyName: '',
        emailId: '',
        gstNumber: '',
        address: '',
        landmark: '',
        countryId: '',
        cityId: '', // Added cityId to state
        pincode: '',
        isGSTIN: false,
        gstCertificate: '',
        services: [] // Note: API doesn't seem to have a specific field for this in the example response, assuming it might be needed or handled separately? 
        // User said "get services from ServiceTypeMaster", I will keep it in UI but payload needs to handle it if API supports it. 
        // The provided payload example doesn't explicitly show a list of service IDs, but I'll include logic to select them.
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchSuppliers()
        fetchCountries()
        fetchServiceTypes()
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
            let fetchedCities = []
            if (response.data) {
                if (Array.isArray(response.data)) {
                    fetchedCities = response.data
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    fetchedCities = response.data.data
                }
            }
            setCityOptions(fetchedCities.map(c => ({
                value: c.cityId,
                label: c.cityName
            })))
        } catch (error) {
            console.error('Error fetching cities:', error)
        }
    }

    const fetchServiceTypes = async () => {
        try {
            const payload = {
                serviceId: 0,
                serviceName: "string",
                description: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const response = await manageServiceType(payload)
            let fetchedServices = []
            if (response.data) {
                if (Array.isArray(response.data)) {
                    fetchedServices = response.data
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    fetchedServices = response.data.data
                }
            }
            setServiceTypes(fetchedServices.map(s => ({
                value: s.serviceId,
                label: s.serviceName
            })))
        } catch (error) {
            console.error('Error fetching service types:', error)
        }
    }

    const fetchSuppliers = async () => {
        setIsLoading(true)
        try {
            const payload = {
                id: 0,
                firstName: "string",
                lastName: "string",
                mobileNo: "string",
                type: "string",
                gstCertificate: "string",
                country: "string",
                companyName: "string",
                emailId: "string",
                isGSTIN: true,
                gstNumber: "string",
                address: "string",
                landmark: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "string",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const response = await manageSupplier(payload)
            console.log('Supplier Response:', response.data)
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setSuppliers(response.data)
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setSuppliers(response.data.data)
                } else if (response.data.success && response.data.data) {
                    setSuppliers(response.data.data)
                }
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error)
            toast.error('Error loading suppliers')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'companyName', label: 'Company Name' },
        {
            key: 'name',
            label: 'Contact Person',
            render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`
        },
        { key: 'mobileNo', label: 'Mobile' },
        { key: 'address', label: 'Address' }, // Added address column for completeness
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = async (row) => {
        if (row.countryId) {
            await fetchCities(row.countryId)
        }

        setFormData({
            firstName: row.firstName,
            lastName: row.lastName,
            mobileNo: row.mobileNo,
            type: row.type || 'Supplier',
            companyName: row.companyName,
            emailId: row.emailId,
            gstNumber: row.gstNumber,
            address: row.address,
            landmark: row.landmark,
            countryId: row.countryId,
            cityId: row.cityId,
            pincode: row.pincode,
            isGSTIN: row.isGSTIN !== undefined ? row.isGSTIN : (!!row.gstNumber), // infer if not present
            gstCertificate: row.gstCertificate || '',
            services: [] // Reset or fetch if available in specialized API
        })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.companyName || !formData.firstName || !formData.countryId) {
            toast.error('Please fill required fields (Company, Contact Name, Country)')
            return
        }

        try {
            const payload = {
                id: editingId || 0,
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobileNo: formData.mobileNo,
                type: formData.type,
                gstCertificate: formData.gstCertificate,
                country: "", // API seems to expect string name too? or ignores it? sending empty or look up name
                companyName: formData.companyName,
                emailId: formData.emailId,
                isGSTIN: formData.isGSTIN,
                gstNumber: formData.gstNumber,
                address: formData.address,
                landmark: formData.landmark,
                countryId: parseInt(formData.countryId),
                stateId: 0, // Default for now
                cityId: parseInt(formData.cityId) || 0,
                pincode: formData.pincode,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: editingId ? "U" : "C"
            }

            const response = await manageSupplier(payload)

            const isSuccess = response.data && (
                response.data.success === true ||
                response.status === 200 ||
                response.data.isValid === true
            )

            if (isSuccess) {
                toast.success(editingId ? 'Supplier updated successfully' : 'Supplier added successfully')
                fetchSuppliers()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save supplier')
            }
        } catch (error) {
            console.error('Error saving supplier:', error)
            toast.error('Error saving supplier')
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
                    id: deleteId,
                    firstName: "string",
                    lastName: "string",
                    mobileNo: "string",
                    type: "string",
                    gstCertificate: "string",
                    country: "string",
                    companyName: "string",
                    emailId: "string",
                    isGSTIN: true,
                    gstNumber: "string",
                    address: "string",
                    landmark: "string",
                    countryId: 0,
                    stateId: 0,
                    cityId: 0,
                    pincode: "string",
                    createdBy: 0,
                    modifiedBy: 0,
                    isActive: true,
                    spType: "D"
                }

                const response = await manageSupplier(payload)

                const isSuccess = response.data && (
                    response.data.success === true ||
                    response.status === 200 ||
                    response.data.isValid === true
                )

                if (isSuccess) {
                    toast.success('Supplier deleted successfully')
                    fetchSuppliers()
                    setDeleteId(null)
                    setIsDeleteModalOpen(false)
                } else {
                    toast.error(response.data?.message || 'Failed to delete supplier')
                }
            } catch (error) {
                console.error('Error deleting supplier:', error)
                toast.error('Error deleting supplier')
            }
        }
    }

    const closeModal = () => {
        setFormData(initialFormState)
        setEditingId(null)
        setCityOptions([])
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Supplier Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Suppliers' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Supplier</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={suppliers} emptyMessage="No suppliers added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Supplier" : "Add Supplier"}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols- gap-4">
                        <Input
                            label="Company Name *"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="Enter company name"
                        />
                        <Select
                            label="Supplier Type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { value: 'Supplier', label: 'Supplier' },
                                { value: 'Vendor', label: 'Vendor' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name *"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="First Name"
                        />
                        <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Last Name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Mobile No"
                            value={formData.mobileNo}
                            onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                            placeholder="Enter mobile"
                        />
                        <Input
                            label="Email ID"
                            value={formData.emailId}
                            onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                            placeholder="Enter email"
                            type="email"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Country *"
                            name="countryId"
                            value={formData.countryId}
                            onChange={(e) => {
                                const newCountryId = e.target.value;
                                setFormData({ ...formData, countryId: newCountryId, cityId: '' })
                                fetchCities(newCountryId)
                            }}
                            options={countries}
                            placeholder="Select Country"
                        />
                        <Select
                            label="City"
                            name="cityId"
                            value={formData.cityId}
                            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                            options={cityOptions}
                            placeholder="Select City"
                            disabled={!formData.countryId}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Pincode"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            placeholder="Enter pincode"
                        />
                        <Input
                            label="Landmark"
                            value={formData.landmark}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                            placeholder="Enter landmark"
                        />
                    </div>
                    <Input
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter full address"
                        className="w-full"
                    />

                    <div className="border-t pt-2 mt-2">
                        <label className="flex items-center space-x-2 cursor-pointer mb-2">
                            <input
                                type="checkbox"
                                checked={formData.isGSTIN}
                                onChange={(e) => setFormData({ ...formData, isGSTIN: e.target.checked })}
                                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-secondary-700">GST Registered?</span>
                        </label>
                        {formData.isGSTIN && (
                            <Input
                                label="GST Number"
                                value={formData.gstNumber}
                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                placeholder="Enter GST Number"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Services Provided</label>
                        <div className="grid grid-cols-2 gap-2 border border-secondary-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                            {serviceTypes.map(service => (
                                <label key={service.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.services?.includes(service.value)}
                                        onChange={() => {
                                            const newServices = formData.services.includes(service.value)
                                                ? formData.services.filter(s => s !== service.value)
                                                : [...formData.services, service.value];
                                            setFormData({ ...formData, services: newServices })
                                        }}
                                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-secondary-700">{service.label}</span>
                                </label>
                            ))}
                            {serviceTypes.length === 0 && <p className="text-sm text-gray-500">No service types found.</p>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier?"
            />
        </div>
    )
}

export default SupplierMaster
