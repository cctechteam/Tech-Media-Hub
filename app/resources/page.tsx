"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

type Resource = {
  id: number;
  title: string;
  description: string;
  lastUpdated: string;
  preparedBy: string;
  category: string;
  link: string;
  image: string;
};

const resourcesData: Resource[] = [
  {
    id: 1,
    title: "How to Access Canvas LMS",
    description: "Step-by-step guide for logging in and navigating Canvas LMS.",
    lastUpdated: "2025-08-11",
    preparedBy: "CC Tech Team",
    category: "Guides",
    link: "/resources/docs/sample.pdf",
    image: "/resources/imgs/sample.png"
  },
  {
    id: 2,
    title: "Tech and Usage Guidelines",
    description: "Rules and policies for using Technology.",
    lastUpdated: "2025-08-11",
    preparedBy: "CC Tech Team",
    category: "Policies",
    link: "/resources/docs/sample.pdf",
    image: "/resources/imgs/sample.png"
  },
  {
    id: 3,
    title: "How to Acess FACTS (Renweb)",
    description: "Step-by-step guide for logging in and navigating FACTS (Renweb)",
    lastUpdated: "2025-08-11",
    preparedBy: "CC Tech Team",
    category: "Guides",
    link: "/resources/docs/sample.pdf",
    image: "/resources/imgs/sample.png"
  }
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Guides", "Policies", "Forms"];

  const filteredResources =
    selectedCategory === "All"
      ? resourcesData
      : resourcesData.filter(r => r.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-indigo-50 text-gray-800">
      <Navbar />
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-900">School Resources</h1>
          <p className="text-gray-600 mt-2">
            Access important guides, policies, and forms prepared to enhance Campion Life.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8 gap-3 flex-wrap">
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

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-xl font-semibold text-red-800 mb-2">
                  {resource.title}
                </h2>
                <p className="text-gray-600 mb-4 flex-grow">{resource.description}</p>

                {/* Metadata Section styled like details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
                  <p className="mb-1">
                    <strong className="text-gray-700">Prepared By:</strong>{" "}
                    <span className="text-red-700 font-medium">{resource.preparedBy}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Date Prepared:</strong>{" "}
                    <span className="text-red-700 font-medium">{resource.lastUpdated}</span>
                  </p>
                </div>

                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Access Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
