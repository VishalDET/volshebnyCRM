import { useState, useEffect } from 'react'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'
import { manageUser } from '@api/userRole.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const EditProfileModal = ({ isOpen, onClose, user, onUpdateSuccess }) => {
    const { login } = useAuth() // using login to refresh user data if needed? Or we might need a distinct refreshUser method in context.
    // For now we will rely on onUpdateSuccess to trigger parent refresh or just optimistic UI.

    // We'll separate name into first and last name if possible, or just use firstName field for full name if that's how it's stored.
    // The API expects firstName and lastName. But the current user object seems to have `name`.
    // I will try to split `name` or just use it as firstName.

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNo: '',
        companyName: '',
        emailId: '',
        address: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            const nameParts = (user.name || '').split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            setFormData({
                firstName: firstName,
                lastName: lastName,
                mobileNo: user.mobileNo || '', // assuming user object in context might have these fields if fetched from similar API, otherwise they'll be empty
                companyName: user.companyName || '',
                emailId: user.email || '',
                address: user.address || ''
            })
        }
    }, [user, isOpen])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                id: user.uid || user.id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobileNo: formData.mobileNo,
                companyName: formData.companyName,
                emailId: formData.emailId,
                address: formData.address,

                modifiedBy: user.uid || user.id,
                isActive: true,
                spType: "UPDATE"
                // Other fields handled by defaultUserPayload in API
            }

            await manageUser(payload)
            toast.success('Profile updated successfully')
            onUpdateSuccess && onUpdateSuccess()
            onClose()
        } catch (error) {
            console.error('Update failed:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Profile"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    label="Email Address"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    disabled // usually email is immutable or requires verification
                    className="bg-gray-100 cursor-not-allowed"
                />

                <Input
                    label="Mobile No"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                />

                <Input
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                />

                <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                />

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default EditProfileModal
