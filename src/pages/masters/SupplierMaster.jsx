import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import Select from '@components/Select'
import { Pencil, Trash2, Eye } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import SupplierViewModal from '@components/SupplierViewModal'
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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewSupplier, setViewSupplier] = useState(null)

    const initialFormState = {
        fullName: '',
        companyContactNo: '',
        companyEmailId: '',
        companyName: '',
        gstCertificate: '',
        isGSTIN: false,
        gstNumber: '',
        address: '',
        countryId: '',
        stateId: 0,
        cityId: '',
        isActive: true,
        spType: 'R',
        contacts: [
            {
                contactId: 0,
                supplierId: 0,
                contactName: '',
                contactNumber: '',
                contactEmail: '',
                spType: ''
            }
        ],
        serviceIds: []
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
                fullName: "string",
                companyContactNo: "string",
                companyEmailId: "string",
                companyName: "string",
                gstCertificate: "string",
                isGSTIN: true,
                gstNumber: "string",
                address: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R",
                contacts: [],
                serviceIds: []
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
        { key: 'fullName', label: 'Contact Person' },
        { key: 'companyContactNo', label: 'Mobile' },
        { key: 'address', label: 'Address' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleView(row)} className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                    </button>
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

    const handleView = (row) => {
        setViewSupplier(row)
        setIsViewModalOpen(true)
    }

    const handleEdit = async (row) => {
        if (row.countryId) {
            await fetchCities(row.countryId)
        }

        setFormData({
            fullName: row.fullName || '',
            companyContactNo: row.companyContactNo || '',
            companyEmailId: row.companyEmailId || '',
            companyName: row.companyName || '',
            gstCertificate: row.gstCertificate || '',
            isGSTIN: row.isGSTIN || false,
            gstNumber: row.gstNumber || '',
            address: row.address || '',
            countryId: row.countryId || '',
            stateId: row.stateId || 0,
            cityId: row.cityId || '',
            isActive: row.isActive || true,
            spType: 'U',
            contacts: row.contacts && row.contacts.length > 0 ? row.contacts : [{ contactId: 0, supplierId: row.id || 0, contactName: '', contactNumber: '', contactEmail: '', spType: '' }],
            serviceIds: row.serviceIds || []
        })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleAddContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { contactId: 0, supplierId: editingId || 0, contactName: '', contactNumber: '', contactEmail: '', spType: '' }]
        })
    }

    const handleRemoveContact = (index) => {
        if (formData.contacts.length > 1) {
            const newContacts = formData.contacts.filter((_, i) => i !== index);
            setFormData({ ...formData, contacts: newContacts });
        }
    }

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts];
        newContacts[index] = { ...newContacts[index], [field]: value };
        setFormData({ ...formData, contacts: newContacts });
    }

    const handleSave = async () => {
        if (!formData.companyName || !formData.countryId) {
            toast.error('Please fill required fields (Company, Country)')
            return
        }

        try {
            // Filter out empty contacts
            const validContacts = formData.contacts.filter(c => c.contactName.trim() !== '' || c.contactNumber.trim() !== '');

            // If fullName is empty, use company name as a fallback
            const finalFullName = formData.fullName?.trim() || formData.companyName;

            const payload = {
                id: editingId || 0,
                fullName: finalFullName,
                companyContactNo: formData.companyContactNo || "",
                companyEmailId: formData.companyEmailId || "",
                companyName: formData.companyName,
                gstCertificate: formData.gstCertificate || "",
                isGSTIN: !!formData.isGSTIN,
                gstNumber: formData.gstNumber || "",
                address: formData.address || "",
                countryId: parseInt(formData.countryId) || 0,
                stateId: parseInt(formData.stateId) || 0,
                cityId: parseInt(formData.cityId) || 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: editingId ? "U" : "C",
                contacts: validContacts.map(c => ({
                    contactId: c.contactId || 0,
                    supplierId: editingId || 0,
                    contactName: c.contactName || "",
                    contactNumber: c.contactNumber || "",
                    contactEmail: c.contactEmail || "",
                    spType: editingId && c.contactId ? "U" : "C" // If editing and contactId exists, it's an update, otherwise create
                })),
                serviceIds: formData.serviceIds || [],
                // Legacy fields fallbacks in case backend still expects them
                firstName: finalFullName,
                lastName: "",
                mobileNo: formData.companyContactNo || "",
                emailId: formData.companyEmailId || "",
                type: "Supplier"
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

            // Try to extract detailed error message from backend
            let errorMessage = 'Error saving supplier';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                errorMessage = JSON.stringify(error.response.data.errors);
            } else if (error.response?.data) {
                console.error('Backend response:', error.response.data);
                errorMessage = 'Backend error: ' + (error.response.data.title || 'See console for details');
            }

            toast.error(errorMessage)
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
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Company Name *"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="Enter company name"
                        />
                        <Input
                            label="Contact Person *"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Full Name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Company Contact No"
                            value={formData.companyContactNo}
                            onChange={(e) => setFormData({ ...formData, companyContactNo: e.target.value })}
                            placeholder="Company Contact"
                        />
                        <Input
                            label="Company Email ID"
                            value={formData.companyEmailId}
                            onChange={(e) => setFormData({ ...formData, companyEmailId: e.target.value })}
                            placeholder="Company Email"
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
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="GST Number"
                                    value={formData.gstNumber}
                                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                    placeholder="Enter GST Number"
                                />
                                <Input
                                    label="GST Certificate"
                                    value={formData.gstCertificate}
                                    onChange={(e) => setFormData({ ...formData, gstCertificate: e.target.value })}
                                    placeholder="Certificate Link/Ref"
                                />
                            </div>
                        )}
                    </div>

                    {/* Contacts Section */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-secondary-800">Additional Contacts</h3>
                            <button
                                type="button"
                                onClick={handleAddContact}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                            >
                                + Add Contact
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.contacts.map((contact, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-gray-50 relative group">
                                    {formData.contacts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveContact(index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <Input
                                            label="Contact Name"
                                            value={contact.contactName}
                                            onChange={(e) => handleContactChange(index, 'contactName', e.target.value)}
                                            placeholder="Name"
                                            className="bg-white"
                                        />
                                        <Input
                                            label="Contact Number"
                                            value={contact.contactNumber}
                                            onChange={(e) => handleContactChange(index, 'contactNumber', e.target.value)}
                                            placeholder="Number"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Contact Email"
                                            value={contact.contactEmail}
                                            onChange={(e) => handleContactChange(index, 'contactEmail', e.target.value)}
                                            placeholder="Email"
                                            type="email"
                                            className="bg-white"
                                        />
                                        <Input
                                            label="Type"
                                            value={contact.spType}
                                            onChange={(e) => handleContactChange(index, 'spType', e.target.value)}
                                            placeholder="e.g. Sales, Support"
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Services Provided</label>
                        <div className="grid grid-cols-2 gap-2 border border-secondary-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                            {serviceTypes.map(service => (
                                <label key={service.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.serviceIds?.includes(service.value)}
                                        onChange={() => {
                                            const newServices = formData.serviceIds.includes(service.value)
                                                ? formData.serviceIds.filter(id => id !== service.value)
                                                : [...formData.serviceIds, service.value];
                                            setFormData({ ...formData, serviceIds: newServices })
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

            <SupplierViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                supplier={viewSupplier}
                countries={countries}
                serviceTypes={serviceTypes}
            />

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
