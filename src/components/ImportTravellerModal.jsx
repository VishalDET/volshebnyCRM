import React, { useState, useRef } from 'react'
import Modal from './Modal'
import Button from './Button'
import { Users, FileText, CheckCircle2, UserPlus, Upload, ShieldCheck, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

const ImportTravellerModal = ({ isOpen, onClose, onImport, clientContacts = [], maxAllowed = 100 }) => {
    const [activeTab, setActiveTab] = useState('contacts')
    const [selectedContactIds, setSelectedContactIds] = useState([])
    const [bulkText, setBulkText] = useState('')
    const [fileData, setFileData] = useState([])
    const [fileName, setFileName] = useState('')
    const fileInputRef = useRef(null)

    const handleToggleContact = (id) => {
        setSelectedContactIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)

            // Normalize data
            const normalized = data.map(row => {
                // Try to find common header names
                const findVal = (keys) => {
                    const key = Object.keys(row).find(k => keys.some(s => k.toLowerCase().includes(s.toLowerCase())))
                    return key ? row[key] : ''
                }

                return {
                    leadName: findVal(['name', 'full name', 'traveller', 'passenger']),
                    passportNumber: findVal(['passport', 'pp', 'passport number']),
                    gender: findVal(['gender', 'sex']),
                    age: findVal(['age']),
                    visaStatus: 'Pending'
                }
            }).filter(t => t.leadName) // Only include rows with a name

            setFileData(normalized)
        }
        reader.readAsBinaryString(file)
    }

    const handleImport = () => {
        let travellers = []

        if (activeTab === 'contacts') {
            travellers = clientContacts
                .filter(c => selectedContactIds.includes(c.contactId))
                .map(c => ({
                    leadName: c.contactName || '',
                    gender: '',
                    age: '',
                    passportNumber: '',
                    visaStatus: 'Pending'
                }))
        } else if (activeTab === 'bulk') {
            const names = bulkText.split('\n')
                .map(n => n.trim())
                .filter(n => n.length > 0)

            travellers = names.map(name => ({
                leadName: name,
                gender: '',
                age: '',
                passportNumber: '',
                visaStatus: 'Pending'
            }))
        } else {
            travellers = fileData
        }

        if (travellers.length > 0) {
            onImport(travellers)
            // Reset and close
            setSelectedContactIds([])
            setBulkText('')
            setFileData([])
            setFileName('')
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Travellers"
            size="lg"
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                    <button
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'contacts'
                            ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('contacts')}
                    >
                        <Users size={16} />
                        Client Contacts
                    </button>
                    {/* <button
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'bulk'
                                ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('bulk')}
                    >
                        <FileText size={16} />
                        Bulk Addition
                    </button> */}
                    <button
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'file'
                            ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveTab('file')}
                    >
                        <Upload size={16} />
                        CSV / Excel
                    </button>
                </div>

                <div className="min-h-[300px]">
                    {activeTab === 'contacts' && (
                        <div className="space-y-4">
                            <p className="text-sm text-secondary-500">
                                Select contacts from the client profile to import as travellers.
                            </p>

                            {clientContacts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 pb-2">
                                    {clientContacts.map(contact => (
                                        <div
                                            key={contact.contactId}
                                            onClick={() => handleToggleContact(contact.contactId)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedContactIds.includes(contact.contactId)
                                                ? 'border-primary-600 bg-primary-50 shadow-sm'
                                                : 'border-gray-100 bg-white hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedContactIds.includes(contact.contactId)
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <h5 className={`font-bold text-sm ${selectedContactIds.includes(contact.contactId)
                                                        ? 'text-primary-900'
                                                        : 'text-secondary-900'
                                                        }`}>
                                                        {contact.contactName}
                                                    </h5>
                                                    <p className="text-xs text-secondary-500">{contact.contactNumber || 'No number'}</p>
                                                </div>
                                            </div>
                                            {selectedContactIds.includes(contact.contactId) && (
                                                <CheckCircle2 size={20} className="text-primary-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 text-secondary-300">
                                        <Users size={32} />
                                    </div>
                                    <p className="text-secondary-600 font-medium">No contacts found for this client</p>
                                    <p className="text-xs text-secondary-400 mt-1">Add contacts in the Client Master first</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'bulk' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-sm font-bold text-secondary-900">Paste List of Names</h4>
                                    <p className="text-xs text-secondary-500 mt-1">
                                        Enter names separated by new lines (one traveller per line).
                                    </p>
                                </div>
                                <div className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100 uppercase tracking-wider">
                                    Fast Entry Mode
                                </div>
                            </div>

                            <textarea
                                className="input w-full mt-2 h-64 font-mono text-sm leading-relaxed focus:ring-primary-500 border-gray-200"
                                placeholder={`Example:\nJohn Doe\nJane Smith\nRobert Brown`}
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                            ></textarea>

                            <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 text-blue-800">
                                <UserPlus size={16} className="shrink-0" />
                                <p className="text-[11px] font-medium leading-tight">
                                    Names will be automatically formatted to uppercase in the form.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'file' && (
                        <div className="space-y-5">
                            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex gap-4 items-start">
                                <div className="p-2 bg-white rounded-lg text-primary-600 shadow-sm">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-primary-900">Recommended File Structure</h4>
                                    <p className="text-xs text-primary-700 mt-0.5 leading-relaxed">
                                        Use headers like <span className="font-bold">Name</span>, <span className="font-bold">Passport</span>, <span className="font-bold">Age</span>, and <span className="font-bold">Gender</span> for best results.
                                    </p>
                                </div>
                            </div>

                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${fileName ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".csv, .xlsx, .xls"
                                />
                                <div className={`p-4 rounded-full shadow-sm mb-4 transition-all ${fileName ? 'bg-primary-600 text-white' : 'bg-gray-100 text-secondary-300 group-hover:scale-110'
                                    }`}>
                                    <Upload size={32} />
                                </div>
                                <h5 className="font-bold text-secondary-900">
                                    {fileName || 'Drop files here or click to upload'}
                                </h5>
                                <p className="text-xs text-secondary-500 mt-1">Supports .XLSX, .XLS, and .CSV formats</p>

                                {fileData.length > 0 && (
                                    <div className="mt-4 flex items-center gap-2 text-primary-600 font-bold text-sm bg-white px-4 py-1.5 rounded-full shadow-sm border border-primary-100">
                                        <CheckCircle2 size={16} />
                                        {fileData.length} Travellers Detected
                                    </div>
                                )}
                            </div>

                            {fileName && fileData.length === 0 && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-xs font-medium">
                                    <AlertCircle size={16} />
                                    No traveller names detected. Ensure your file has a 'Name' header.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={
                            (activeTab === 'contacts' && selectedContactIds.length === 0) ||
                            (activeTab === 'bulk' && !bulkText.trim()) ||
                            (activeTab === 'file' && fileData.length === 0)
                        }
                    >
                        {activeTab === 'contacts'
                            ? `Import Selected (${selectedContactIds.length})`
                            : activeTab === 'bulk'
                                ? 'Import List'
                                : `Import from File (${fileData.length})`
                        }
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ImportTravellerModal
