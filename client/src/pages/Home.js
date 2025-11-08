import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Helmet } from "react-helmet";
import Hero from "../components/Home/Hero";
import VehicleFleet from "../components/Home/VehicleFleet";
import Testimonials from "../components/Home/Testimonials";
import Statistics from "../components/Home/Statistics";
import LatestNews from "../components/Home/LatestNews";
import Footer from "../components/Footer";
const Home = () => {
    return (_jsxs(_Fragment, { children: [_jsxs(Helmet, { children: [_jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" }), _jsx("meta", { name: "theme-color", content: "#059669" }), _jsx("meta", { name: "mobile-web-app-capable", content: "yes" }), _jsx("meta", { name: "apple-mobile-web-app-capable", content: "yes" }), _jsx("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" })] }), _jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx(Hero, {}), _jsx(VehicleFleet, {}), _jsx(Testimonials, {}), _jsx(Statistics, {}), _jsx(LatestNews, {}), _jsx(Footer, {})] })] }));
};
export default Home;
