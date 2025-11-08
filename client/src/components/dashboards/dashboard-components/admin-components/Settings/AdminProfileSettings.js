import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAdminProfile } from '../../../../../store/Admin/adminSettingsSlice';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
const AdminProfileSettings = ({ profile }) => {
    const dispatch = useDispatch();
    const { isSaving } = useSelector((state) => state.adminSettings);
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        profilePicture: profile?.profilePicture || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const fileInputRef = useRef(null);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleProfilePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    profilePicture: event.target?.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSaveProfile = async () => {
        try {
            await dispatch(updateAdminProfile(formData)).unwrap();
            setIsEditingProfile(false);
        }
        catch (error) {
            console.error('Failed to update profile:', error);
        }
    };
    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        try {
            // Cast to any because AdminProfile does not include password fields.
            // Prefer adding a dedicated updateAdminPassword thunk in the slice instead.
            await dispatch(updateAdminProfile({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            })).unwrap();
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setIsChangingPassword(false);
        }
        catch (error) {
            console.error('Failed to change password:', error);
        }
    };
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    };
    return (_jsxs("div", { className: "space-y-6 sm:space-y-8", children: [_jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [_jsx(FaUser, { className: "text-blue-600" }), "Profile Information"] }), _jsx("button", { onClick: () => setIsEditingProfile(!isEditingProfile), className: "px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors", children: isEditingProfile ? 'Cancel' : 'Edit Profile' })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6", children: [_jsxs("div", { className: "flex flex-col items-center space-y-4 lg:col-span-1", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center", children: formData.profilePicture ? (_jsx("img", { src: formData.profilePicture, alt: "Profile", className: "w-full h-full object-cover" })) : (_jsx(FaUser, { className: "w-6 h-6 sm:w-8 sm:h-8 text-gray-400" })) }), isEditingProfile && (_jsx("button", { onClick: () => fileInputRef.current?.click(), className: "absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors", children: _jsx(FaCamera, { className: "w-2.5 h-2.5 sm:w-3 sm:h-3" }) }))] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleProfilePictureChange, className: "hidden" }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: profile?.name || 'Admin User' }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: profile?.role || 'Administrator' })] })] }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(FaUser, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleInputChange, disabled: !isEditingProfile, className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(FaEnvelope, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleInputChange, disabled: !isEditingProfile, className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Phone Number" }), _jsxs("div", { className: "relative", children: [_jsx(FaPhone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleInputChange, disabled: !isEditingProfile, placeholder: "Enter phone number", className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" })] })] })] }), isEditingProfile && (_jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4", children: [_jsx("button", { onClick: handleSaveProfile, disabled: isSaving, className: "w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Saving..."] })) : ('Save Changes') }), _jsx("button", { onClick: () => {
                                                    setIsEditingProfile(false);
                                                    setFormData({
                                                        name: profile?.name || '',
                                                        email: profile?.email || '',
                                                        phone: profile?.phone || '',
                                                        profilePicture: profile?.profilePicture || '',
                                                    });
                                                }, className: "w-full sm:w-auto px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors", children: "Cancel" })] }))] })] })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [_jsx(FaLock, { className: "text-blue-600" }), "Change Password"] }), _jsx("button", { onClick: () => setIsChangingPassword(!isChangingPassword), className: "px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors", children: isChangingPassword ? 'Cancel' : 'Change Password' })] }), isChangingPassword && (_jsxs("div", { className: "space-y-4 max-w-md", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Current Password" }), _jsxs("div", { className: "relative", children: [_jsx(FaLock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: showPasswords.current ? 'text' : 'password', name: "currentPassword", value: passwordData.currentPassword, onChange: handlePasswordChange, className: "w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" }), _jsx("button", { type: "button", onClick: () => togglePasswordVisibility('current'), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: showPasswords.current ? _jsx(FaEyeSlash, { className: "w-4 h-4" }) : _jsx(FaEye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "New Password" }), _jsxs("div", { className: "relative", children: [_jsx(FaLock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: showPasswords.new ? 'text' : 'password', name: "newPassword", value: passwordData.newPassword, onChange: handlePasswordChange, className: "w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" }), _jsx("button", { type: "button", onClick: () => togglePasswordVisibility('new'), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: showPasswords.new ? _jsx(FaEyeSlash, { className: "w-4 h-4" }) : _jsx(FaEye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Confirm New Password" }), _jsxs("div", { className: "relative", children: [_jsx(FaLock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: showPasswords.confirm ? 'text' : 'password', name: "confirmPassword", value: passwordData.confirmPassword, onChange: handlePasswordChange, className: "w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" }), _jsx("button", { type: "button", onClick: () => togglePasswordVisibility('confirm'), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: showPasswords.confirm ? _jsx(FaEyeSlash, { className: "w-4 h-4" }) : _jsx(FaEye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4", children: [_jsx("button", { onClick: handleChangePassword, disabled: isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword, className: "w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2", children: isSaving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), "Changing..."] })) : ('Change Password') }), _jsx("button", { onClick: () => {
                                            setIsChangingPassword(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: '',
                                            });
                                        }, className: "w-full sm:w-auto px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors", children: "Cancel" })] })] })), !isChangingPassword && (_jsx("p", { className: "text-gray-600 dark:text-gray-400 text-sm", children: "Click \"Change Password\" to update your account password. Make sure to use a strong password with at least 8 characters." }))] })] }));
};
export default AdminProfileSettings;
