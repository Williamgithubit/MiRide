import React from "react";
import { Helmet } from "react-helmet";
import Hero from "../components/Home/Hero";
import VehicleFleet from "../components/Home/VehicleFleet";
import Testimonials from "../components/Home/Testimonials";
import Statistics from "../components/Home/Statistics";
import LatestNews from "../components/Home/LatestNews";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        <meta name="theme-color" content="#059669" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Helmet>
      <div className="min-h-screen bg-gray-100">
        <Hero />
        <VehicleFleet />
        <Testimonials />
        <Statistics />
        <LatestNews />
        <Footer />
      </div>
    </>
  );
};

export default Home;
