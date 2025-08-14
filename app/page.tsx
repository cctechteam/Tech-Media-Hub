import Image from "next/image";

import Logo from "../res/images/logo.png";
import TechTeamBanner from "../res/images/techteam.png";
import TechSupportIcon from "../res/images/techsupport.png";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ITD from "@/components/ITD";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <Navbar />

      {/* Hero Section */}
      <div
        className="relative w-full aspect-video"
      >
        <Image
          src={TechTeamBanner}
          alt="Hero Background"
          fill
          className="object-cover brightness-50"
          priority
        />

        <Image
          src={Logo}
          alt="Hero Logo"
          className="absolute bottom-0 right-0 w-[25%] aspect-auto"
        />
      </div>

      {/* Hero Underbanner */}
      <div className="w-full h-20 bg-red-700">

      </div>

      {/* Image & Text */}
      <ITD imageSrc={TechSupportIcon} alignment="left" className="py-6">
        <section className="w-full bg-white py-12 px-6 md:px-16 lg:px-24" id="about">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-red-600">
            About Us
          </h2>

          <div className="flex flex-col gap-8">
            {/* Part 1 */}
            <div className="bg-gray-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-4 text-red-800">
                Innovation & Support
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The Campion College Tech Team is a student-led organization that
                drives innovation, supports school events, and builds
                cutting-edge projects. From coding to AV support, our members
                grow their technical skills while making a real impact.
              </p>
            </div>

            {/* Part 2 */}
            <div className="bg-gray-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-4 text-red-800">
                Guided by Our Motto
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Inspired by Campion&apos;s motto,{" "}
                <em>Fortes in Fide et Opere</em> (Strong in Faith and Work), we
                are dedicated to academic excellence and the holistic growth of
                our members. We foster a community that is intellectually strong
                and morally grounded.
              </p>
            </div>

            {/* Part 3 */}
            <div className="bg-gray-50 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-4 text-red-800">
                Collaboration & Growth
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our vibrant team thrives on collaboration and mutual respect.
                Every member contributes to our collective success, and together
                we embrace new challenges. Your support is essential as we
                innovate, learn, and grow throughout the year.
              </p>
            </div>
          </div>
        </section>
      </ITD>

      <Footer />
    </main>
  );
}