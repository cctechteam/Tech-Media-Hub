/**
 * Home Page Component
 * 
 * The main landing page for the Tech Media Hub application.
 * Serves as the entry point for users and provides an overview
 * of the Campion College Technology & Media Production department.
 * 
 * Features:
 * - Hero section with Campion College branding
 * - Responsive design with mobile-first approach
 * - School motto display (Fortes in Fide et Opere)
 * - Professional imagery and typography
 * - Navigation integration with main site structure
 * - Campion College brand colors (#B91C47)
 * 
 * Design Elements:
 * - Full-width hero banner with overlay content
 * - Backdrop blur effects for modern appearance
 * - Responsive text sizing and spacing
 * - School logo positioning and branding
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

import Image from "next/image";

import Logo from "../res/images/logo.png";
import TechTeamBanner from "../res/images/techteam.png";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

/**
 * HomePage Component
 * 
 * Main landing page component that displays the hero section
 * and introduces users to the Tech Media Hub system.
 */
export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-96 md:h-[500px]">
        <Image
          src={TechTeamBanner}
          alt="Hero Background"
          fill
          className="object-cover brightness-50"
          priority
        />
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-3xl">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/20">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                <span className="block drop-shadow-2xl" style={{color: '#B91C47'}}>
                  Campion College
                </span>
              </h1>
              <h2 className="text-lg md:text-2xl font-light mb-6 text-gray-100 tracking-wide">
                Technology & Media Production
              </h2>
              <div className="border-t border-white/30 pt-4">
                <p className="text-lg md:text-xl font-light italic">
                  <span className="font-semibold" style={{color: '#B91C47'}}>Fortes in Fide et Opere</span>
                </p>
                <p className="text-sm md:text-lg mt-1 text-gray-300">
                  Strong in Faith and Work
                </p>
              </div>
            </div>
          </div>
        </div>

        <Image
          src={Logo}
          alt="Hero Logo"
          className="absolute bottom-4 right-4 w-[20%] md:w-[15%] aspect-auto opacity-90"
        />
      </div>

      {/* Call to Action Banner */}
      <div className="w-full py-8" style={{backgroundColor: '#8B1538'}}>
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-white text-xl md:text-2xl font-semibold mb-4">
            Join Our Innovation Journey
          </h3>
          <p className="text-white/90 text-lg mb-6 max-w-3xl mx-auto">
            Empowering students through technology, creativity, and collaboration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/resources"
              className="px-6 py-3 bg-white text-red-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore Resources
            </a>
            <a
              href="/#about"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-900 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="w-full bg-white py-12 px-6 md:px-16 lg:px-24" id="about">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{color: '#8B1538'}}>
            About Us
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Part 1 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md p-8 hover:shadow-xl transition-all duration-300 border-l-4" style={{borderLeftColor: '#8B1538'}}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{backgroundColor: '#8B1538'}}>
                  💡
                </div>
                <h3 className="text-xl font-semibold ml-4" style={{color: '#8B1538'}}>
                  Innovation & Support
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                The Campion College Tech Team is a student-led organization that
                drives innovation, supports school events, and builds
                cutting-edge projects. From coding to AV support, our members
                grow their technical skills while making a real impact.
              </p>
            </div>

            {/* Part 2 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md p-8 hover:shadow-xl transition-all duration-300 border-l-4" style={{borderLeftColor: '#8B1538'}}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{backgroundColor: '#8B1538'}}>
                  ⚡
                </div>
                <h3 className="text-xl font-semibold ml-4" style={{color: '#8B1538'}}>
                  Guided by Our Motto
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Inspired by Campion&apos;s motto,{" "}
                <em className="font-semibold" style={{color: '#8B1538'}}>Fortes in Fide et Opere</em> (Strong in Faith and Work), we
                are dedicated to academic excellence and the holistic growth of
                our members. We foster a community that is intellectually strong
                and morally grounded.
              </p>
            </div>

            {/* Part 3 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md p-8 hover:shadow-xl transition-all duration-300 border-l-4 md:col-span-2 lg:col-span-1" style={{borderLeftColor: '#8B1538'}}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{backgroundColor: '#8B1538'}}>
                  🤝
                </div>
                <h3 className="text-xl font-semibold ml-4" style={{color: '#8B1538'}}>
                  Collaboration & Growth
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Our vibrant team thrives on collaboration and mutual respect.
                Every member contributes to our collective success, and together
                we embrace new challenges. Your support is essential as we
                innovate, learn, and grow throughout the year.
              </p>
            </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}