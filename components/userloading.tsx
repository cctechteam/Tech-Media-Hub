import Footer from "./footer";
import Main from "./main";
import Navbar from "./navbar";


export default function UserLoading() {
    return (<>
        <Navbar />
        <Main>
            <p className="p-8 text-center text-gray-400 w-full">Loading user info...</p>
        </Main>
        <Footer />
    </>)
}