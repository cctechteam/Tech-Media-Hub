import Image from "next/image";
import Logo from "../res/images/logo.png";

const Navlinks = [
    {
        text: "Home",
        href: "/"
    },

    {
        text: "Fact Book",
        href: "https://www.campioncollege.com/?p=factBook"
    },

    {
        text: "About",
        href: "/#about"
    },

    {
        text: "Academics",
        href: "https://www.campioncollege.com/?p=faculty"
    },

    {
        text: "Student",
        href: "https://www.campioncollege.com/?p=policies"
    },

    {
        text: "Contact",
        href: "#contact"
    },
]

export default function Navbar() {
    return (<header className="bg-white border-b border-gray-300 sticky z-50 top-0">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
            <div className="flex items-center space-x-3">
                <Image src={Logo} alt="Tech Team Logo" width={90} height={48} className="aspect-auto pointer-events-none" />

                <div className="flex flex-col items-center space-x-3 pointer-events-none">
                    <span className="text-2xl font-bold text-red-600 pointer-events-none">
                        Campion College
                    </span>
                    <span className="text-xl font-bold text-red-500 pointer-events-none">
                        Technology & Media Production
                    </span>
                </div>
            </div>

            {/* Desktop */}
            <nav className="hidden md:flex space-x-8 font-medium items-center mx-auto">
                {
                    Navlinks.map((x, i) => <a href={x.href} key={i} className="hover:text-gray-900 transition-colors text-base text-gray-700">
                        {x.text}
                    </a>)
                }
            </nav>

            {/* Login / Signup button group */}
            <div className="ml-6 inline-flex rounded-md overflow-hidden">
                <a
                    href="/auth/login"
                    className="px-3 py-1.5 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                >
                    Login
                </a>
                <a
                    href="/auth/signup"
                    className="px-3 py-1.5 text-red-600 font-semibold hover:bg-gray-200 transition-colors border-l border-red-600"
                >
                    Signup
                </a>
            </div>
        </div>
    </header>
    );
}