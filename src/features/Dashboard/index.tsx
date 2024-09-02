import Navbar from "./Navbar";
// import SideBarComponent from "./SideBar";

export default function Dashboard({ children }) {
  return (
    <div>
      <div className="flex justify-center">
        <Navbar />
      </div>
      <div className="flex bg-slate-50 pt-14 min-h-screen container mx-auto px-4">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
