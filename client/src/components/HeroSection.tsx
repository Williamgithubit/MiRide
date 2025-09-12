import React from "react";
import { Link } from "react-router-dom";
import { FaCar, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import heroImage from "../assets/blue-car-driving-road.jpg";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gray-100 py-16 px-4 sm:px-8 md:px-16 lg:px-24 mt-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Text Section */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-500">MiRide</span>
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Affordable, reliable, and flexible car rental service for your
            personal and business needs. Whether you're traveling around town or
            heading to the countryside, MiRide has the perfect ride for you.
          </p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-center text-gray-800">
              <FaCar className="text-blue-600 mr-2" /> Wide range of vehicles to
              choose from
            </li>
            <li className="flex items-center text-gray-800">
              <FaCalendarAlt className="text-blue-600 mr-2" /> Book by the day,
              week or month
            </li>
            <li className="flex items-center text-gray-800">
              <FaMapMarkerAlt className="text-blue-600 mr-2" /> Pickup from
              multiple locations
            </li>
          </ul>
          <Link
            to="/cars"
            className="inline-block px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-full hover:bg-blue-700 transition duration-300"
          >
            Browse Cars
          </Link>
        </div>

        {/* Image Section */}
        <div className="flex justify-center">
          <img
            src={heroImage}
            alt="Car rental"
            className="rounded-2xl shadow-lg w-full max-w-md"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
