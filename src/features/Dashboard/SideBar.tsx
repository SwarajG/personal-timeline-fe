import { Sidebar } from "flowbite-react";
import {
  MdDashboard,
  MdOutlineInbox,
  MdPerson
} from "react-icons/md";

export default function SideBarComponent() {
  return (
    <Sidebar aria-label="sidebar">
      <Sidebar.Items className="rounded p-2 h-screen w-[232px] fixed">
        <Sidebar.ItemGroup>
          <Sidebar.Item href="#" icon={MdDashboard}>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item href="#" icon={MdOutlineInbox} label="3">
            Inbox
          </Sidebar.Item>
          <Sidebar.Item href="#" icon={MdPerson}>
            Users
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
