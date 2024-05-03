import Navbar from "./Navbar";
import SideBarComponent from "./SideBar";

export default function Dashboard({ children }) {
  return (
    <div>
      <Navbar />
      <div className="flex bg-slate-50 pt-14 h-screen">
        <div className="">
          <SideBarComponent />
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
