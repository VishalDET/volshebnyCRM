import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import Select from '@components/Select'
import { Pencil, Trash2, Eye, X, ChevronDown } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import SupplierViewModal from '@components/SupplierViewModal'
import SearchableSelect from '@components/SearchableSelect'
import { manageSupplier, manageCountry, manageCity, manageServiceType } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const SupplierMaster = () => {
    const { user } = useAuth()
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
        cityId: '', // Keep for backward compatibility if needed, but primary is cityIds
        cityIds: [],
        isActive: true,
        spType: 'R',
        contacts: [
            {
                contactId: 0,
                supplierId: 0,
                contactName: '',
                contactNumber: '',
                contactEmail: '',
            }
        ],
        serviceIds: []
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [filterCountryId, setFilterCountryId] = useState('')

    useEffect(() => {
        fetchCountries()
        fetchServiceTypes()
    }, [])

    useEffect(() => {
        fetchSuppliers()
    }, [filterCountryId])

    const fetchCountries = async () => {
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
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
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
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
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
            // Filter duplicates
            const uniqueServices = []
            const seenIds = new Set()
            fetchedServices.forEach(s => {
                if (!seenIds.has(s.serviceId)) {
                    seenIds.add(s.serviceId)
                    uniqueServices.push({
                        value: s.serviceId,
                        label: s.serviceName
                    })
                }
            })
            setServiceTypes(uniqueServices)
        } catch (error) {
            console.error('Error fetching service types:', error)
        }
    }

    const fetchSuppliers = async () => {
        setIsLoading(true)
        try {
            // HQ (officeId 1) can see all or filter by country
            // Other offices are locked to their assigned countryId
            const effectiveCountryId = (user?.officeId === 1 || import.meta.env.DEV) 
                ? (parseInt(filterCountryId) || 0) 
                : (user?.countryId || 0)

            const payload = {
                id: 0,
                fullName: "string",
                companyContactNo: "string",
                countryId: effectiveCountryId,
                stateId: 0,
                cityId: 0,
                createdBy: 0,
                modifiedBy: 0,
                roleId: 0,
                isActive: true,
                isDeleted: false,
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

    const handleView = async (row) => {
        setIsLoading(true)
        try {
            const payload = {
                id: row.id,
                createdBy: user?.id || 0,
                roleId: user?.roleId || 0,
                spType: "E"
            }
            const response = await manageSupplier(payload)

            let supplierData = row
            if (response.data && response.data.data && response.data.data[0]) {
                supplierData = response.data.data[0]
            } else if (Array.isArray(response.data) && response.data[0]) {
                supplierData = response.data[0]
            }

            if (supplierData.countryId) {
                await fetchCities(supplierData.countryId)
            }

            setViewSupplier(supplierData)
            setIsViewModalOpen(true)
        } catch (error) {
            console.error("Error fetching supplier details:", error)
            toast.error("Error loading supplier details")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = async (row) => {
        setIsLoading(true)
        try {
            // Fetch detailed supplier info
            const payload = {
                id: row.id,
                createdBy: user?.id || 0,
                roleId: user?.roleId || 0,
                spType: "E"
            }
            const response = await manageSupplier(payload)
            console.log("EDIT FETCH RES:", response)

            let supplierData = row
            if (response.data && response.data.data && response.data.data[0]) {
                supplierData = response.data.data[0]
            } else if (Array.isArray(response.data) && response.data[0]) {
                supplierData = response.data[0]
            }

            if (supplierData.countryId) {
                await fetchCities(supplierData.countryId)
            }

            // Map cities
            const currentCityIds = supplierData.cityIds && supplierData.cityIds.length > 0
                ? supplierData.cityIds
                : (supplierData.cityId ? [supplierData.cityId] : [])

            // Map services to IDs
            const currentServiceIds = supplierData.services
                ? supplierData.services.map(s => s.serviceId)
                : (supplierData.serviceIds || [])

            setFormData({
                fullName: supplierData.fullName || '',
                companyContactNo: supplierData.companyContactNo || '',
                companyEmailId: supplierData.companyEmailId || '',
                companyName: supplierData.companyName || '',
                gstCertificate: supplierData.gstCertificate || '',
                isGSTIN: supplierData.isGSTIN || false,
                gstNumber: supplierData.gstNumber || '',
                address: supplierData.address || '',
                countryId: supplierData.countryId || '',
                stateId: supplierData.stateId || 0,
                cityId: supplierData.cityId || '',
                cityIds: currentCityIds,
                isActive: supplierData.isActive ?? true,
                spType: 'U',
                contacts: supplierData.contacts && supplierData.contacts.length > 0
                    ? supplierData.contacts
                    : [{ contactId: 0, supplierId: supplierData.id || 0, contactName: '', contactNumber: '', contactEmail: '' }],
                serviceIds: currentServiceIds
            })
            setEditingId(supplierData.id)
            setIsModalOpen(true)
        } catch (error) {
            console.error("Error fetching supplier details:", error)
            toast.error("Error loading supplier details")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { contactId: 0, supplierId: editingId || 0, contactName: '', contactNumber: '', contactEmail: '' }]
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
                cityId: (formData.cityIds && formData.cityIds.length > 0) ? formData.cityIds[0] : 0, // Send first as primary if API requires single
                cityIds: formData.cityIds || [],
                createdBy: user?.id || 0,
                roleId: user?.roleId || 0,
                modifiedBy: user?.id || 0,
                isActive: true,
                spType: editingId ? "U" : "C",
                contacts: validContacts.map(c => ({
                    contactId: c.contactId || 0,
                    supplierId: editingId || 0,
                    contactName: c.contactName || "",
                    contactNumber: c.contactNumber || "",
                    contactEmail: c.contactEmail || "",
                    spType: editingId && c.contactId ? "U" : "C"
                })),
                serviceIds: (formData.serviceIds || []).map(id => parseInt(id))
            }

            console.log("--------------- SAVE PAYLOAD DEBUG ---------------")
            console.log("Full Payload:", payload)
            console.log("Contacts:", payload.contacts)
            console.log("ServiceIDs:", payload.serviceIds)
            console.log("--------------------------------------------------")

            const response = await manageSupplier(payload)
            console.log("SAVE RESPONSE:", response)

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
                    createdBy: user?.id || 0,
                    roleId: user?.roleId || 0,
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
        setFormData(initialFormState)
        setEditingId(null)
        setCityOptions([])
        setCityDropdownOpen(false)
        setIsModalOpen(false)
    }

    // --- custom multi select toggle ---
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
    const toggleCitySelection = (cityId) => {
        setFormData(prev => {
            const currentIds = prev.cityIds || []
            const exists = currentIds.includes(cityId)
            let newIds
            if (exists) {
                newIds = currentIds.filter(id => id !== cityId)
            } else {
                newIds = [...currentIds, cityId]
            }
            return { ...prev, cityIds: newIds, cityId: newIds.length > 0 ? newIds[0] : '' }
        })
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
                {(user?.officeId === 1 || import.meta.env.DEV) && (
                    <div className="flex justify-end pt-0 p-4 mb-2 bg-white rounded-lg shadow-none">
                        <div className="w-64">
                            <SearchableSelect
                                label="Filter by Country"
                                placeholder="All Countries"
                                value={filterCountryId}
                                options={countries}
                                onChange={(e) => setFilterCountryId(e.target.value)}
                            />
                        </div>
                    </div>
                )}
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
                                setFormData({ ...formData, countryId: newCountryId, cityId: '', cityIds: [] })
                                fetchCities(newCountryId)
                            }}
                            options={countries}
                            placeholder="Select Country"
                        />
                        {/* Custom Multi-Select for City */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-secondary-700 mb-1">City</label>
                            <div
                                className={`input min-h-[42px] h-auto flex flex-wrap items-center gap-1 cursor-pointer ${!formData.countryId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                onClick={() => formData.countryId && setCityDropdownOpen(!cityDropdownOpen)}
                            >
                                {(!formData.cityIds || formData.cityIds.length === 0) && (
                                    <span className="text-gray-400">Select Cities</span>
                                )}
                                {formData.cityIds && formData.cityIds.map(cId => {
                                    const city = cityOptions.find(opt => opt.value === cId)
                                    if (!city) return null
                                    return (
                                        <span key={cId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                                            {city.label}
                                            <X size={12} className="cursor-pointer hover:text-blue-900"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleCitySelection(cId)
                                                }}
                                            />
                                        </span>
                                    )
                                })}
                                <div className="ml-auto pointer-events-none text-gray-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {cityDropdownOpen && formData.countryId && (
                                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {cityOptions.length === 0 ? (
                                        <div className="p-3 text-sm text-gray-500">No cities found</div>
                                    ) : (
                                        cityOptions.map(city => (
                                            <div
                                                key={city.value}
                                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                onClick={() => toggleCitySelection(city.value)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(formData.cityIds || []).includes(city.value)}
                                                    readOnly
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                                                />
                                                <span className="text-sm text-gray-700">{city.label}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {cityDropdownOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setCityDropdownOpen(false)}></div>
                            )}
                        </div>
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
            </Modal >

            <SupplierViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                supplier={viewSupplier}
                countries={countries}
                cities={cityOptions}
                serviceTypes={serviceTypes}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier?"
            />
        </div >
    )
}

export default SupplierMaster
