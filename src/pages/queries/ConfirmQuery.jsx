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
import { Calendar, User, Building, Users, Banknote, FileText, Briefcase, Trash2, Import } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import ImportTravellerModal from '@components/ImportTravellerModal'

const ConfirmQuery = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
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
        { leadName: '', gender: '', age: '', passportNumber: '', visaStatus: '', contactNumber: '' }
    ])
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)

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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    useEffect(() => {
        if (id && user) {
            fetchInitialData()
        }
    }, [id, user])

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
                adultBudget: 0,
                childBudget: 0,
                totalBudget: 0,
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
            fetchCurrencies()

            // Fetch confirm details if they exist
            let confirmData = null;
            try {
                const confirmPayload = {
                    queryId: parseInt(id),
                    isVisaIncluded: true,
                    finalItinerary: "",
                    miscellaneous: "",
                    spType: "E",
                    userId: 0,
                    roleId: 0,
                    officeCountryId: 0,
                    tourLeads: [],
                    services: [],
                    guides: []
                };
                const confirmRes = await manageConfirmQuery(confirmPayload);
                if (confirmRes.data?.data) {
                    confirmData = confirmRes.data.data;
                }
            } catch (err) {
                console.error("Error fetching confirm query details:", err);
            }

            const mergedData = confirmData ? { ...qData, ...confirmData } : qData;

            // Re-set query with potential extra names
            setQuery(mergedData)

            // 6. Populate existing confirmed data if available
            if (mergedData.tourLeads && mergedData.tourLeads.length > 0) {
                setTourLeads(mergedData.tourLeads.map(tl => ({
                    leadName: tl.leadName || '',
                    gender: tl.gender || '',
                    age: tl.age || '',
                    passportNumber: tl.passportNumber || '',
                    visaStatus: tl.visaStatus || '',
                    contactNumber: tl.contactNumber || ''
                })))
            }

            if (mergedData.services && mergedData.services.length > 0) {
                const grouped = {}
                mergedData.services.forEach(srv => {
                    // Find which destination index this service belongs to
                    const dIdx = mergedData.destinations?.findIndex(d => 
                        d.countryId === srv.countryId && d.cityId === srv.cityId
                    )
                    const destIndex = dIdx !== -1 ? dIdx : 0
                    
                    if (!grouped[destIndex]) grouped[destIndex] = []
                    grouped[destIndex].push({
                        ...srv,
                        serviceCharge: srv.serviceCharge || '',
                        serviceDate: srv.serviceDate ? srv.serviceDate.substring(0, 16) : '',
                        checkInDate: srv.checkInDate ? srv.checkInDate.substring(0, 16) : '',
                        checkOutDate: srv.checkOutDate ? srv.checkOutDate.substring(0, 16) : '',
                        mealType: srv.mealTypes ? srv.mealTypes.join(',') : (srv.mealType || '')
                    })
                })
                setServicesByDest(grouped)
            }

            if (mergedData.guides && mergedData.guides.length > 0) {
                setGuides(mergedData.guides.map(g => ({
                    ...g,
                    supplierId: g.supplierId || '',
                    supplierName: g.supplierName || ''
                })))
            }

            setGeneralInfo({
                isVisaIncluded: !!mergedData.isVisaIncluded,
                finalItinerary: mergedData.finalItinerary || '',
                miscellaneous: mergedData.miscellaneous || ''
            })

            // 5. Fetch Location Names (Countries)
            const locRes = await manageCountry({ spType: "R" })
            if (locRes.data?.data) {
                const map = {}
                locRes.data.data.forEach(c => map[`country_${c.countryId}`] = c.countryName)
                setLocationNames(map)
            }

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
                spType: "R",
                officeCountryId: user?.officeId === 1 ? 0 : (user?.countryId || 0)
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
    const fetchCurrencies = async () => {
        try {
            const res = await manageCurrency({ spType: "R", isActive: true })
            const data = res.data?.data || (Array.isArray(res.data) ? res.data : []) || []
            
            // Map for Select options while preserving raw data for lookup
            const uniqueCurrencies = []
            const cIds = new Set()
            data.forEach(c => {
                if (!cIds.has(c.id)) {
                    cIds.add(c.id)
                    uniqueCurrencies.push({
                        ...c,
                        value: c.id,
                        label: `${c.currencyName} (${c.currencySign})`
                    })
                }
            })
            setCurrencies(uniqueCurrencies)
        } catch (error) {
            console.error("Error fetching currencies:", error)
        }
    }
    
    const getCurrencySign = () => {
        const currency = currencies.find(c => Number(c.id) === Number(query?.currencyId))
        return currency ? currency.currencySign : '$'
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
                spType: "R",
                officeCountryId: user?.officeId === 1 ? 0 : (user?.countryId || 0)
            }
            const res = await manageSupplier(payload)
            const data = res.data?.data || (Array.isArray(res.data) ? res.data : []) || []

            // Filter suppliers by destination and remove duplicates
            const uniqueSuppliers = []
            const sIds = new Set()
            data.forEach(s => {
                // Match by country and optionally city
                const matchesCountry = !countryId || s.countryId === countryId
                const matchesCity = !cityId || !s.cityId || s.cityId === cityId

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
    const totalPax = query ? (query.adults || 0) + (query.children || 0) + (query.infants || 0) : 0

    const addTourLead = () => {
        if (tourLeads.length >= totalPax) {
            toast.error(`Cannot add more than ${totalPax} travellers`)
            return
        }
        setTourLeads([...tourLeads, { leadName: '', gender: '', age: '', passportNumber: '', visaStatus: '', contactNumber: '' }])
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

    const handleImportTravellers = (imported) => {
        const remainingSpace = totalPax - tourLeads.filter(t => t.leadName.trim()).length
        
        if (imported.length > remainingSpace) {
            toast.error(`Cannot import all. Only ${remainingSpace} spots remaining.`)
            // Still import what fits
            imported = imported.slice(0, remainingSpace)
        }

        if (imported.length > 0) {
            // If the first lead is empty, replace it, otherwise append
            const currentLeads = [...tourLeads]
            const firstEmptyIndex = currentLeads.findIndex(t => !t.leadName.trim())
            
            if (firstEmptyIndex !== -1) {
                // Replace the first empty one and append rest
                currentLeads[firstEmptyIndex] = imported[0]
                setTourLeads([...currentLeads, ...imported.slice(1)])
            } else {
                setTourLeads([...currentLeads, ...imported])
            }
            
            toast.success(`Imported ${imported.length} travellers`)
        }
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
                            countryId: parseInt(dest.countryId) || 0,
                            cityId: parseInt(dest.cityId) || 0,
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
                miscellaneous: generalInfo.miscellaneous || "",
                spType: "C",
                userId: parseInt(localStorage.getItem('userId')) || 0,
                roleId: parseInt(localStorage.getItem('roleId')) || 0,
                tourLeads: tourLeads.filter(tl => tl.leadName).map(tl => ({
                    leadName: tl.leadName || "",
                    gender: tl.gender || "",
                    age: parseInt(tl.age) || 0,
                    passportNumber: tl.passportNumber || "",
                    visaStatus: tl.visaStatus || "",
                    contactNumber: tl.contactNumber || ""
                })),
                services: flatServices.filter(s => s.serviceType && s.supplierId).map(s => {
                    const { mealType, ...rest } = s;
                    return {
                        ...rest,
                        mealTypes: mealType ? mealType.split(',').map(m => m.trim()).filter(Boolean) : []
                    };
                }),
                guides: guides.filter(g => g.supplierId).map(g => ({
                    supplierId: parseInt(g.supplierId) || 0,
                    supplierName: g.supplierName || "",
                    guideName: g.guideName || "",
                    gender: g.gender || "",
                    contactNumber: g.contactNumber || "",
                    language: g.language || ""
                }))
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
        <div className="pb-10 max-w-7xl mx-auto">
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
                                    <dt className="text-sm text-secondary-600">Company</dt>
                                    <dd className="font-medium text-lg">{client.companyName || '-'}</dd>
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
                                    {formatDate(query.travelDate)} - {formatDate(query.returnDate)}
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
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border mt-2 bg-primary-50/30 p-3 pb-0 rounded-lg">
                                <div>
                                    <dt className="text-sm text-secondary-600 uppercase font-bold tracking-wider">Adult Budget</dt>
                                    <dd className="text-lg font-semibold">{getCurrencySign()}{query.adultBudget?.toLocaleString() || 0}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-secondary-600 uppercase font-bold tracking-wider">Child Budget</dt>
                                    <dd className="text-lg font-semibold">{getCurrencySign()}{query.childBudget?.toLocaleString() || 0}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-primary-700 uppercase font-black tracking-wider">Total Budget</dt>
                                    <dd className="text-2xl font-black text-primary-900 font-mono">{getCurrencySign()}{query.totalBudget?.toLocaleString() || 0}</dd>
                                </div>
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
                        <h3 className="text-lg font-semibold">
                            Tour Leads / Travellers
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({tourLeads.length} / {totalPax})
                            </span>
                        </h3>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setIsImportModalOpen(true)} 
                                disabled={totalPax === 0 || tourLeads.filter(t => t.leadName.trim()).length >= totalPax}
                            >
                                <Import size={16} className="mr-1" /> Import
                            </Button>
                            <Button size="sm" onClick={addTourLead} disabled={tourLeads.length >= totalPax}>+ Add Lead</Button>
                        </div>
                    </div>
                    {tourLeads.map((lead, idx) => (
                        <div key={idx} className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-4 group">
                            {tourLeads.length > 1 && (
                                <button
                                    onClick={() => removeTourLead(idx)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    title="Remove Traveller"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                    Traveller {idx + 1}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                <div className="col-span-12 md:col-span-8">
                                    <Input
                                        label="Full Name"
                                        placeholder="Full Name as per Passport"
                                        value={lead.leadName}
                                        onChange={e => updateTourLead(idx, 'leadName', e.target.value)}
                                        className="uppercase"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <Input
                                        label="Passport Number"
                                        placeholder="Enter Passport Number"
                                        value={lead.passportNumber}
                                        onChange={e => updateTourLead(idx, 'passportNumber', e.target.value)}
                                        className="uppercase"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <Select
                                        label="Visa Status"
                                        value={lead.visaStatus}
                                        onChange={e => updateTourLead(idx, 'visaStatus', e.target.value)}
                                        options={[
                                            { value: 'Approved', label: 'Approved' },
                                            { value: 'Pending', label: 'Pending' }
                                        ]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <Select
                                        label="Gender"
                                        value={lead.gender}
                                        onChange={e => updateTourLead(idx, 'gender', e.target.value)}
                                        options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <Input
                                        type="number"
                                        label="Age"
                                        value={lead.age}
                                        onChange={e => updateTourLead(idx, 'age', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <Input
                                        label="Contact Number"
                                        placeholder="Enter Contact Number"
                                        value={lead.contactNumber}
                                        onChange={e => updateTourLead(idx, 'contactNumber', e.target.value)}
                                    />
                                </div>
                            </div>
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
                                                    { value: 'Hotel', label: 'Hotel' },
                                                    { value: 'Meal', label: 'Meal' },
                                                    { value: 'Sightseeing', label: 'Sightseeing' },
                                                    { value: 'Others', label: 'Others' }
                                                ]}
                                            />
                                            <Select label="Supplier" value={srv.supplierId}
                                                onChange={e => updateService(dIdx, sIdx, 'supplierId', e.target.value)}
                                                options={(suppliersByDest[dIdx] && suppliersByDest[dIdx].length > 0) ? suppliersByDest[dIdx] : suppliers}
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
                                            {srv.serviceType === 'Hotel' && (
                                                <>
                                                    <Input type="datetime-local" label="Check-In" value={srv.checkInDate} onChange={e => updateService(dIdx, sIdx, 'checkInDate', e.target.value)} />
                                                    <Input type="datetime-local" label="Check-Out" value={srv.checkOutDate} onChange={e => updateService(dIdx, sIdx, 'checkOutDate', e.target.value)} />
                                                </>
                                            )}
                                            {srv.serviceType === 'Meal' && (
                                                <>
                                                    <Input type="datetime-local" label="Date" value={srv.serviceDate} onChange={e => updateService(dIdx, sIdx, 'serviceDate', e.target.value)} />
                                                    <div className="flex flex-col gap-1 md:col-span-2">
                                                        <label className="block text-sm font-medium text-secondary-700">Meal Types</label>
                                                        <div className="flex flex-wrap items-center gap-4 mt-2">
                                                            {[
                                                                { id: 'BF', label: 'Breakfast' },
                                                                { id: 'LN', label: 'Lunch' },
                                                                { id: 'DN', label: 'Dinner' },
                                                                { id: 'HT', label: 'Hi-Tea' }
                                                            ].map(meal => {
                                                                const isChecked = (srv.mealType || '').includes(meal.id);
                                                                return (
                                                                    <label key={meal.id} className="flex items-center gap-1.5 text-sm cursor-pointer text-secondary-700 hover:text-primary-600 transition-colors">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={isChecked}
                                                                            onChange={(e) => {
                                                                                let currentMeals = (srv.mealType || '').split(',').map(m => m.trim()).filter(Boolean);
                                                                                if (e.target.checked) {
                                                                                    if (!currentMeals.includes(meal.id)) currentMeals.push(meal.id);
                                                                                } else {
                                                                                    currentMeals = currentMeals.filter(m => m !== meal.id);
                                                                                }
                                                                                updateService(dIdx, sIdx, 'mealType', currentMeals.join(','));
                                                                            }}
                                                                            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                                                                        />
                                                                        {meal.label}
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {(srv.serviceType === 'Sightseeing' || srv.serviceType === 'Others') && (
                                                <>
                                                    <Input type="datetime-local" label="Date" value={srv.serviceDate} onChange={e => updateService(dIdx, sIdx, 'serviceDate', e.target.value)} />
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
                <ImportTravellerModal 
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImportTravellers}
                    clientContacts={client?.contacts || []}
                    maxAllowed={totalPax - tourLeads.filter(t => t.leadName.trim()).length}
                />
            </div>
        </div>
    )
}

export default ConfirmQuery 
