import { jsx as _jsx } from "react/jsx-runtime";
function Badge({ className = "", variant = "default", ...props }) {
    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    const variantClasses = {
        default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    };
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();
    return (_jsx("div", { className: classes, ...props }));
}
export { Badge };
