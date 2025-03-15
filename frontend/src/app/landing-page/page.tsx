import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-navy-blue text-[#395891] py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-2xl font-bold">DefenseDrone Tech</div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#features" className="hover:text-gray-300">Features</a></li>
              <li><a href="#about" className="hover:text-gray-300">About</a></li>
              <li><a href="#contact" className="hover:text-gray-300">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-navy-blue to-blue-900 text-[#3257a7] py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-8">
              Advanced Drone Detection Technology
            </h1>
            <p className="text-xl mb-12 max-w-3xl mx-auto">
              Harness the power of cutting-edge computer vision to detect and analyze drones in real-time. Our state-of-the-art technology brings unparalleled object detection capabilities to defense and security operations.
            </p>
            <div className="flex justify-center space-x-4">
              {/* Connect a Drone Button */}
              <Link href="/drone" passHref>
                <button className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out">
                  Connect a Drone
                </button>
              </Link>

              {/* Continue with Local Camera Button */}
              <Link href="/combo" passHref>
                <button className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out">
                  Continue with Local Camera
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-300">Key Features</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Real-time Detection', description: 'Instantly identify and track drones in your airspace.' },
                { title: 'High Accuracy', description: 'Advanced AI ensures precise detection and classification.' },
                { title: 'Easy Integration', description: 'Seamlessly integrate with existing defense systems.' },
                { title: 'Long-range Capability', description: 'Detect drones at extended distances for early warning.' },
                { title: 'Multi-drone Tracking', description: 'Simultaneously track multiple drones in complex scenarios.' },
                { title: 'Secure Data Handling', description: 'End-to-end encryption for all detection data.' }
              ].map((feature: { title: string; description: string }) => (
                <div key={feature.title} className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 hover:border-yellow-300 transition duration-300">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-yellow-300">About Us</h2>
            <p className="text-lg text-center max-w-3xl mx-auto text-gray-200">
              DefenseDrone Tech is at the forefront of drone detection technology. Our mission is to provide advanced, reliable, and user-friendly solutions for defense and security operations worldwide.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-yellow-300">Contact Us</h2>
            <div className="max-w-md mx-auto">
              <form className="space-y-4">
                <input type="text" placeholder="Name" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400" />
                <input type="email" placeholder="Email" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400" />
                <textarea placeholder="Message" rows={4} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400"></textarea>
                <button type="submit" className="w-full bg-yellow-500 text-gray-900 py-2 rounded-md hover:bg-yellow-400 transition duration-300 ease-in-out font-semibold">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">DefenseDrone Tech</h3>
              <p>Advanced drone detection solutions for a safer world.</p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-blue-300">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-blue-300">
                    About
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-blue-300">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-300">
                  LinkedIn
                </a>
                <a href="#" className="hover:text-blue-300">
                  Twitter
                </a>
                <a href="#" className="hover:text-blue-300">
                  Facebook
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>© {new Date().getFullYear()} DefenseDrone Tech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}