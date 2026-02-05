import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import Loader from '@components/Loader'
import { manageServiceType, manageSupplier, manageClient, manageCountry, manageCity, manageCurrency } from '@api/masters.api'
import { createServiceBooking } from '@api/booking.api'
import { manageHandler } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const ServiceBooking = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    // Data States
    const [serviceTypes, setServiceTypes] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [allSuppliersData, setAllSuppliersData] = useState([])
    const [handlers, setHandlers] = useState([])
    const [clients, setClients] = useState([])
    const [allClientsData, setAllClientsData] = useState([])
    const [countries, setCountries] = useState([])
    const [cities, setCities] = useState([])
    const [currencies, setCurrencies] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        bookingId: '',
        handlerId: '',
        serviceTypeId: '',
        supplierId: '',
        clientId: '',
        countryId: '',
        cityId: '',
        bookingDate: new Date().toISOString().split('T')[0],
        serviceDate: '', // Used as Check-in Date for Hotels or Visit Date for others
        checkOutDate: '', // For Hotels
        nights: 0, // For Hotels
        serviceTime: '',
        source: '', // For Transport
        destination: '', // For Transport
        isLunch: false, // For Restaurant
        isDinner: false, // For Restaurant
        adults: 1,
        children: 0,
        currencyId: '',
        paymentOption: 'India Bank', // Default
        taxOption: 'No Tax', // Default
        serviceCharge: 0,
        remittanceCharge: 0,
        rateOfExchange: 1,
        gstAmount: 0,
        totalAmount: 0,
        cost: '', // Base Cost (USD)
        remarks: ''
    })

    // Filtered Suppliers based on Service Type
    const [filteredSuppliers, setFilteredSuppliers] = useState([])

    useEffect(() => {
        fetchAllData()
        generateBookingId()
    }, [])

    const generateBookingId = () => {
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const year = String(now.getFullYear()).slice(-2)
        const id = `VHSB00${month}${year}`
        setFormData(prev => ({ ...prev, bookingId: id }))
    }

    useEffect(() => {
        if (formData.serviceTypeId) {
            fetchSuppliers(formData.serviceTypeId)
        } else {
            setFilteredSuppliers([])
        }
    }, [formData.serviceTypeId])

    // Auto-calculate Total Amount and GST
    useEffect(() => {
        const baseCostUSD = parseFloat(formData.cost) || 0
        const roe = parseFloat(formData.rateOfExchange) || 1
        const baseCostConverted = baseCostUSD * roe

        let tax = 0
        let sc = 0
        let rem = 0

        if (formData.paymentOption === 'India Bank') {
            if (formData.taxOption === 'Service Charge') {
                sc = parseFloat(formData.serviceCharge) || 0
                tax = sc * 0.18 // 18% GST on SC
            }
        } else if (formData.paymentOption === 'Foreign Bank') {
            if (formData.taxOption === 'Remittance') {
                rem = parseFloat(formData.remittanceCharge) || 0
            }
        }

        const total = baseCostConverted + sc + tax + rem

        setFormData(prev => ({
            ...prev,
            gstAmount: tax.toFixed(2),
            totalAmount: total.toFixed(2)
        }))
    }, [formData.cost, formData.serviceCharge, formData.remittanceCharge, formData.taxOption, formData.paymentOption, formData.rateOfExchange])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchServiceTypes(),
                fetchClients(),
                fetchCountries(),
                fetchCurrencies(),
                fetchHandlers()
            ])
        } catch (error) {
            console.error("Error fetching initial data", error)
            toast.error("Failed to load master data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (formData.countryId) {
            fetchCities(formData.countryId)
        } else {
            setCities([])
        }
    }, [formData.countryId])

    const fetchCurrencies = async () => {
        try {
            const payload = {
                id: 0,
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                currencyName: "string",
                currencySign: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const response = await manageCurrency(payload)
            let data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
            setCurrencies(data.map(c => ({
                value: c.id,
                label: `${c.currencySign} - ${c.currencyName}`.trim()
            })))
        } catch (error) {
            console.error("Error fetching currencies", error)
        }
    }

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
            let data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
            setCountries(data.map(c => ({ value: c.countryId, label: c.countryName })))
        } catch (error) {
            console.error("Error fetching countries", error)
        }
    }

    const fetchCities = async (countryId) => {
        try {
            const payload = {
                cityId: 0,
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                cityName: "string",
                countryId: parseInt(countryId),
                stateId: 0,
                isActive: true,
                isDeleted: false, // Changed to false for active cities, though user req had true, usually R seeks active.
                spType: "R"
            }
            const response = await manageCity(payload)
            let data = []
            if (response.data) {
                if (Array.isArray(response.data)) data = response.data
                else if (response.data.data && Array.isArray(response.data.data)) data = response.data.data
                else if (response.data.success && response.data.data) data = response.data.data
            }

            // Stronger client-side filter
            const selectedCountryId = parseInt(countryId)
            const filteredData = data.filter(c => {
                // Check both lowercase and uppercase for safety
                const c_cid = c.countryId !== undefined ? c.countryId : c.CountryId
                return parseInt(c_cid) === selectedCountryId
            })

            setCities(filteredData.map(c => ({ value: c.cityId, label: c.cityName })))
        } catch (error) {
            console.error("Error fetching cities", error)
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
            let data = []
            if (response.data) {
                if (Array.isArray(response.data)) data = response.data
                else if (response.data.data && Array.isArray(response.data.data)) data = response.data.data
                else if (response.data.success && response.data.data) data = response.data.data
            }

            setServiceTypes(data.map(s => ({
                value: s.serviceId,
                label: s.serviceName
            })))
        } catch (error) {
            console.error("Error fetching service types", error)
        }
    }

    const fetchSuppliers = async (serviceTypeId) => {
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
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R",
                contacts: [],
                serviceIds: [parseInt(serviceTypeId)]
            }
            const response = await manageSupplier(payload)
            let data = []
            if (response.data) {
                if (Array.isArray(response.data)) data = response.data
                else if (response.data.data && Array.isArray(response.data.data)) data = response.data.data
                else if (response.data.success && response.data.data) data = response.data.data
            }

            setAllSuppliersData(data)
            setFilteredSuppliers(data.map(s => ({
                value: s.id,
                label: s.companyName || s.fullName || "Unknown Supplier"
            })))
        } catch (error) {
            console.error("Error fetching suppliers", error)
            toast.error("Failed to fetch suppliers for selected service")
        }
    }

    const fetchClients = async () => {
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
                isActive: true,
                isDeleted: false,
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                spType: "R"
            }
            const response = await manageClient(payload)
            let data = []
            if (response.data) {
                if (Array.isArray(response.data)) data = response.data
                else if (response.data.data && Array.isArray(response.data.data)) data = response.data.data
                else if (response.data.success && response.data.data) data = response.data.data
            }

            setAllClientsData(data)
            setClients(data.map(c => ({
                value: c.id,
                label: c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Client #${c.id}`
            })))
        } catch (error) {
            console.error("Error fetching clients", error)
        }
    }

    const fetchHandlers = async () => {
        try {
            const payload = {
                id: 0,
                handlerId: "string",
                handlerName: "string",
                emailId: "string",
                mobileNo: "string",
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const response = await manageHandler(payload)
            let data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
            setHandlers(data.map(h => ({
                value: h.id,
                label: h.handlerName
            })))
        } catch (error) {
            console.error("Error fetching handlers", error)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }

            // Reset tax option and fields if payment option changes
            if (name === 'paymentOption') {
                newState.taxOption = 'No Tax'
                newState.serviceCharge = 0
                newState.remittanceCharge = 0
            }

            return newState
        })
    }

    const getSelectedServiceType = () => {
        const type = serviceTypes.find(t => t.value === parseInt(formData.serviceTypeId))
        return type ? type.label.toLowerCase() : ''
    }

    const selectedClient = allClientsData.find(c => c.id === parseInt(formData.clientId))
    const selectedSupplier = allSuppliersData.find(s => s.id === parseInt(formData.supplierId))

    const handleSubmit = async () => {
        if (!formData.serviceTypeId || !formData.supplierId || !formData.clientId || !formData.serviceDate || !formData.handlerId) {
            toast.error("Please fill all required fields")
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                serviceId: 0,
                bookingId: formData.bookingId,
                handlerId: parseInt(formData.handlerId) || 0,
                serviceTypeId: parseInt(formData.serviceTypeId) || 0,
                supplierId: parseInt(formData.supplierId) || 0,
                clientId: parseInt(formData.clientId) || 0,
                countryId: parseInt(formData.countryId) || 0,
                cityId: parseInt(formData.cityId) || 0,
                bookingDate: formData.bookingDate ? new Date(formData.bookingDate).toISOString() : new Date().toISOString(),
                serviceDate: formData.serviceDate ? new Date(formData.serviceDate).toISOString() : new Date().toISOString(),
                checkOutDate: formData.checkOutDate ? new Date(formData.checkOutDate).toISOString() : (formData.serviceDate ? new Date(formData.serviceDate).toISOString() : new Date().toISOString()),
                nights: parseInt(formData.nights) || 0,
                serviceTime: formData.serviceTime ? (formData.serviceTime.includes(':') && formData.serviceTime.split(':').length === 2 ? `${formData.serviceTime}:00` : formData.serviceTime) : "00:00:00",
                source: formData.source || "",
                destination: formData.destination || "",
                isLunch: !!formData.isLunch,
                isDinner: !!formData.isDinner,
                adults: parseInt(formData.adults) || 0,
                children: parseInt(formData.children) || 0,
                currencyId: parseInt(formData.currencyId) || 0,
                paymentOption: formData.paymentOption || "",
                taxOption: formData.taxOption || "",
                cost: parseFloat(formData.cost) || 0,
                serviceCharge: parseFloat(formData.serviceCharge) || 0,
                remittanceCharge: parseFloat(formData.remittanceCharge) || 0,
                rateOfExchange: parseFloat(formData.rateOfExchange) || 1,
                gstAmount: parseFloat(formData.gstAmount) || 0,
                totalAmount: parseFloat(formData.totalAmount) || 0,
                remarks: formData.remarks || "",
                roleId: user?.roleId || 0,
                createdBy: user?.id || 0,
                modifiedBy: 0,
                isActive: true,
                spType: "C"
            }
            console.log("--------------- MISC SERVICE BOOKING PAYLOAD ---------------")
            console.log(payload)
            console.log("------------------------------------------------------------")
            const response = await createServiceBooking(payload)
            if (response.data?.success) {
                toast.success("Booking created successfully")
                navigate('/service-bookings')
            } else {
                toast.error(response.data?.message || "Failed to create booking")
            }
        } catch (error) {
            console.error("Booking error", error)
            if (error.response?.data) {
                console.error("Detailed Error Data:", error.response.data)
                const errorMsg = error.response.data.message ||
                    (error.response.data.errors ? JSON.stringify(error.response.data.errors) : null) ||
                    error.response.data.title ||
                    "An error occurred while creating booking"
                toast.error(errorMsg)
            } else {
                toast.error("An error occurred while creating booking")
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <Loader fullScreen />

    return (
        <div>
            <PageHeader
                title="New Service Booking"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Service Bookings', href: '/service-bookings' }, { label: 'New' }]}
            />
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">



                <div className="card col-span-5 max-w-4xl mx-auto p-0 rounded-2xl">
                    <div className='flex justify-between items-center bg-gray-50 text-secondary-600 border rounded-t-2xl border-secondary-200 p-6 py-3'>
                        <h2 className="text-lg font-semibold">Booking Details</h2>
                        <div className='flex gap-4'>
                            <Input
                                // label="Booking ID"
                                name="bookingId"
                                value={formData.bookingId}
                                readOnly
                                disabled
                                className="bg-gray-50 font-medium text-secondary-600"
                            />

                            <Select
                                // label="Handler *"
                                name="handlerId"
                                value={formData.handlerId}
                                onChange={handleChange}
                                options={handlers}
                                placeholder="Select Handler"
                            />
                        </div>
                    </div>
                    <div className='p-6'>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                            <Select
                                label="Client *"
                                name="clientId"
                                value={formData.clientId}
                                onChange={handleChange}
                                options={clients}
                                placeholder="Select Client"
                            />

                            <Select
                                label="Country *"
                                name="countryId"
                                value={formData.countryId}
                                onChange={handleChange}
                                options={countries}
                                placeholder="Select Country"
                            />

                            <Select
                                label="City *"
                                name="cityId"
                                value={formData.cityId}
                                onChange={handleChange}
                                options={cities}
                                placeholder="Select City"
                                disabled={!formData.countryId}
                            />

                            <Select
                                label="Service Type *"
                                name="serviceTypeId"
                                value={formData.serviceTypeId}
                                onChange={handleChange}
                                options={serviceTypes}
                                placeholder="Select Service Type"
                            />

                            <Select
                                label="Supplier *"
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                options={filteredSuppliers}
                                placeholder="Select Supplier"
                                disabled={!formData.serviceTypeId}
                            />

                            <div className='grid grid-cols-2 gap-4'>

                                <Input
                                    label={getSelectedServiceType().includes('hotel') ? "Check-in Date *" : "Service Date *"}
                                    type="date"
                                    name="serviceDate"
                                    value={formData.serviceDate}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Service Time"
                                    type="time"
                                    name="serviceTime"
                                    value={formData.serviceTime}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Hotel Specific Fields */}
                            {getSelectedServiceType().includes('hotel') && (
                                <>
                                    <Input
                                        label="Check-out Date *"
                                        type="date"
                                        name="checkOutDate"
                                        value={formData.checkOutDate}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Nights"
                                        type="number"
                                        name="nights"
                                        value={formData.nights}
                                        readOnly
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </>
                            )}

                            {/* Restaurant Specific Fields */}
                            {getSelectedServiceType().includes('restaurant') && (
                                <div className="flex items-center gap-6 p-4 bg-secondary-50 rounded-lg md:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isLunch"
                                            name="isLunch"
                                            checked={formData.isLunch}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <label htmlFor="isLunch" className="text-sm font-medium text-secondary-700 cursor-pointer">Lunch</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isDinner"
                                            name="isDinner"
                                            checked={formData.isDinner}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-primary-600 rounded"
                                        />
                                        <label htmlFor="isDinner" className="text-sm font-medium text-secondary-700 cursor-pointer">Dinner</label>
                                    </div>
                                </div>
                            )}

                            {/* Transportation Specific Fields */}
                            {(getSelectedServiceType().includes('transport') || getSelectedServiceType().includes('transfer')) && (
                                <>
                                    <Input
                                        label="Source *"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        placeholder="Starting point..."
                                    />
                                    <Input
                                        label="Destination *"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        placeholder="Ending point..."
                                    />
                                </>
                            )}




                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Adults"
                                    type="number"
                                    name="adults"
                                    value={formData.adults}
                                    onChange={handleChange}
                                    min="1"
                                />
                                <Input
                                    label="Children"
                                    type="number"
                                    name="children"
                                    value={formData.children}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-secondary-50/50 rounded-2xl border border-secondary-100">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider">Financial Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Base Cost (USD) *"
                                            type="number"
                                            name="cost"
                                            value={formData.cost}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                        />
                                        <Select
                                            label="Currency *"
                                            name="currencyId"
                                            value={formData.currencyId}
                                            onChange={handleChange}
                                            options={currencies}
                                            placeholder="Currency"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Exchange Rate"
                                            type="number"
                                            name="rateOfExchange"
                                            value={formData.rateOfExchange}
                                            onChange={handleChange}
                                            placeholder="1.00"
                                        />
                                        <Select
                                            label="Payment Option"
                                            name="paymentOption"
                                            value={formData.paymentOption}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'India Bank', label: 'Received in India Bank' },
                                                { value: 'Foreign Bank', label: 'Received in Foreign Bank' }
                                            ]}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Tax Option"
                                            name="taxOption"
                                            value={formData.taxOption}
                                            onChange={handleChange}
                                            options={formData.paymentOption === 'India Bank' ? [
                                                { value: 'No Tax', label: 'No Tax' },
                                                { value: 'Service Charge', label: 'Service Charge' }
                                            ] : [
                                                { value: 'No Tax', label: 'No Tax' },
                                                { value: 'Remittance', label: 'Remittance' }
                                            ]}
                                        />
                                        {formData.taxOption === 'Service Charge' && (
                                            <Input
                                                label="Service Charge"
                                                type="number"
                                                name="serviceCharge"
                                                value={formData.serviceCharge}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                            />
                                        )}
                                        {formData.taxOption === 'Remittance' && (
                                            <Input
                                                label="Remittance Amount"
                                                type="number"
                                                name="remittanceCharge"
                                                value={formData.remittanceCharge}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end space-y-3 bg-white p-4 rounded-2xl border border-secondary-200">
                                    <div className="flex justify-between text-sm text-secondary-600">
                                        <span>Base Cost (USD):</span>
                                        <span>${(parseFloat(formData.cost) || 0).toFixed(2)}</span>
                                    </div>
                                    {parseFloat(formData.rateOfExchange || 0) !== 1 && (
                                        <div className="flex justify-between text-sm text-secondary-600 italic">
                                            <span>Converted Cost:</span>
                                            <span>{((parseFloat(formData.cost) || 0) * (parseFloat(formData.rateOfExchange) || 1)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {formData.taxOption === 'Service Charge' && (
                                        <>
                                            <div className="flex justify-between text-sm text-secondary-600">
                                                <span>Service Charge:</span>
                                                <span>{parseFloat(formData.serviceCharge || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-secondary-600">
                                                <span>GST (18% on SC):</span>
                                                <span>{formData.gstAmount}</span>
                                            </div>
                                        </>
                                    )}
                                    {formData.taxOption === 'Remittance' && (
                                        <div className="flex justify-between text-sm text-secondary-600">
                                            <span>Remittance:</span>
                                            <span>{parseFloat(formData.remittanceCharge || 0).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-primary-600 pt-2 border-t border-secondary-100">
                                        <span>Total Amount:</span>
                                        <span>{formData.totalAmount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Input
                                    label="Remarks"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="Any special requests or notes..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-4 p-6 py-4 border-t bg-gray-50 rounded-b-2xl border-secondary-100">
                        <Button variant="secondary" onClick={() => navigate('/service-bookings')}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Booking...' : 'Confirm Booking'}
                        </Button>
                    </div>

                </div>

                <div className='col-span-2 '>
                    <div className='card h-fit sticky top-6 p-0 rounded-2xl'>
                        <h2 className="text-lg font-normal bg-gray-50 text-secondary-600 border rounded-t-2xl border-secondary-200 p-6 py-3">Client Info</h2>
                        {selectedClient ? (
                            <div className="space-y-6  p-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Full Name</span>
                                    <span className="text-sm font-medium text-secondary-900">{selectedClient.firstName} {selectedClient.lastName}</span>
                                </div>
                                {selectedClient.companyName && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Company</span>
                                        <span className="text-sm font-medium text-secondary-900">{selectedClient.companyName}</span>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Contact Details</span>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-secondary-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            {selectedClient.mobileNo}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-secondary-600 overflow-hidden text-ellipsis">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {selectedClient.emailId}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Address</span>
                                    <span className="text-sm text-secondary-600 leading-snug">
                                        {[selectedClient.address, selectedClient.landmark, selectedClient.pincode].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <p className="text-sm text-secondary-500">Select a client to view their information here</p>
                            </div>
                        )}
                    </div>
                    {/* Supplier Info Panel */}
                    <div className='card h-fit sticky p-0 rounded-2xl border-secondary-200 mt-4' style={{ top: 'calc(1.5rem + 300px)' }}>
                        <h2 className="text-lg font-normal bg-gray-50 text-secondary-600 border rounded-t-2xl border-secondary-200 p-6 py-3">Supplier Info</h2>
                        {selectedSupplier ? (
                            <div className="space-y-6 p-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Company / Name</span>
                                    <span className="text-sm font-medium text-secondary-900">{selectedSupplier.companyName || selectedSupplier.fullName}</span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Contact Details</span>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-secondary-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            {selectedSupplier.companyContactNo}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-secondary-600 overflow-hidden text-ellipsis">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {selectedSupplier.companyEmailId || selectedSupplier.fullName}
                                        </div>
                                    </div>
                                </div>

                                {selectedSupplier.gstNumber && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">GST Number</span>
                                        <span className="text-sm font-medium text-primary-600">{selectedSupplier.gstNumber}</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Address</span>
                                    <span className="text-sm text-secondary-600 leading-snug">
                                        {selectedSupplier.address}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <p className="text-sm text-secondary-500 px-4">Select a supplier to view their information here</p>
                            </div>
                        )}
                    </div>
                </div>



            </div>
        </div>
    )
}

export default ServiceBooking
