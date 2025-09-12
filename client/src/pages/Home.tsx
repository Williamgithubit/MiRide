import React from "react";
import { Helmet } from "react-helmet";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import DriverSection from "../components/Home/DriverSection";
import SafetySection from "../components/Home/SafetySection";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        <meta name="theme-color" content="#104911" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Helmet>
      <div className="min-h-screen bg-gray-100">
        <Hero />
        <Features />
        <DriverSection />
        <SafetySection />
        <Footer />
      </div>
    </>
  );
};

export default Home;
