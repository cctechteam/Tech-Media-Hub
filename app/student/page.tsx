"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaClipboardCheck, FaBars, FaTimes, FaHistory } from "react-icons/fa";

export default function StudentPortal() {
  const [activeSection, setActiveSection] = useState("submit");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: "submit",
      name: "Submit Beadle Report",
      icon: <FaClipboardCheck className="text-xl" />,
      description: "Submit attendance reports"
    },
    {
      id: "history",
      name: "My Submissions",
      icon: <FaHistory className="text-xl" />,
      description: "View your submitted reports"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="flex-1 flex">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-6 right-6 z-50 p-4 text-white rounded-full shadow-campion-lg hover:shadow-campion-xl transition-all duration-300 hover:scale-110"
          style={{backgroundColor: '#8B1538'}}
        >
          {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>

        <aside
          className={`
            fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg
            transition-transform duration-300 z-40 md:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            w-64 md:w-72
          `}
          style={{top: '73px'}}
        >
          <div className="p-6">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-2" style={{color: '#8B1538'}}>
                Student Portal
              </h2>
              <p className="text-sm text-gray-600">
                Access your tools and resources
              </p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-start p-4 rounded-xl transition-all duration-200
                    ${activeSection === item.id 
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 shadow-sm' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:shadow-sm'
                    }
                  `}
                  style={activeSection === item.id ? {borderLeftColor: '#8B1538'} : {}}
                >
                  <div 
                    className={`
                      mr-3 mt-0.5
                      ${activeSection === item.id ? 'text-[#8B1538]' : 'text-gray-400'}
                    `}
                  >
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div 
                      className={`
                        font-semibold text-sm
                        ${activeSection === item.id ? 'text-[#8B1538]' : 'text-gray-700'}
                      `}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-700 font-bold mb-2 uppercase tracking-wide">
                Coming Soon
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                More student tools and features will be added here.
              </p>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 overflow-auto">
          {activeSection === "submit" && (
            <div className="h-full">
              <iframe
                src="/beadle"
                className="w-full h-full border-0"
                style={{minHeight: 'calc(100vh - 73px)'}}
                title="Beadle Report Form"
              />
            </div>
          )}

          {activeSection === "history" && (
            <div className="h-full">
              <iframe
                src="/beadle/my-submissions"
                className="w-full h-full border-0"
                style={{minHeight: 'calc(100vh - 73px)'}}
                title="My Beadle Submissions"
              />
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}
