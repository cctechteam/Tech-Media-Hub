import React from "react";
import { FaPhone, FaEnvelope, FaTwitter, FaInstagram, FaYoutube, FaAddressBook, FaIdCard } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4">

                {/* 3-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Contact Information */}
                    <div id="contact">
                        <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
                        <p>
                            <FaIdCard className="inline-block mr-2" />
                            Campion College<br />
                            <FaAddressBook className="inline-block mr-2" />
                            105 Hope Road, Kingston 6, Jamaica<br />
                            <FaPhone className="inline-block mr-2" />
                            876-927-9458 / 876-927-9555 / 876-978-2548<br />
                            <FaEnvelope className="inline-block mr-2" />
                            <a href="mailto:cctechteam@campioncollege.com" className="hover:text-white">
                                cctechteam@campioncollege.com
                            </a><br />
                            <FaEnvelope className="inline-block mr-2" />
                            <a href="mailto:info@campioncollege.com" className="hover:text-white">
                                info@campioncollege.com
                            </a>
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="https://www.campioncollege.com/?p=factBook" className="hover:text-white">Fact Book</a></li>
                            <li><a href="https://www.campioncollege.com/?p=about" className="hover:text-white">About Campion</a></li>
                            <li><a href="https://www.campioncollege.com/?p=faculty" className="hover:text-white">School Academics</a></li>
                            <li><a href="https://www.campioncollege.com/?p=parents_manual" className="hover:text-white">Parent Resources</a></li>
                            <li><a href="https://www.campioncollege.com/?p=clubs_sports" className="hover:text-white">Clubs & Sports</a></li>
                            <li><a href="https://www.campioncollege.com/?p=contact" className="hover:text-white">Contact Information</a></li>
                        </ul>
                    </div>

                    {/* Stay Connected */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
                        <div className="flex gap-4 text-xl mb-6">
                            <a href="https://x.com/fortesfeed?s=21" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                                <FaTwitter />
                            </a>
                            <a href="https://www.instagram.com/fortesfeed" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                                <FaInstagram />
                            </a>
                            <a href="https://www.youtube.com/channel/UC-9ek8cguCBRtEUrd07Vs0w" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
                    © 2025 Campion College Technology and Media Production. All rights reserved. |{" "}
                    <a href="#" className="hover:text-white">Privacy Policy</a> |{" "}
                    <a href="#" className="hover:text-white">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}
