"use client";

import { useState } from "react";

export type NavLink = {
    text: string;
    href?: string;
    sublinks?: NavLink[];
};

export function CombineNavLinks(...links: NavLink[]) {
    return links;
}

export function CreateNavLink(text: string, href?: string, sublinks?: NavLink[]): NavLink {
    return (
        {
            text,
            href,
            sublinks
        }
    );
}

export function RenderNavLinks({ links }: { links: NavLink[] }) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
        <>
            {links.map((x, i) => (
                <RenderNavLink
                    key={i}
                    link={x}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                />
            ))}
        </>
    );
}

export function RenderNavLink({
    link,
    openDropdown,
    setOpenDropdown
}: {
    link: NavLink;
    openDropdown: string | null;
    setOpenDropdown: (val: string | null) => void;
}) {
    return link.sublinks ? (
        <div
            className="relative group"
            onMouseEnter={() => setOpenDropdown(link.text)}
            onMouseLeave={() => setOpenDropdown(null)}
        >
            <button className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-700 hover:to-red-800 transition-all duration-300 ease-in-out transform hover:scale-105">
                <span>{link.text}</span>
                <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${openDropdown === link.text ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {openDropdown === link.text && (
                <>
                    {/* Invisible bridge to prevent dropdown from closing when moving mouse */}
                    <div className="absolute left-0 top-full w-full h-2 bg-transparent z-40"></div>
                    <div className="absolute left-0 top-full pt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden min-w-max">
                        <div className="py-2">
                            {link.sublinks.map((sub, j) => (
                                <a
                                    key={j}
                                    href={sub.href}
                                    className="flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 transition-all duration-200 whitespace-nowrap font-medium border-l-4 border-transparent hover:border-red-500"
                                >
                                    <span className="flex-shrink-0">{sub.text}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    ) : (
        <a
            href={link.href}
            className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-700 hover:to-red-800 transition-all duration-300 ease-in-out transform hover:scale-105 whitespace-nowrap"
        >
            {link.text}
        </a>
    );
}