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
import { manageClient, manageCountry, manageCity } from '@api/masters.api'
import { toast } from 'react-hot-toast'

const ClientMaster = () => {
    const [clients, setClients] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [countries, setCountries] = useState([])
    const [cityOptions, setCityOptions] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [viewClient, setViewClient] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)

    const initialFormState = {
        firstName: '',
        lastName: '',
        mobileNo: '',
        companyName: '',
        emailId: '',
        isGSTIN: true,
        gstNumber: '',
        gstCertificate: '',
        address: '',
        landmark: '',
        countryId: '',
        stateId: 0,
        cityId: '',
        pincode: '',
        contacts: [
            {
                contactId: 0,
                clientId: 0,
                contactName: '',
                contactNumber: '',
                contactEmail: '',
                spType: ''
            }
        ],
        isActive: true,
        spType: 'R'
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchClients()
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
            if (response.data && response.data.data) {
                // Filter by countryId (client-side safeguard) and then filter duplicates
                const uniqueCities = []
                const seenIds = new Set()
                response.data.data.forEach(c => {
                    const matchesCountry = c.countryId === parseInt(countryId)
                    if (matchesCountry && !seenIds.has(c.cityId)) {
                        seenIds.add(c.cityId)
                        uniqueCities.push({
                            value: c.cityId,
                            label: c.cityName
                        })
                    }
                })
                setCityOptions(uniqueCities)
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
        }
    }

    const fetchClients = async () => {
        setIsLoading(true)
        try {
            const payload = {
                id: 0,
                firstName: "string",
                lastName: "string",
                mobileNo: "string",
                companyName: "string",
                emailId: "string",
                isGSTIN: true,
                gstNumber: "string",
                gstCertificate: "string",
                address: "string",
                landmark: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "string",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const response = await manageClient(payload)
            if (response.data && response.data.data) {
                setClients(response.data.data)
            } else if (Array.isArray(response.data)) {
                setClients(response.data)
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
            toast.error('Failed to fetch clients')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'companyName', label: 'Company Name' },
        {
            key: 'firstName',
            label: 'Contact Person',
            render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`
        },
        { key: 'mobileNo', label: 'Mobile' },
        { key: 'emailId', label: 'Email' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleView(row)} className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleAddContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { contactId: 0, clientId: editingId || 0, contactName: '', contactNumber: '', contactEmail: '', spType: 'C' }]
        })
    }

    const handleRemoveContact = (index) => {
        if (formData.contacts.length === 1) return
        const newContacts = formData.contacts.filter((_, i) => i !== index)
        setFormData({ ...formData, contacts: newContacts })
    }

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts]
        newContacts[index][field] = value
        setFormData({ ...formData, contacts: newContacts })
    }

    const handleView = async (row) => {
        setIsLoading(true)
        try {
            const payload = {
                id: row.id,
                firstName: "string",
                lastName: "string",
                mobileNo: "string",
                companyName: "string",
                emailId: "string",
                isGSTIN: true,
                gstNumber: "string",
                gstCertificate: "string",
                address: "string",
                landmark: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "string",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E"
            }
            const response = await manageClient(payload)

            let clientData = row
            if (response.data && response.data.data && response.data.data[0]) {
                clientData = response.data.data[0]
            } else if (Array.isArray(response.data) && response.data[0]) {
                clientData = response.data[0]
            }

            if (clientData.countryId) {
                await fetchCities(clientData.countryId)
            }

            setViewClient(clientData)
            setIsViewModalOpen(true)
        } catch (error) {
            console.error("Error fetching client details:", error)
            toast.error("Error loading client details")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = async (row) => {
        setIsLoading(true)
        try {
            const payload = {
                id: row.id,
                firstName: "string",
                lastName: "string",
                mobileNo: "string",
                companyName: "string",
                emailId: "string",
                isGSTIN: true,
                gstNumber: "string",
                gstCertificate: "string",
                address: "string",
                landmark: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "string",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E"
            }
            const response = await manageClient(payload)

            let clientData = row
            if (response.data && response.data.data && response.data.data[0]) {
                clientData = response.data.data[0]
            } else if (Array.isArray(response.data) && response.data[0]) {
                clientData = response.data[0]
            }

            if (clientData.countryId) {
                await fetchCities(clientData.countryId)
            }

            setFormData({
                firstName: clientData.firstName || '',
                lastName: clientData.lastName || '',
                mobileNo: clientData.mobileNo || '',
                companyName: clientData.companyName || '',
                emailId: clientData.emailId || '',
                isGSTIN: clientData.isGSTIN || false,
                gstNumber: clientData.gstNumber || '',
                gstCertificate: clientData.gstCertificate || '',
                address: clientData.address || '',
                landmark: clientData.landmark || '',
                countryId: clientData.countryId || '',
                stateId: clientData.stateId || 0,
                cityId: clientData.cityId || '',
                pincode: clientData.pincode || '',
                isActive: clientData.isActive ?? true,
                spType: 'U',
                contacts: clientData.contacts && clientData.contacts.length > 0
                    ? clientData.contacts.map(c => ({
                        ...c,
                        contactId: c.contactId || c.id || 0,
                        contactName: c.contactName || c.name || "",
                        contactNumber: c.contactNumber || c.number || "",
                        contactEmail: c.contactEmail || c.email || "",
                        spType: (c.contactId || c.id) ? 'U' : 'C'
                    }))
                    : [{ contactId: 0, clientId: clientData.id || 0, contactName: '', contactNumber: '', contactEmail: '', spType: 'C' }]
            })
            setEditingId(clientData.id)
            setIsModalOpen(true)
        } catch (error) {
            console.error("Error fetching client details:", error)
            toast.error("Error loading client details")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.companyName || !formData.firstName) {
            toast.error("Please fill required fields")
            return
        }

        try {
            const payload = {
                id: editingId || 0,
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobileNo: formData.mobileNo,
                companyName: formData.companyName,
                emailId: formData.emailId,
                isGSTIN: formData.isGSTIN,
                gstNumber: formData.gstNumber,
                gstCertificate: formData.gstCertificate,
                address: formData.address,
                landmark: formData.landmark,
                countryId: parseInt(formData.countryId) || 0,
                stateId: parseInt(formData.stateId) || 0,
                cityId: parseInt(formData.cityId) || 0,
                pincode: formData.pincode,
                contacts: formData.contacts.map(c => ({
                    contactId: c.contactId || 0,
                    clientId: editingId || 0,
                    contactName: c.contactName || c.name || "", // Fallback for UI state discrepancy
                    contactNumber: c.contactNumber || c.number || "",
                    contactEmail: c.contactEmail || c.email || "",
                    spType: editingId && c.contactId ? "U" : "C"
                })),
                createdBy: 0,
                modifiedBy: 0,
                isActive: formData.isActive,
                spType: editingId ? "U" : "C"
            }

            console.log("SAVE PAYLOAD:", payload)

            const response = await manageClient(payload)
            if (response.data && (response.data.success || response.data.isValid || response.status === 200)) {
                toast.success(editingId ? "Client updated successfully" : "Client added successfully")
                fetchClients()
                closeModal()
            } else {
                toast.error(response.data?.message || "Operation failed")
            }
        } catch (error) {
            console.error("Error saving client:", error)
            toast.error("Failed to save client")
        }
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        try {
            const payload = {
                id: deleteId,
                spType: "D",
                // dummy fields strictly for schema compliance if needed
                firstName: "", lastName: "", mobileNo: "", companyName: "", emailId: "",
                gstNumber: "", gstCertificate: "", address: "", landmark: "", pincode: "",
                contacts: [], isActive: false
            }
            const response = await manageClient(payload)
            if (response.data && (response.data.success || response.data.isValid)) {
                toast.success("Client deleted successfully")
                fetchClients()
            } else {
                toast.error(response.data?.message || "Failed to delete client")
            }
        } catch (error) {
            console.error("Error deleting client:", error)
            toast.error("Failed to delete client")
        } finally {
            setIsDeleteModalOpen(false)
            setDeleteId(null)
        }
    }

    const closeModal = () => {
        setFormData(initialFormState)
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Client Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Clients' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Client</Button>}
            />

            <MastersNavigation />

            <div className="card mt-4">
                <Table
                    columns={columns}
                    data={clients}
                    isLoading={isLoading}
                    emptyMessage="No clients found"
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Client" : "Add Client"} size="lg">
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-2">
                    {/* Company Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-secondary-900 border-b pb-2">Company Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Company Name"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Enter company name"
                                required
                            />
                            <Input
                                label="Mobile No"
                                value={formData.mobileNo}
                                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                                placeholder="Mobile Number"
                            />
                            <Input
                                label="Email ID"
                                value={formData.emailId}
                                onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                                placeholder="Email Address"
                                type="email"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="First Name"
                                required
                            />
                            <Input
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Last Name"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Select
                                label="Country"
                                value={formData.countryId}
                                onChange={(e) => {
                                    setFormData({ ...formData, countryId: e.target.value, cityId: '' })
                                    fetchCities(e.target.value)
                                }}
                                options={countries}
                                placeholder="Select Country"
                            />
                            {/* State is skipped as per user schema mostly pointing to 0 or same as city flow */}
                            <Select
                                label="City"
                                value={formData.cityId}
                                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                options={cityOptions}
                                placeholder="Select City"
                                disabled={!formData.countryId}
                            />
                            <Input
                                label="Pincode"
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                placeholder="Pincode"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Address"
                            />
                            <Input
                                label="Landmark"
                                value={formData.landmark}
                                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                placeholder="Landmark"
                            />
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                checked={formData.isGSTIN}
                                onChange={(e) => setFormData({ ...formData, isGSTIN: e.target.checked })}
                                id="isGSTIN"
                            />
                            <label htmlFor="isGSTIN" className="text-sm">Is GST Registered?</label>
                        </div>

                        {formData.isGSTIN && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="GST Number"
                                    value={formData.gstNumber}
                                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                    placeholder="GST Number"
                                />
                                <Input
                                    label="GST Certificate"
                                    value={formData.gstCertificate}
                                    onChange={(e) => setFormData({ ...formData, gstCertificate: e.target.value })}
                                    placeholder="Certificate URL/Path"
                                />
                            </div>
                        )}
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-bold text-secondary-900">Additional Contacts</h3>
                            <button
                                type="button"
                                onClick={handleAddContact}
                                className="text-xs text-primary-600 font-semibold hover:text-primary-800"
                            >
                                + Add Contact
                            </button>
                        </div>

                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg relative group border">
                                {formData.contacts.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveContact(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                                        title="Remove Contact"
                                    >
                                        &times; // Using entity for close icon
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Name"
                                        value={contact.contactName}
                                        onChange={(e) => handleContactChange(index, 'contactName', e.target.value)}
                                        placeholder="Contact Name"
                                    />
                                    <Input
                                        label="Number"
                                        value={contact.contactNumber}
                                        onChange={(e) => handleContactChange(index, 'contactNumber', e.target.value)}
                                        placeholder="Phone Number"
                                    />
                                    <Input
                                        label="Email"
                                        value={contact.contactEmail}
                                        onChange={(e) => handleContactChange(index, 'contactEmail', e.target.value)}
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-secondary-200">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{editingId ? 'Update' : 'Add'} Client</Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Client"
                message="Are you sure you want to delete this client?"
            />

            {/* View Modal - Simple Implementation inline or separate component could be used */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Client Details">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {viewClient && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Company</label><p>{viewClient.companyName}</p></div>
                                <div><label className="text-xs font-bold text-gray-500">Contact Person</label><p>{viewClient.firstName} {viewClient.lastName}</p></div>
                                <div><label className="text-xs font-bold text-gray-500">Mobile</label><p>{viewClient.mobileNo}</p></div>
                                <div><label className="text-xs font-bold text-gray-500">Email</label><p>{viewClient.emailId}</p></div>
                                <div><label className="text-xs font-bold text-gray-500">Address</label><p>{viewClient.address}</p></div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">City</label>
                                    <p>{cityOptions.find(c => c.value === viewClient.cityId)?.label || viewClient.cityId}</p>
                                </div>
                            </div>
                            {viewClient.contacts && viewClient.contacts.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-bold border-b mb-2">Contacts</h4>
                                    {viewClient.contacts.map((c, i) => (
                                        <div key={i} className="mb-2 p-2 bg-gray-50 rounded">
                                            <p className="text-sm"><strong>{c.contactName}</strong> - {c.contactNumber} ({c.contactEmail})</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default ClientMaster
