"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaClipboardCheck, FaChartLine, FaSearch, FaFilter } from "react-icons/fa";

interface SubLink {
  name: string;
  description: string;
  link: string;
  role: string;
}

interface Tool {
  name: string;
  description: string;
  icon: React.ReactNode;
  roles: string[];
  color: string;
  subLinks: SubLink[];
  category: string;
}

const tools: Tool[] = [
  {
    name: "Beadle System",
    description: "Comprehensive attendance tracking and reporting system for beadles, staff, supervisors, and administrators.",
    icon: <FaClipboardCheck className="text-4xl" />,
    roles: ["Beadle", "Staff", "Supervisor", "Admin"],
    color: "#8B1538",
    category: "Attendance",
    subLinks: [
      {
        name: "Submit Beadle Slip",
        description: "Beadles submit class attendance reports",
        link: "/beadle",
        role: "Beadle"
      },
      {
        name: "My Submissions",
        description: "View your submitted beadle slips",
        link: "/beadle/my-submissions",
        role: "Beadle"
      },
      {
        name: "Staff Portal",
        description: "View and manage beadle reports",
        link: "/staff",
        role: "Staff"
      },
      {
        name: "Supervisor Dashboard",
        description: "Monitor form-specific attendance and manage beadles",
        link: "/supervisor/dashboard",
        role: "Supervisor"
      },
      {
        name: "Admin Dashboard",
        description: "System-wide beadle management and oversight",
        link: "/admin/beadle-dashboard",
        role: "Admin"
      },
      {
        name: "Email Reports",
        description: "Generate and send automated attendance reports",
        link: "/admin/email-reports",
        role: "Admin"
      }
    ]
  },
  {
    name: "Role Management",
    description: "Manage user roles, permissions, and access levels across the entire system.",
    icon: <FaChartLine className="text-4xl" />,
    roles: ["Tech Team", "Admin"],
    color: "#FF6B35",
    category: "Management",
    subLinks: [
      {
        name: "Tech Team Portal",
        description: "Advanced role and permission management",
        link: "/tech-team",
        role: "Tech Team"
      },
      {
        name: "Role Assignment",
        description: "Assign and modify user roles",
        link: "/tech-team/role-management",
        role: "Tech Team"
      }
    ]
  },
];

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const roles = ["All", "Beadle", "Staff", "Supervisor", "Tech Team", "Admin"];
  const categories = ["All", "Attendance", "Management"];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || tool.roles.includes(selectedRole);
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    
    return matchesSearch && matchesRole && matchesCategory;
  });

  return (
    <main className="flex flex-col min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      <div className="w-full py-16 px-6 bg-campion-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <span className="text-white font-semibold text-xs uppercase tracking-wider">Tools Directory</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            Available Tools & Systems
          </h1>
          <p className="text-lg text-white/95 max-w-3xl mx-auto leading-relaxed">
            Explore powerful administrative tools designed to streamline Campion College operations
          </p>
        </div>
      </div>

      <div className="w-full py-10 px-6 bg-white shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
              <FaFilter className="text-[#8B1538]" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent bg-white transition-all shadow-sm hover:shadow-md text-sm font-medium"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role} Role</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent bg-white transition-all shadow-sm hover:shadow-md text-sm font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {(selectedRole !== "All" || selectedCategory !== "All" || searchTerm) && (
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <span className="text-sm font-semibold text-gray-700">Active filters:</span>
              {searchTerm && (
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium shadow-sm">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedRole !== "All" && (
                <span className="px-4 py-2 bg-[#8B1538] text-white rounded-full text-sm font-medium shadow-md">
                  {selectedRole}
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="px-4 py-2 bg-[#A91B47] text-white rounded-full text-sm font-medium shadow-md">
                  {selectedCategory}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("All");
                  setSelectedCategory("All");
                }}
                className="text-sm text-[#8B1538] hover:text-[#6D1028] font-semibold hover:underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="container mx-auto px-6 py-12 max-w-6xl">
        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">No tools found</h3>
            <p className="text-gray-600 text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {filteredTools.map((tool, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-campion-lg transition-all duration-300 overflow-hidden border-l-4 group transform hover:-translate-y-1"
                style={{borderLeftColor: tool.color}}
              >
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-campion text-3xl"
                      style={{backgroundColor: tool.color}}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold" style={{color: tool.color}}>
                          {tool.name}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold uppercase tracking-wide">
                          {tool.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tool.roles.map((role, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-full text-white font-semibold shadow-sm"
                            style={{backgroundColor: tool.color}}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-2 bg-white">
                  {tool.subLinks.map((subLink, i) => (
                    <a
                      key={i}
                      href={subLink.link}
                      className="block p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group/link border-2 border-transparent hover:border-gray-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 group-hover/link:text-[#8B1538] transition-colors">
                              {subLink.name}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                              {subLink.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {subLink.description}
                          </p>
                        </div>
                        <svg 
                          className="w-5 h-5 text-gray-400 group-hover/link:text-[#8B1538] group-hover/link:translate-x-1 transition-all flex-shrink-0 ml-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-campion-lg p-10 border-t-4 text-center hover:shadow-campion-xl transition-all duration-300" style={{borderTopColor: '#8B1538'}}>
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-4" style={{color: '#8B1538'}}>
              More Tools Coming Soon
            </h3>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto mb-6">
              The Resources & Tools Hub is continuously expanding. New tools and features 
              are being developed by the CC Tech & Media Production Team to better serve 
              the Campion College community.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="px-6 py-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="text-3xl font-bold mb-1" style={{color: '#8B1538'}}>{tools.length}</div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Active Tools</div>
              </div>
              <div className="px-6 py-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="text-3xl font-bold mb-1" style={{color: '#8B1538'}}>∞</div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
