import React from "react";
import useReduxAuth from "../../../store/hooks/useReduxAuth";

interface RoleGuardProps {
  allowedRoles: Array<"customer" | "owner" | "admin">;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on the user's role.
 * If the user's role is not in the allowedRoles array, it renders the fallback component.
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = (
    <div className="p-4 bg-red-100 text-red-700 rounded-md">
      You don't have permission to view this content.
    </div>
  ),
}) => {
  const { user } = useReduxAuth();

  if (!user || !user.role) {
    return <>{fallback}</>;
  }

  if (allowedRoles.includes(user.role as any)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default RoleGuard;
