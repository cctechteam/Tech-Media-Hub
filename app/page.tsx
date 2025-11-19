"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "../res/images/Campion_Logo.png";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { fetchCurrentUser } from "@/lib/serverUtils";
import { retrieveSessionToken } from "@/lib/utils";

export default function HomePage() {
  const [user, setUser] = useState<any | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    (async () => {
      const cuser = await fetchCurrentUser(retrieveSessionToken(), false);
      setUser(cuser ?? null);
      setIsLoading(false);
    })();
  }, [isClient]);

  if (!isClient || isLoading) {
    return (
      <main className="flex flex-col min-h-screen w-full bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen w-full bg-white">
      <Navbar />

      <div className="relative w-full bg-campion-gradient overflow-hidden">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Logo */}
              <div className="flex-shrink-0 animate-fade-in">
                <div className="bg-white p-8 rounded-3xl shadow-campion-xl transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={Logo}
                    alt="Campion College Logo"
                    width={140}
                    height={140}
                    className="w-28 h-28 md:w-36 md:h-36"
                  />
                </div>
              </div>
              

              <div className="flex-1 text-center md:text-left animate-fade-in" style={{animationDelay: '0.2s'}}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight drop-shadow-lg">
                  Campion College
                  <span className="block mt-3 text-3xl md:text-4xl lg:text-5xl text-white/95 font-semibold">
                    Resources & Tools Hub
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed font-light">
                  {user 
                    ? `Welcome back, ${user.full_name || user.email}!` 
                    : "Streamline school operations with powerful administrative tools"}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  {user ? (
                    <>
                      <a href="/tools" className="px-8 py-4 bg-white text-[#8B1538] font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        Browse Tools
                      </a>
                      <a href="/tools" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white hover:bg-white/20 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                        View Tools
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="/tools" className="px-8 py-4 bg-white text-[#8B1538] font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        Browse Tools
                      </a>
                      <a href="/auth/login" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white hover:bg-white/20 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                        Sign In
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>


      <section className="w-full py-24 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-full mb-6 shadow-sm">
              <span className="text-[#8B1538] font-semibold text-sm uppercase tracking-wider">About This Hub</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
              Embracing the Digital Era
            </h2>
            <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed">
              The Campion College Resources & Tools Hub is a centralized platform containing various digital tools 
              designed to make school operations more efficient, streamlined, and aligned with modern educational standards. 
              As we continue to grow in the digital age, this hub serves as the foundation for innovation and excellence 
              in school administration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-5 bg-campion-gradient shadow-campion-lg">
                💻
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Digital Transformation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Moving towards a paperless, efficient digital ecosystem
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-5 bg-campion-gradient shadow-campion-lg">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Continuous Innovation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Regularly updated with new tools and features
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-5 bg-campion-gradient shadow-campion-lg">
                🎓
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Educational Excellence
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Supporting Campion's mission of academic achievement
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{color: '#8B1538'}}>
              Available Tools
            </h2>
            <p className="text-gray-600 text-xl leading-relaxed">
              Currently available systems to help manage school operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <a
              href="/student"
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-campion-lg transition-all duration-300 p-10 border-l-4 group transform hover:-translate-y-2"
              style={{borderLeftColor: '#8B1538'}}
            >
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl mr-5 shadow-campion group-hover:scale-110 transition-transform duration-300" style={{backgroundColor: '#8B1538'}}>
                  📋
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#6D1028] transition-colors" style={{color: '#8B1538'}}>
                    Beadle System
                  </h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">For Students, Staff & Admins</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Comprehensive attendance tracking and reporting system. Submit reports, view submissions, and manage attendance data.
              </p>
            </a>

            <a
              href="/supervisor/dashboard"
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-campion-lg transition-all duration-300 p-10 border-l-4 group transform hover:-translate-y-2"
              style={{borderLeftColor: '#A91B47'}}
            >
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl mr-5 shadow-campion group-hover:scale-110 transition-transform duration-300" style={{backgroundColor: '#A91B47'}}>
                  📊
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#6D1028] transition-colors" style={{color: '#8B1538'}}>
                    Supervisor Dashboard
                  </h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">For Staff & Admins</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Monitor student activities, view reports, and manage supervisory tasks across the school.
              </p>
            </a>
          </div>

          <div className="text-center mt-12">
            <a
              href="/tools"
              className="inline-block px-8 py-4 border-2 font-semibold rounded-xl hover:bg-[#8B1538] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              style={{borderColor: '#8B1538', color: '#8B1538'}}
            >
              View All Tools →
            </a>
          </div>
        </div>
      </section>

      <section className="w-full">
        {!user ? (
          <div className="py-20 px-6 bg-campion-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
            </div>
            <div className="container mx-auto max-w-4xl text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Get Started?
              </h2>
              <p className="text-white/95 text-xl mb-10 leading-relaxed">
                Sign in to access your personalized dashboard and tools
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <a
                  href="/auth/login"
                  className="px-10 py-4 bg-white font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
                  style={{color: '#8B1538'}}
                >
                  Sign In
                </a>
                <a
                  href="/auth/signup"
                  className="px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-[#8B1538] transition-all duration-300 shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  Create Account
                </a>
              </div>
              <p className="text-white/80 text-sm mt-8 font-medium">
                Facilitated by the CC Tech & Media Production Team
              </p>
            </div>
          </div>
        ) : (
          <div className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto max-w-4xl text-center">
              <p className="text-gray-600 text-sm font-medium">
                Facilitated by the CC Tech & Media Production Team
              </p>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
