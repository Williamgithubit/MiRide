import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useUpdateUserMutation } from "../../../../store/User/userManagementApi";
import type {
  User,
  UpdateUserData,
} from "../../../../store/User/userManagementApi";

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onUpdate,
}) => {
  // Form states
  const [formData, setFormData] = useState<UpdateUserData>({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    isActive: true,
  });

  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email update states
  const [showEmailUpdate, setShowEmailUpdate] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Message states
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });
  const [loading, setLoading] = useState(false);

  // API mutation
  const [updateUser] = useUpdateUserMutation();

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "customer",
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
      setNewEmail(user.email || "");
    }
  }, [user]);

  if (!user) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword.trim()) {
      setMessage({ type: "error", text: "New password cannot be empty" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      // Call backend to reset password
      const response = await fetch(
        `/api/admin/users/${user.id}/reset-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (response.ok) {
        setMessage({ type: "success", text: "Password reset successfully" });
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordReset(false);
        toast.success("Password reset successfully");
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.message || "Failed to reset password",
        });
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage({ type: "error", text: "Error resetting password" });
      toast.error("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    // Validate email
    if (!newEmail.trim()) {
      setMessage({ type: "error", text: "New email cannot be empty" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setMessage({ type: "error", text: "Invalid email format" });
      return;
    }

    if (newEmail === user.email) {
      setMessage({
        type: "error",
        text: "New email must be different from current email",
      });
      return;
    }

    setLoading(true);
    try {
      // Call backend to update email
      const response = await fetch(`/api/admin/users/${user.id}/update-email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: "success", text: "Email updated successfully" });
        setFormData((prev) => ({ ...prev, email: newEmail }));
        setShowEmailUpdate(false);
        toast.success("Email updated successfully");
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.message || "Failed to update email",
        });
        toast.error(data.message || "Failed to update email");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      setMessage({ type: "error", text: "Error updating email" });
      toast.error("Error updating email");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateUser({
        userId: user.id,
        data: formData,
      }).unwrap();

      setMessage({ type: "success", text: "User updated successfully" });
      toast.success("User updated successfully");
      setTimeout(() => {
        onUpdate(result);
      }, 1500);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to update user";
      setMessage({ type: "error", text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Edit User</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-800 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Message Alert */}
          {message.text && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-900/20 border border-green-600 text-green-400"
                  : "bg-red-900/20 border border-red-600 text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded"></span>
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
                />
              </div>
            </div>
          </div>

          {/* Email Section with Update Toggle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Mail size={20} className="text-green-600" />
              Email Address
            </h3>

            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
              <p className="text-gray-300">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowEmailUpdate(!showEmailUpdate);
                setMessage({ type: "", text: "" });
              }}
              className="flex items-center justify-between w-full bg-blue-900/20 hover:bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3 text-blue-300 transition group"
            >
              <span className="font-medium">Change Email Address</span>
              <ChevronDown
                size={18}
                className={`transition-transform group-hover:text-blue-200 ${
                  showEmailUpdate ? "rotate-180" : ""
                }`}
              />
            </button>

            {showEmailUpdate && (
              <div className="bg-blue-900/10 border border-blue-700 rounded-lg p-4 space-y-4">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
                />
                <p className="text-xs text-gray-400">
                  An email change will mark the address as unverified
                </p>
                <button
                  onClick={handleUpdateEmail}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg py-2 transition"
                >
                  {loading ? "Updating..." : "Update Email"}
                </button>
              </div>
            )}
          </div>

          {/* Account Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Account Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role || "customer"}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-600 transition"
                >
                  <option value="customer">Customer</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded bg-gray-800 border border-gray-700 accent-green-600"
                  />
                  <span className="text-white font-medium">Active User</span>
                </label>
              </div>
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="space-y-4 border-t border-gray-700 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowPasswordReset(!showPasswordReset);
                setMessage({ type: "", text: "" });
              }}
              className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg px-4 py-3 text-white transition group"
            >
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-yellow-500" />
                <span className="font-medium">Reset Password</span>
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform group-hover:text-gray-300 ${
                  showPasswordReset ? "rotate-180" : ""
                }`}
              />
            </button>

            {showPasswordReset && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
                <p className="text-sm text-gray-400">
                  Set a new password for this user. They will be able to log in
                  with the new password.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-600 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-600 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg py-2 transition"
                >
                  {loading ? "Resetting..." : "Set New Password"}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg py-2.5 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg py-2.5 transition"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
