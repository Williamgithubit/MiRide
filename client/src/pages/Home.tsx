import React from "react";
import { Helmet } from "react-helmet";
import Hero from "../components/Home/Hero";
import SpecialOffers from "../components/Home/SpecialOffers";
import PaymentMethods from "../components/Home/PaymentMethods";
import Testimonials from "../components/Home/Testimonials";
import Statistics from "../components/Home/Statistics";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>MiRide Liberia - Premium Car Rentals | Book Your Perfect Ride</title>
        <meta
          name="description"
          content="Rent premium cars across Liberia at unbeatable prices. Choose from luxury sedans, SUVs, and sports cars. Pay with card or mobile money (Orange, Lonestar). Free cancellation, 24/7 support."
        />
        <meta
          name="keywords"
          content="car rental Liberia, Monrovia car rental, premium cars Liberia, luxury car rental, SUV rental, MiRide Liberia, Orange Money, Lonestar MTN"
        />
        
        {/* Viewport and Mobile */}
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
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="MiRide Liberia - Premium Car Rentals" />
        <meta
          property="og:description"
          content="Your journey across Liberia starts here. Premium cars, unbeatable prices. Pay with card or mobile money. Book now!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://miride.com" />
        <meta property="og:image" content="https://miride.com/og-image.jpg" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MiRide Liberia - Premium Car Rentals" />
        <meta
          name="twitter:description"
          content="Your journey across Liberia starts here. Premium cars, unbeatable prices."
        />
        <meta name="twitter:image" content="https://miride.com/twitter-image.jpg" />
      </Helmet>
      <div className="min-h-screen bg-gray-100">
        <Hero />
        <SpecialOffers />
        <PaymentMethods />
        <Testimonials />
        <Statistics />
        <Footer />
      </div>
    </>
  );
};

export default Home;
