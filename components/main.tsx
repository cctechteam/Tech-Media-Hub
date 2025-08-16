import { ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

export default function Main({ children }: { children?: ReactNode }) {
    return <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {children ? children : <></>}
    </main>
}

export function MainPage({ children }: { children?: ReactNode }) {
    return <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            {children ? children : <></>}
        </main>
        <Footer />
    </>
}