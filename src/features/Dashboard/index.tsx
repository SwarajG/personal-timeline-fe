// import Loader from '../../utils/Loader';
import Navbar from "./Navbar";

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <div className="flex mt-[69px]">
        <div className="w-1/4">Left panel</div>
        <div className="w-3/4">Right Panel</div>
      </div>
    </div>
  );
}
