import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import { manageQuery, manageConfirmQuery } from '@api/query.api'
import { manageClient, manageHandler, manageSupplier, manageCurrency, manageCountry, manageCity } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import Loader from '@components/Loader'
import { Calendar, User, Building, Users, Banknote, FileText, Briefcase } from 'lucide-react'

const ConfirmQuery = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Master Data
    const [query, setQuery] = useState(null)
    const [client, setClient] = useState(null)
    const [suppliers, setSuppliers] = useState([])
    const [suppliersByDest, setSuppliersByDest] = useState({}) // { [destIndex]: [suppliers] }
    const [currencies, setCurrencies] = useState([])
    const [locationNames, setLocationNames] = useState({}) // map ID to name

    // Form State
    const [tourLeads, setTourLeads] = useState([
        { leadName: '', gender: '', age: '', visaStatus: '' }
    ])

    // Group services by destination index for UI, flatten on submit
    // Structure: { [destIndex]: [ { serviceType: '', ... } ] }
    const [servicesByDest, setServicesByDest] = useState({})

    const [guides, setGuides] = useState([
        { supplierId: '', supplierName: '', guideName: '', gender: '', contactNumber: '', language: '' }
    ])

    const [generalInfo, setGeneralInfo] = useState({
        isVisaIncluded: false,
        finalItinerary: '',
        miscellaneous: '' // Note: Payload doesn't have misc, but user asked. Will keep in state, maybe append to itinerary?
    })

    useEffect(() => {
        fetchInitialData()
    }, [id])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const qPayload = {
                id: parseInt(id),
                queryNo: "",
                handlerId: 0,
                clientId: 0,
                originCountryId: 0,
                originCityId: 0,
                travelDate: null,
                returnDate: null,
                totalDays: 0,
                adults: 0,
                children: 0,
                infants: 0,
                budget: 0,
                queryStatus: "",
                specialRequirements: "",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E",
                destinations: [],
                childAges: []
            }
            const qRes = await manageQuery(qPayload)
            const data = qRes.data?.data || (Array.isArray(qRes.data) ? qRes.data : [])
            const qData = Array.isArray(data) ? data[0] : data

            if (!qData) {
                toast.error("Query not found")
                navigate('/queries')
                return
            }
            setQuery(qData)

            // Seed locationNames immediately from queryData names if available
            const initialNames = {}
            if (qData.originCountryName) initialNames[`country_${qData.originCountryId}`] = qData.originCountryName
            if (qData.originCityName) initialNames[`city_${qData.originCityId}`] = qData.originCityName

            if (qData.destinations) {
                qData.destinations.forEach(d => {
                    if (d.countryName) initialNames[`country_${d.countryId}`] = d.countryName
                    if (d.cityName) initialNames[`city_${d.cityId}`] = d.cityName
                })
            }
            setLocationNames(prev => ({ ...prev, ...initialNames }))

            // 2. Fetch Full Client Details
            if (qData.clientId) {
                fetchClientDetails(qData.clientId)
            }

            // 3. Fetch Location Maps
            fetchCountriesAndMap()

            // 4. Fetch All Suppliers (for global use)
            const sPayload = {
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
                spType: "R"
            }
            const sRes = await manageSupplier(sPayload)
            const sData = sRes.data?.data || (Array.isArray(sRes.data) ? sRes.data : []) || []
            // Filter duplicates
            const uniqueSuppliers = []
            const sIds = new Set()
            sData.forEach(s => {
                if (!sIds.has(s.id)) {
                    sIds.add(s.id)
                    uniqueSuppliers.push({
                        value: s.id,
                        label: s.companyName || s.supplierName || s.fullName || 'Unknown Supplier',
                        countryId: s.countryId,
                        cityId: s.cityId
                    })
                }
            })
            setSuppliers(uniqueSuppliers)

            // 5. Fetch suppliers for each destination
            if (qData.destinations && qData.destinations.length > 0) {
                const destSuppliers = {}
                for (let i = 0; i < qData.destinations.length; i++) {
                    const dest = qData.destinations[i]
                    destSuppliers[i] = await fetchSuppliersForDestination(dest.countryId, dest.cityId)
                }
                setSuppliersByDest(destSuppliers)
            }

            // 3. Fetch Currencies
            const cPayload = {
                id: 0,
                currencyName: "string",
                currencySign: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const cRes = await manageCurrency(cPayload)
            const cData = cRes.data?.data || (Array.isArray(cRes.data) ? cRes.data : []) || []
            const uniqueCurrencies = []
            const cIds = new Set()
            cData.forEach(c => {
                if (!cIds.has(c.id)) {
                    cIds.add(c.id)
                    uniqueCurrencies.push({
                        value: c.id,
                        label: `${c.currencyName} (${c.currencySign})`
                    })
                }
            })
            setCurrencies(uniqueCurrencies)

            // 4. Fetch additional details for display (Client Name, Handler Name)
            // Note: manageQuery might return names, but if not we fetch.
            // Based on CreateQuery/ViewQuery, let's fetch lists or specific if needed.
            // For now, let's trust we can get names if we fetch lists or if manageQuery has them.
            // Actually, ViewQuery uses fetchClientDetails(id). Let's do that if clientName missing.

            if (qData.clientId && !qData.clientName) {
                const clPayload = {
                    id: qData.clientId,
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
                const clRes = await manageClient(clPayload)
                const clData = clRes.data?.data || (Array.isArray(clRes.data) ? clRes.data[0] : clRes.data)
                // If specific fetch returns array of 1 or filtered list, handle it.
                // If API ignores ID and returns all, we might need to find by ID. 
                // But usually R with ID returns that item. Let's assume it returns items.
                const actualClient = Array.isArray(clData) ? clData.find(c => c.id === qData.clientId) || clData[0] : clData

                if (actualClient) qData.clientName = `${actualClient.firstName} ${actualClient.lastName} (${actualClient.companyName})`
            }

            if (qData.handlerId && !qData.handlerName) {
                const hlPayload = {
                    id: qData.handlerId,
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
                const hlRes = await manageHandler(hlPayload)
                const hlData = hlRes.data?.data || (Array.isArray(hlRes.data) ? hlRes.data[0] : hlRes.data)
                const actualHandler = Array.isArray(hlData) ? hlData.find(h => h.id === qData.handlerId) || hlData[0] : hlData

                if (actualHandler) qData.handlerName = actualHandler.handlerName
            }

            // Re-set query with potential extra names
            setQuery({ ...qData })

            // 5. Fetch Location Names (Countries)
            const locRes = await manageCountry({ spType: "R" })
            if (locRes.data?.data) {
                const map = {}
                locRes.data.data.forEach(c => map[`country_${c.countryId}`] = c.countryName)
                setLocationNames(map)
            }

        } catch (error) {
            console.error(error)
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const fetchClientDetails = async (clientId) => {
        try {
            const payload = {
                id: clientId,
                firstName: "",
                lastName: "",
                mobileNo: "",
                companyName: "",
                emailId: "",
                isGSTIN: true,
                gstNumber: "",
                gstCertificate: "",
                address: "",
                landmark: "",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E"
            }
            const res = await manageClient(payload)
            const data = res.data?.data || []
            const clientData = Array.isArray(data) ? data[0] : data
            if (clientData) {
                setClient(clientData)
            }
        } catch (e) {
            console.error("Error fetching client details:", e)
        }
    }

    const fetchCountriesAndMap = async () => {
        try {
            const res = await manageCountry({ spType: "R", isDeleted: false })
            if (res.data?.data) {
                const updatedLocs = {}
                res.data.data.forEach(c => {
                    updatedLocs[`country_${c.countryId}`] = c.countryName
                })
                setLocationNames(prev => ({ ...prev, ...updatedLocs }))
            }
        } catch (e) { console.error(e) }
    }

    const fetchSuppliersForDestination = async (countryId, cityId) => {
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
                countryId: countryId || 0,
                stateId: 0,
                cityId: cityId || 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const res = await manageSupplier(payload)
            const data = res.data?.data || (Array.isArray(res.data) ? res.data : []) || []

            // Filter suppliers by destination and remove duplicates
            const uniqueSuppliers = []
            const sIds = new Set()
            data.forEach(s => {
                // Match by country and optionally city
                const matchesCountry = !countryId || s.countryId === countryId
                const matchesCity = !cityId || s.cityId === cityId

                if (matchesCountry && matchesCity && !sIds.has(s.id)) {
                    sIds.add(s.id)
                    uniqueSuppliers.push({
                        value: s.id,
                        label: s.companyName || s.supplierName || s.fullName || 'Unknown Supplier'
                    })
                }
            })
            return uniqueSuppliers
        } catch (error) {
            console.error('Error fetching suppliers for destination:', error)
            return []
        }
    }

    // --- Tour Leads Handlers ---
    const addTourLead = () => {
        setTourLeads([...tourLeads, { leadName: '', gender: '', age: '', visaStatus: '' }])
    }
    const removeTourLead = (index) => {
        if (tourLeads.length > 1) {
            setTourLeads(tourLeads.filter((_, i) => i !== index))
        }
    }
    const updateTourLead = (index, field, value) => {
        const updated = [...tourLeads]
        updated[index][field] = value
        setTourLeads(updated)
    }

    // --- Services Handlers ---
    const addService = (destIndex) => {
        setServicesByDest(prev => ({
            ...prev,
            [destIndex]: [
                ...(prev[destIndex] || []),
                {
                    serviceType: 'Transportation', // Default
                    supplierId: '',
                    serviceCharge: '',
                    currencyId: '',
                    description: '',
                    serviceDate: '',
                    // Type specific
                    pickupLocation: '', dropLocation: '',
                    checkInDate: '', checkOutDate: '',
                    mealType: ''
                }
            ]
        }))
    }
    const removeService = (destIndex, sIndex) => {
        setServicesByDest(prev => ({
            ...prev,
            [destIndex]: prev[destIndex].filter((_, i) => i !== sIndex)
        }))
    }
    const updateService = (destIndex, sIndex, field, value) => {
        setServicesByDest(prev => {
            const destServices = [...(prev[destIndex] || [])]
            destServices[sIndex] = { ...destServices[sIndex], [field]: value }
            return { ...prev, [destIndex]: destServices }
        })
    }

    // --- Guides Handlers ---
    const addGuide = () => {
        setGuides([...guides, { supplierId: '', supplierName: '', guideName: '', gender: '', contactNumber: '', language: '' }])
    }
    const removeGuide = (index) => {
        if (guides.length > 1) setGuides(guides.filter((_, i) => i !== index))
    }
    const updateGuide = (index, field, value) => {
        const updated = [...guides]
        updated[index][field] = value
        // If supplierId changes, update supplierName too
        if (field === 'supplierId') {
            const sup = suppliers.find(s => s.value == value)
            updated[index].supplierName = sup ? sup.label : ''
        }
        setGuides(updated)
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            // Flatten services
            const flatServices = []
            if (query && query.destinations) {
                query.destinations.forEach((dest, dIdx) => {
                    const destServices = servicesByDest[dIdx] || []
                    destServices.forEach(srv => {
                        // Try to find supplier in destination-specific list first, then global list
                        const destSuppliers = suppliersByDest[dIdx] || []
                        let sup = destSuppliers.find(s => s.value == srv.supplierId)
                        if (!sup) {
                            sup = suppliers.find(s => s.value == srv.supplierId)
                        }

                        flatServices.push({
                            countryId: dest.countryId,
                            cityId: dest.cityId,
                            serviceType: srv.serviceType,
                            serviceCharge: parseFloat(srv.serviceCharge) || 0,
                            currencyId: parseInt(srv.currencyId) || 0,
                            supplierId: parseInt(srv.supplierId) || 0,
                            supplierName: sup ? sup.label : "",
                            description: srv.description || "",

                            // Dates - ensure ISO if present
                            serviceDate: srv.serviceDate ? new Date(srv.serviceDate).toISOString() : null,
                            checkInDate: srv.checkInDate ? new Date(srv.checkInDate).toISOString() : null,
                            checkOutDate: srv.checkOutDate ? new Date(srv.checkOutDate).toISOString() : null,

                            pickupLocation: srv.pickupLocation || "",
                            dropLocation: srv.dropLocation || "",
                            mealType: srv.mealType || ""
                        })
                    })
                })
            }

            const payload = {
                queryId: parseInt(id),
                isVisaIncluded: generalInfo.isVisaIncluded,
                finalItinerary: generalInfo.finalItinerary || "",
                spType: "C", // Confirming usually creates a confirmed record
                tourLeads: tourLeads.map(tl => ({
                    leadName: tl.leadName || "",
                    gender: tl.gender || "",
                    age: parseInt(tl.age) || 0,
                    visaStatus: tl.visaStatus || ""
                })),
                services: flatServices,
                guides: guides.map(g => ({
                    supplierId: parseInt(g.supplierId) || 0,
                    supplierName: g.supplierName || "",
                    guideName: g.guideName || "",
                    gender: g.gender || "",
                    contactNumber: g.contactNumber || "",
                    language: g.language || ""
                }))
            }

            // Append miscellaneous to itinerary if needed, or ignore if API strictly forbids extra fields
            if (generalInfo.miscellaneous) {
                payload.finalItinerary += `\n\nMiscellaneous:\n${generalInfo.miscellaneous}`
            }

            console.log("Confirm Payload:", payload)
            const res = await manageConfirmQuery(payload)
            if (res.data?.success || res.status === 200) {
                toast.success("Query Confirmed Successfully!")
                navigate('/queries')
            } else {
                toast.error(res.data?.message || "Failed to confirm query")
            }

        } catch (error) {
            console.error(error)
            toast.error("Error confirming query")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <Loader fullScreen text="Loading details..." />
    if (!query) return null

    return (
        <div className="pb-10">
            <PageHeader
                title={`Confirm Query #${query.queryNo || id}`}
                breadcrumbs={[
                    { label: 'Queries', href: '/queries' },
                    { label: 'Confirm' }
                ]}
            />

            <div className="space-y-6 mt-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Information */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Client Information</h3>
                        {client ? (
                            <dl className="grid grid-cols-1 gap-2">
                                <div>
                                    <dt className="text-sm text-secondary-600">Full Name</dt>
                                    <dd className="font-medium">{client.firstName} {client.lastName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-secondary-600">Company</dt>
                                    <dd className="font-medium">{client.companyName || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-secondary-600">Contact</dt>
                                    <dd className="font-medium">{client.mobileNo || '-'} / {client.emailId || '-'}</dd>
                                </div>
                            </dl>
                        ) : (
                            <div className="text-secondary-600">Loading client details...</div>
                        )}
                    </div>

                    {/* Travel Details */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Travel Details</h3>
                        <dl className="grid grid-cols-2 gap-2">
                            <div>
                                <dt className="text-sm text-secondary-600">Dates</dt>
                                <dd className="font-medium">
                                    {query.travelDate && new Date(query.travelDate).toLocaleDateString()} - {query.returnDate && new Date(query.returnDate).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Total Days</dt>
                                <dd className="font-medium">{query.totalDays || 0}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Pax</dt>
                                <dd className="font-medium">
                                    {query.adults} Ad, {query.children} Ch, {query.infants} In
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Budget</dt>
                                <dd className="font-medium">₹{query.budget?.toLocaleString()}</dd>
                            </div>
                            {query.specialRequirements && (
                                <div className="col-span-2 mt-2">
                                    <dt className="text-sm text-secondary-600">Special Req</dt>
                                    <dd className="text-sm bg-gray-50 p-2 rounded italic">{query.specialRequirements}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Destinations & Children (if any) */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Destinations</h3>
                    <div className="space-y-2">
                        {query.destinations && query.destinations.map((dest, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <span className="font-bold text-gray-500 w-6">{idx + 1}.</span>
                                <span>{locationNames[`country_${dest.countryId}`] || dest.countryName || 'Loading...'}</span>
                                <span className="text-gray-400 mx-2">/</span>
                                <span>{locationNames[`city_${dest.cityId}`] || dest.cityName || 'Loading...'}</span>
                            </div>
                        ))}
                        {(!query.destinations || query.destinations.length === 0) && <p className="text-gray-500 italic">No destinations found.</p>}
                    </div>

                    {query.childAges && query.childAges.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-2">Children Ages</h4>
                            <div className="flex gap-2">
                                {query.childAges.map((age, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                        Age: {age.childAge}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 1. Tour Leads */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold">Tour Leads / Travellers</h3>
                        <Button size="sm" onClick={addTourLead}>+ Add Lead</Button>
                    </div>
                    {tourLeads.map((lead, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end bg-gray-50 p-3 rounded">
                            <Input label="Name" value={lead.leadName} onChange={e => updateTourLead(idx, 'leadName', e.target.value)} />
                            <Select label="Gender" value={lead.gender} onChange={e => updateTourLead(idx, 'gender', e.target.value)}
                                options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
                            <Input type="number" label="Age" value={lead.age} onChange={e => updateTourLead(idx, 'age', e.target.value)} />
                            <Input label="Visa Status" value={lead.visaStatus} onChange={e => updateTourLead(idx, 'visaStatus', e.target.value)} />
                            {tourLeads.length > 1 && (
                                <button onClick={() => removeTourLead(idx)} className="text-red-500 pb-2">Remove</button>
                            )}
                        </div>
                    ))}
                </div>

                {/* 2. Services by Destination */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Destinations & Services</h3>
                    {(!query.destinations || query.destinations.length === 0) && <p className="text-gray-500">No destinations found in query.</p>}

                    {query.destinations && query.destinations.map((dest, dIdx) => (
                        <div key={dIdx} className="mb-8 border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4 bg-blue-50 p-2 rounded">
                                <h4 className="font-bold text-blue-900">
                                    {dIdx + 1}. {locationNames[`country_${dest.countryId}`] || dest.countryName || 'Loading...'} - {locationNames[`city_${dest.cityId}`] || dest.cityName || 'Loading...'}
                                </h4>
                                <Button size="sm" variant="outline" onClick={() => addService(dIdx)}>+ Add Service</Button>
                            </div>

                            {/* Services List for this destination */}
                            <div className="space-y-4">
                                {(servicesByDest[dIdx] || []).map((srv, sIdx) => (
                                    <div key={sIdx} className="border p-4 rounded bg-gray-50 relative">
                                        <button onClick={() => removeService(dIdx, sIdx)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <Select label="Service Type" value={srv.serviceType}
                                                onChange={e => updateService(dIdx, sIdx, 'serviceType', e.target.value)}
                                                options={[
                                                    { value: 'Transportation', label: 'Transportation' },
                                                    { value: 'Hotels', label: 'Hotels' },
                                                    { value: 'Restaurants', label: 'Restaurants' }
                                                ]}
                                            />
                                            <Select label="Supplier" value={srv.supplierId}
                                                onChange={e => updateService(dIdx, sIdx, 'supplierId', e.target.value)}
                                                options={suppliersByDest[dIdx] || suppliers}
                                                placeholder="Select Supplier"
                                            />
                                            <Select label="Currency" value={srv.currencyId}
                                                onChange={e => updateService(dIdx, sIdx, 'currencyId', e.target.value)}
                                                options={currencies}
                                            />
                                            <Input type="number" label="Charge" value={srv.serviceCharge}
                                                onChange={e => updateService(dIdx, sIdx, 'serviceCharge', e.target.value)}
                                            />
                                        </div>

                                        {/* Type Specific Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            {srv.serviceType === 'Transportation' && (
                                                <>
                                                    <Input label="From (Pickup)" value={srv.pickupLocation} onChange={e => updateService(dIdx, sIdx, 'pickupLocation', e.target.value)} />
                                                    <Input label="To (Drop)" value={srv.dropLocation} onChange={e => updateService(dIdx, sIdx, 'dropLocation', e.target.value)} />
                                                    <Input type="datetime-local" label="Service Date" value={srv.serviceDate} onChange={e => updateService(dIdx, sIdx, 'serviceDate', e.target.value)} />
                                                </>
                                            )}
                                            {srv.serviceType === 'Hotels' && (
                                                <>
                                                    <Input type="datetime-local" label="Check-In" value={srv.checkInDate} onChange={e => updateService(dIdx, sIdx, 'checkInDate', e.target.value)} />
                                                    <Input type="datetime-local" label="Check-Out" value={srv.checkOutDate} onChange={e => updateService(dIdx, sIdx, 'checkOutDate', e.target.value)} />
                                                </>
                                            )}
                                            {srv.serviceType === 'Restaurants' && (
                                                <>
                                                    <Input type="datetime-local" label="Date" value={srv.serviceDate} onChange={e => updateService(dIdx, sIdx, 'serviceDate', e.target.value)} />
                                                    <Select label="Meal Type" value={srv.mealType} onChange={e => updateService(dIdx, sIdx, 'mealType', e.target.value)}
                                                        options={[{ value: 'Lunch', label: 'Lunch' }, { value: 'Dinner', label: 'Dinner' }]} />
                                                </>
                                            )}
                                        </div>

                                        <div className="w-full">
                                            <label className="text-sm font-medium text-gray-700">Description / Extras</label>
                                            <textarea className="input w-full mt-1" rows="2"
                                                value={srv.description} onChange={e => updateService(dIdx, sIdx, 'description', e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                ))}
                                {(!servicesByDest[dIdx] || servicesByDest[dIdx].length === 0) && (
                                    <p className="text-sm text-gray-400 italic pl-2">No services added for this destination yet.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Guides */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold">Guides</h3>
                        <Button size="sm" onClick={addGuide}>+ Add Guide</Button>
                    </div>
                    {guides.map((guide, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded relative">
                            {guides.length > 1 && <button onClick={() => removeGuide(idx)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>}

                            <Select label="Supplier" value={guide.supplierId}
                                onChange={e => updateGuide(idx, 'supplierId', e.target.value)}
                                options={suppliers}
                                placeholder={guide.supplierName || "Select Supplier"}
                            />
                            <Input label="Guide Name" value={guide.guideName} onChange={e => updateGuide(idx, 'guideName', e.target.value)} />
                            <Select label="Gender" value={guide.gender} onChange={e => updateGuide(idx, 'gender', e.target.value)}
                                options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
                            <Input label="Contact Number" value={guide.contactNumber} onChange={e => updateGuide(idx, 'contactNumber', e.target.value)} />
                            <Input label="Language" value={guide.language} onChange={e => updateGuide(idx, 'language', e.target.value)} />
                        </div>
                    ))}
                </div>

                {/* 4. General / Visa / Itinerary */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Final Details</h3>
                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5"
                                checked={generalInfo.isVisaIncluded}
                                onChange={e => setGeneralInfo({ ...generalInfo, isVisaIncluded: e.target.checked })}
                            />
                            <span className="font-medium">Visa Included</span>
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Final Itinerary</label>
                        <textarea className="input w-full" rows="4"
                            value={generalInfo.finalItinerary}
                            onChange={e => setGeneralInfo({ ...generalInfo, finalItinerary: e.target.value })}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Miscellaneous / Notes</label>
                        <textarea className="input w-full" rows="3"
                            value={generalInfo.miscellaneous}
                            onChange={e => setGeneralInfo({ ...generalInfo, miscellaneous: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <Button variant="secondary" onClick={() => navigate('/queries')}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} loading={submitting}>Confirm Query</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmQuery 
