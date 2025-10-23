/**
 * Resources Page - Technology Resource Library
 * 
 * This page provides a comprehensive library of technology resources for
 * Campion College students, teachers, and staff. It features:
 * - Searchable and filterable resource collection
 * - Multiple resource categories (Guides, Policies, Forms, etc.)
 * - Advanced search functionality across titles, descriptions, and tags
 * - Sorting capabilities by title, date, and download count
 * - Responsive card-based layout with metadata display
 * - Download statistics and file information
 * 
 * The page was enhanced based on previous system memory to include
 * advanced filtering, improved UX, and comprehensive resource metadata.
 * 
 * @author Tech Media Hub Team
 * @version 2.0
 * @since 2024
 */

"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

/**
 * Resource Type Definition
 * 
 * Defines the structure of resource objects in the library.
 * Each resource contains metadata for display, search, and organization.
 */
type Resource = {
  id: number;           // Unique identifier for the resource
  title: string;        // Display title of the resource
  description: string;  // Detailed description of the resource content
  lastUpdated: string;  // Date when resource was last modified (YYYY-MM-DD)
  preparedBy: string;   // Author or team that created the resource
  category: string;     // Resource category (Guides, Policies, Forms, etc.)
  link: string;         // URL or anchor link to access the resource
  image: string;        // Path to preview image or icon
  tags: string[];       // Array of searchable tags for filtering
  downloadCount?: number; // Optional: Number of times resource was downloaded
  fileSize?: string;    // Optional: File size for download resources
  fileType?: string;    // Optional: File format (PDF, DOC, etc.)
};

/**
 * Resources Data Collection
 * 
 * Comprehensive library of technology resources for Campion College.
 * This collection includes guides, policies, forms, and other materials
 * organized by category with full metadata for search and filtering.
 * 
 * Categories:
 * - Guides: Step-by-step instructions and tutorials
 * - Policies: Rules, guidelines, and acceptable use policies
 * - Forms: Official documents for requests and agreements
 * 
 * Each resource includes download statistics, file information,
 * and searchable tags for enhanced discoverability.
 */
const resourcesData: Resource[] = [
  {
    id: 1,
    title: "How to Access Canvas LMS",
    description: "Complete step-by-step guide for logging in and navigating Canvas Learning Management System. Includes troubleshooting tips and best practices.",
    lastUpdated: "2025-10-15",
    preparedBy: "CC Tech Team",
    category: "Guides",
    link: "#canvas-guide",
    image: "/images/Campion_Logo.png",
    tags: ["canvas", "lms", "login", "navigation"],
    downloadCount: 245,
    fileSize: "2.3 MB",
    fileType: "PDF"
  },
  {
    id: 2,
    title: "Technology Usage Guidelines",
    description: "Comprehensive rules and policies for using school technology resources responsibly. Covers acceptable use, security protocols, and consequences.",
    lastUpdated: "2025-09-20",
    preparedBy: "CC Tech Team",
    category: "Policies",
    link: "#tech-guidelines",
    image: "/images/Campion_Logo.png",
    tags: ["policy", "guidelines", "technology", "acceptable use"],
    downloadCount: 189,
    fileSize: "1.8 MB",
    fileType: "PDF"
  },
  {
    id: 3,
    title: "How to Access FACTS (RenWeb)",
    description: "Step-by-step guide for logging in and navigating FACTS (RenWeb) student information system. Includes parent portal access instructions.",
    lastUpdated: "2025-10-01",
    preparedBy: "CC Tech Team",
    category: "Guides",
    link: "#facts-guide",
    image: "/images/Campion_Logo.png",
    tags: ["facts", "renweb", "student portal", "grades"],
    downloadCount: 156,
    fileSize: "1.5 MB",
    fileType: "PDF"
  },
  {
    id: 4,
    title: "WiFi Setup and Troubleshooting",
    description: "Complete guide for connecting to school WiFi networks, troubleshooting connection issues, and optimizing network performance.",
    lastUpdated: "2025-10-10",
    preparedBy: "CC Tech Team",
    category: "Guides",
    link: "#wifi-setup",
    image: "/images/Campion_Logo.png",
    tags: ["wifi", "network", "troubleshooting", "connection"],
    downloadCount: 203,
    fileSize: "1.2 MB",
    fileType: "PDF"
  },
  {
    id: 5,
    title: "Student Email Configuration",
    description: "Instructions for setting up and configuring student email accounts on various devices and email clients.",
    lastUpdated: "2025-09-25",
    preparedBy: "CC Tech Team",
    category: "Guides",
    link: "#email-config",
    image: "/images/Campion_Logo.png",
    tags: ["email", "configuration", "outlook", "mobile"],
    downloadCount: 134,
    fileSize: "1.7 MB",
    fileType: "PDF"
  },
  {
    id: 6,
    title: "IT Support Request Form",
    description: "Official form for submitting technology support requests. Use this form to report issues or request assistance.",
    lastUpdated: "2025-10-05",
    preparedBy: "CC Tech Team",
    category: "Forms",
    link: "#support-form",
    image: "/images/Campion_Logo.png",
    tags: ["support", "form", "request", "help desk"],
    downloadCount: 89,
    fileSize: "0.5 MB",
    fileType: "PDF"
  },
  {
    id: 7,
    title: "Device Loan Agreement",
    description: "Agreement form for borrowing school technology devices. Includes terms of use and return policies.",
    lastUpdated: "2025-09-15",
    preparedBy: "CC Tech Team",
    category: "Forms",
    link: "#device-loan",
    image: "/images/Campion_Logo.png",
    tags: ["device", "loan", "agreement", "policy"],
    downloadCount: 67,
    fileSize: "0.8 MB",
    fileType: "PDF"
  },
  {
    id: 8,
    title: "Privacy and Data Protection Policy",
    description: "School policy regarding student data privacy, protection measures, and compliance with educational privacy laws.",
    lastUpdated: "2025-08-30",
    preparedBy: "CC Tech Team",
    category: "Policies",
    link: "#privacy-policy",
    image: "/images/Campion_Logo.png",
    tags: ["privacy", "data protection", "policy", "compliance"],
    downloadCount: 112,
    fileSize: "2.1 MB",
    fileType: "PDF"
  }
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const categories = ["All", "Guides", "Policies", "Forms"];
  const sortOptions = [
    { value: "title", label: "Title" },
    { value: "date", label: "Date Updated" },
    { value: "downloads", label: "Download Count" }
  ];

  const filteredAndSortedResources = resourcesData
    .filter(resource => {
      const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case "downloads":
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        default:
          return a.title.localeCompare(b.title);
      }
    });

return (
  <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-indigo-50 text-gray-800">
    <Navbar />
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-red-900">School Resources</h1>
        <p className="text-gray-600 mt-2">
          Access important guides, policies, and forms prepared to enhance Campion Life.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Category Filter */}
          <div className="flex gap-3 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedCategory === category
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-red-700 border-red-300 hover:bg-red-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-center">
        <p className="text-gray-600">
          Showing {filteredAndSortedResources.length} of {resourcesData.length} resources
        </p>
      </div>

      {/* Resource Cards */}
      {filteredAndSortedResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <img
              src="/images/Campion_Logo.png"
              alt="No results"
              className="w-24 h-24 mx-auto opacity-50"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedResources.map((resource: Resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
          >
            {/* Image with Overlay */}
            <div className="relative h-48 w-full overflow-hidden group bg-gray-50 flex items-center justify-center">
              <img
                src={resource.image}
                alt={resource.title}
                className="max-h-full max-w-full object-contain p-4 transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/Campion_Logo.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {resource.fileType && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                  {resource.fileType}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              {/* Header with title and download count */}
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-red-800 mb-1 leading-tight">
                  {resource.title}
                </h2>
                {resource.downloadCount && (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {resource.downloadCount} downloads
                  </div>
                )}
              </div>
              
              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 flex-grow leading-relaxed">
                {resource.description}
              </p>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{resource.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-1 mb-4 text-xs text-gray-500 border-t pt-3">
                <div className="flex justify-between">
                  <span>Prepared by:</span>
                  <span className="font-medium">{resource.preparedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span className="font-medium">{new Date(resource.lastUpdated).toLocaleDateString()}</span>
                </div>
                {resource.fileSize && (
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{resource.fileSize}</span>
                  </div>
                )}
              </div>

              {/* Access Button */}
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Access Resource
              </a>
            </div>
          </div>
        ))}
      </div>
      )}
    </section>
    <Footer />
  </main>
);

}
