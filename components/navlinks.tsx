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
            className="relative"
            onMouseEnter={() => setOpenDropdown(link.text)}
            onMouseLeave={() => setOpenDropdown(null)}
        >
            <button className="hover:text-gray-900 transition-colors text-base text-gray-700">
                {link.text} ▼
            </button>
            {openDropdown === link.text && (
                <div
                    className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded shadow-lg z-50"
                >
                    {link.sublinks.map((sub, j) => (
                        <a
                            key={j}
                            href={sub.href}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                            {sub.text}
                        </a>
                    ))}
                </div>
            )}
        </div>
    ) : (
        <a
            href={link.href}
            className="hover:text-gray-900 transition-colors text-base text-gray-700"
        >
            {link.text}
        </a>
    );
}