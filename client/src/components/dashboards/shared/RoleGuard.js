import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import useReduxAuth from "../../../store/hooks/useReduxAuth";
/**
 * A component that conditionally renders its children based on the user's role.
 * If the user's role is not in the allowedRoles array, it renders the fallback component.
 */
const RoleGuard = ({ allowedRoles, children, fallback = (_jsx("div", { className: "p-4 bg-red-100 text-red-700 rounded-md", children: "You don't have permission to view this content." })), }) => {
    const { user } = useReduxAuth();
    if (!user || !user.role) {
        return _jsx(_Fragment, { children: fallback });
    }
    if (allowedRoles.includes(user.role)) {
        return _jsx(_Fragment, { children: children });
    }
    return _jsx(_Fragment, { children: fallback });
};
export default RoleGuard;
