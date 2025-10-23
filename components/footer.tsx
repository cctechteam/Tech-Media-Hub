/**
 * Footer Component
 * 
 * Comprehensive footer section for the Tech Media Hub application.
 * Provides contact information, service links, social media connections,
 * and branding for Campion College Technology & Media Production.
 * 
 * Features:
 * - 4-column responsive layout (collapses on mobile)
 * - Tech Team information and mission statement
 * - Service offerings and navigation links
 * - Complete contact information with icons
 * - Social media integration (Twitter, Instagram, YouTube)
 * - School motto and branding elements
 * - Copyright and legal information
 * - Campion College brand colors (#B91C47)
 * 
 * Sections:
 * - About Tech Team: Mission and purpose
 * - Our Services: Available services and links
 * - Contact Us: Address, email, and website
 * - Stay Connected: Social media and motto
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

import React from "react";
import { FaPhone, FaEnvelope, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaGlobe, FaCode, FaUsers, FaLaptop } from "react-icons/fa";

/**
 * Footer Component
 * 
 * Main footer component that displays comprehensive site information,
 * contact details, and navigation links across all pages.
 */
export default function Footer() {
    return (
        <footer className="text-gray-300 py-12 mt-auto relative" style={{backgroundColor: '#1a1a1a'}}>
            <div className="max-w-7xl mx-auto px-4">

                {/* 4-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* About Tech Team */}
                    <div>
                        <h4 className="text-xl font-bold mb-4 flex items-center" style={{color: '#B91C47'}}>
                            <FaCode className="mr-2" />
                            Tech Team
                        </h4>
                        <p className="text-sm leading-relaxed mb-4">
                            Student-led innovation driving technology solutions, 
                            media production, and technical support for Campion College.
                        </p>
                        <div className="flex items-center text-sm text-gray-400">
                            <FaUsers className="mr-2" />
                            <span>Empowering Student Innovation</span>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-xl font-bold mb-4" style={{color: '#B91C47'}}>Our Services</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                                <FaLaptop className="mr-2 text-gray-400" />
                                <span className="hover:text-white cursor-pointer">Technical Support</span>
                            </li>
                            <li className="flex items-center">
                                <FaCode className="mr-2 text-gray-400" />
                                <span className="hover:text-white cursor-pointer">Web Development</span>
                            </li>
                            <li className="flex items-center">
                                <FaUsers className="mr-2 text-gray-400" />
                                <span className="hover:text-white cursor-pointer">Event Support</span>
                            </li>
                            <li><a href="/resources" className="hover:text-white">Student Resources</a></li>
                            <li><a href="/beedle" className="hover:text-white">Beedle Reports</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div id="contact">
                        <h4 className="text-xl font-bold mb-4" style={{color: '#B91C47'}}>Contact Us</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-2 mt-1 text-gray-400" />
                                <span>
                                    Campion College<br />
                                    105 Hope Road<br />
                                    Kingston 6, Jamaica
                                </span>
                            </div>
                            <div className="flex items-center">
                                <FaEnvelope className="mr-2 text-gray-400" />
                                <a href="mailto:cctechteam@campioncollege.com" className="hover:text-white">
                                    cctechteam@campioncollege.com
                                </a>
                            </div>
                            <div className="flex items-center">
                                <FaGlobe className="mr-2 text-gray-400" />
                                <a href="https://www.campioncollege.com" className="hover:text-white">
                                    campioncollege.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-xl font-bold mb-4" style={{color: '#B91C47'}}>Stay Connected</h4>
                        <div className="flex gap-4 text-2xl mb-4">
                            <a href="https://x.com/fortesfeed?s=21" target="_blank" rel="noopener noreferrer" 
                               className="hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
                                <FaTwitter />
                            </a>
                            <a href="https://www.instagram.com/fortesfeed" target="_blank" rel="noopener noreferrer" 
                               className="hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
                                <FaInstagram />
                            </a>
                            <a href="https://www.youtube.com/channel/UC-9ek8cguCBRtEUrd07Vs0w" target="_blank" rel="noopener noreferrer" 
                               className="hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
                                <FaYoutube />
                            </a>
                        </div>
                        <p className="text-xs text-gray-400 italic">
                            "Fortes in Fide et Opere"<br />
                            Strong in Faith and Work
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mt-10 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <div className="mb-4 md:mb-0">
                            <p>© 2025 Campion College Technology & Media Production Team. All rights reserved.</p>
                        </div>
                        <div className="flex space-x-4">
                            <a href="/" className="hover:text-white transition-colors">Home</a>
                            <a href="/#about" className="hover:text-white transition-colors">About</a>
                            <a href="/resources" className="hover:text-white transition-colors">Resources</a>
                            <a href="https://www.campioncollege.com" className="hover:text-white transition-colors">Main Site</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
