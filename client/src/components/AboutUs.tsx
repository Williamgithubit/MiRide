import React from "react";
import Header from "./Header";

const AboutUs: React.FC = () => {
  return (
    <>
      <Header />
      <section className="py-16 px-4 md:px-10 lg:px-32 bg-gray-50 mt-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          About MiRide
        </h2>
        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-10">
          MiRide is your trusted companion for affordable and reliable
          transportation. We offer a fleet of modern, well-maintained vehicles
          to meet your travel needs—whether for personal, business, or leisure.
        </p>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h4 className="text-xl font-semibold text-primary-500 mb-2">
              10+ Years Experience
            </h4>
            <p className="text-gray-600">
              A decade of trustworthy service and customer satisfaction.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-primary-500 mb-2">
              Flexible Plans
            </h4>
            <p className="text-gray-600">
              Rent by day, week, or month — whatever works for you.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-primary-500 mb-2">
              Trusted Fleet
            </h4>
            <p className="text-gray-600">
              Our vehicles are safe, clean, and ready for the road.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
