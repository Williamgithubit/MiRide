// client/src/components/RoleTest.tsx
import React from "react";
import useReduxAuth from "../store/hooks/useReduxAuth";
import { FaCar, FaUsers, FaChartBar } from "react-icons/fa";

const RoleTest: React.FC = () => {
  const { user, logout } = useReduxAuth();

  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner";
  const isCustomer = user?.role === "customer";

  const renderRoleContent = () => {
    if (!user) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Please login to see your role
          </h2>
          <p className="text-gray-600">
            You can login as a customer, owner, or admin
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Hello, {user.name}</h2>
          <p className="text-gray-600">Your role is: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Customer Features */}
          {isCustomer && (
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <FaCar className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Customer Features</h3>
              <ul className="space-y-2">
                <li className="text-gray-600">Browse and rent cars</li>
                <li className="text-gray-600">Write reviews</li>
                <li className="text-gray-600">Like cars</li>
                <li className="text-gray-600">View your rentals</li>
              </ul>
            </div>
          )}

          {/* Owner Features */}
          {isOwner && (
            <div className="bg-green-50 p-6 rounded-lg shadow">
              <FaCar className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Owner Features</h3>
              <ul className="space-y-2">
                <li className="text-gray-600">List your cars</li>
                <li className="text-gray-600">Manage your listings</li>
                <li className="text-gray-600">View rental history</li>
              </ul>
            </div>
          )}

          {/* Admin Features */}
          {isAdmin && (
            <div className="bg-red-50 p-6 rounded-lg shadow">
              <FaUsers className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Features</h3>
              <ul className="space-y-2">
                <li className="text-gray-600">Manage all users</li>
                <li className="text-gray-600">View statistics</li>
                <li className="text-gray-600">Manage rentals</li>
              </ul>
            </div>
          )}

          {/* Common Features */}
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <FaChartBar className="w-8 h-8 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Common Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">View car listings</li>
              <li className="text-gray-600">Search cars</li>
            </ul>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">{renderRoleContent()}</div>
  );
};

export default RoleTest;
