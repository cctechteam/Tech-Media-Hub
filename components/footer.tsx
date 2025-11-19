import React from "react";
import { FaPhone, FaEnvelope, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaGlobe, FaCode, FaUsers, FaLaptop } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="text-gray-300 py-16 mt-auto relative bg-gradient-to-b from-gray-900 to-black border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    <div>
                        <h4 className="text-xl font-bold mb-5 flex items-center text-white">
                            <FaCode className="mr-2" style={{color: '#B91C47'}} />
                            Resources & Tools Hub
                        </h4>
                        <p className="text-sm leading-relaxed mb-5 text-gray-400">
                            Administrative tools and systems for managing Campion College 
                            operations, including the Beadle attendance system.
                        </p>
                        <div className="flex items-center text-sm text-gray-500 bg-gray-800/50 rounded-lg p-3">
                            <FaUsers className="mr-2 flex-shrink-0" style={{color: '#B91C47'}} />
                            <span>Facilitated by CC Tech & Media Production Team</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xl font-bold mb-5 text-white">Quick Access</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/student" className="hover:text-white flex items-center group transition-all duration-200 hover:translate-x-1">
                                <FaLaptop className="mr-3 text-gray-500 group-hover:text-[#B91C47] transition-colors" />
                                <span className="group-hover:underline">Student Portal</span>
                            </a></li>
                            <li><a href="/staff" className="hover:text-white flex items-center group transition-all duration-200 hover:translate-x-1">
                                <FaCode className="mr-3 text-gray-500 group-hover:text-[#B91C47] transition-colors" />
                                <span className="group-hover:underline">Staff Portal</span>
                            </a></li>
                            <li><a href="/staff" className="hover:text-white flex items-center group transition-all duration-200 hover:translate-x-1">
                                <FaUsers className="mr-3 text-gray-500 group-hover:text-[#B91C47] transition-colors" />
                                <span className="group-hover:underline">Supervisor Tools</span>
                            </a></li>
                            <li><a href="/admin" className="hover:text-white flex items-center group transition-all duration-200 hover:translate-x-1">
                                <FaUsers className="mr-3 text-gray-500 group-hover:text-[#B91C47] transition-colors" />
                                <span className="group-hover:underline">Beadle Admin</span>
                            </a></li>
                        </ul>
                    </div>

                    <div id="contact">
                        <h4 className="text-xl font-bold mb-5 text-white">Contact Us</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start group">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-gray-500 group-hover:text-[#B91C47] transition-colors flex-shrink-0" />
                                <span className="text-gray-400 leading-relaxed">
                                    Campion College<br />
                                    105 Hope Road<br />
                                    Kingston 6, Jamaica
                                </span>
                            </div>
                            <div className="flex items-center group">
                                <FaEnvelope className="mr-3 text-gray-500 group-hover:text-[#B91C47] transition-colors flex-shrink-0" />
                                <a href="mailto:cctechteam@campioncollege.com" className="hover:text-white hover:underline transition-colors">
                                    cctechteam@campioncollege.com
                                </a>
                            </div>
                            <div className="flex items-center group">
                                <FaGlobe className="mr-3 text-gray-500 group-hover:text-[#B91C47] transition-colors flex-shrink-0" />
                                <a href="https://www.campioncollege.com" className="hover:text-white hover:underline transition-colors">
                                    campioncollege.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xl font-bold mb-5 text-white">Stay Connected</h4>
                        <div className="flex gap-3 text-2xl mb-6">
                            <a href="https://x.com/fortesfeed?s=21" target="_blank" rel="noopener noreferrer" 
                               className="text-gray-400 hover:text-white transition-all duration-300 p-3 rounded-xl hover:bg-gray-800 transform hover:scale-110 hover:shadow-lg"
                               style={{'--hover-color': '#B91C47'} as React.CSSProperties}>
                                <FaTwitter />
                            </a>
                            <a href="https://www.instagram.com/fortesfeed" target="_blank" rel="noopener noreferrer" 
                               className="text-gray-400 hover:text-white transition-all duration-300 p-3 rounded-xl hover:bg-gray-800 transform hover:scale-110 hover:shadow-lg">
                                <FaInstagram />
                            </a>
                            <a href="https://www.youtube.com/channel/UC-9ek8cguCBRtEUrd07Vs0w" target="_blank" rel="noopener noreferrer" 
                               className="text-gray-400 hover:text-white transition-all duration-300 p-3 rounded-xl hover:bg-gray-800 transform hover:scale-110 hover:shadow-lg">
                                <FaYoutube />
                            </a>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border-l-4" style={{borderColor: '#B91C47'}}>
                            <p className="text-sm text-gray-400 italic leading-relaxed">
                                <span className="text-white font-semibold">"Fortes in Fide et Opere"</span><br />
                                Strong in Faith and Work
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-10">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <div className="mb-4 md:mb-0">
                            <p className="font-medium">© 2025 Campion College Resources & Tools Hub. All rights reserved.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            <a href="/" className="hover:text-white transition-colors hover:underline">Home</a>
                            <span className="text-gray-700">•</span>
                            <a href="/tools" className="hover:text-white transition-colors hover:underline">Tools</a>
                            <span className="text-gray-700">•</span>
                            <a href="/auth/login" className="hover:text-white transition-colors hover:underline">Login</a>
                            <span className="text-gray-700">•</span>
                            <a href="https://www.campioncollege.com" className="hover:text-white transition-colors hover:underline">Main Site</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
