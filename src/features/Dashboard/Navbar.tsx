import { useDispatch, useSelector } from "react-redux";
import {
  MdDarkMode,
  MdOutlineDarkMode,
  MdOutlineSettings,
  MdOutlineHome,
} from "react-icons/md";
import { Avatar, Dropdown, Navbar } from "flowbite-react";

import { getIsDarkModeOn, getUser } from "../../globalSlice/selector";
import { setIsDarkModeOn } from "../../globalSlice/appSlice";

export default function NavbarComponent() {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const isDarkModeOn = useSelector(getIsDarkModeOn);

  const onDarkModeClick = () => {
    if (isDarkModeOn) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    dispatch(setIsDarkModeOn(!isDarkModeOn));
  };

  return (
    <Navbar fluid className="fixed w-full container mx-auto px-4">
      <Navbar.Brand href="https://flowbite-react.com">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Personal Timeline
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={<Avatar alt="User settings" img={user.picture} rounded />}
        >
          <Dropdown.Header>
            <span className="block text-sm">{user.displayName}</span>
            <span className="block truncate text-sm font-medium">
              {user.email}
            </span>
          </Dropdown.Header>
          <Dropdown.Item>
            <MdOutlineHome className="mr-2" />
            Dashboard
          </Dropdown.Item>
          <Dropdown.Item>
            <MdOutlineSettings className="mr-2" />
            Settings
          </Dropdown.Item>
          <Dropdown.Item>
            <div className="flex items-center h-5 mr-2">
              {isDarkModeOn ? (
                <MdDarkMode onClick={onDarkModeClick} />
              ) : (
                <MdOutlineDarkMode onClick={onDarkModeClick} />
              )}
            </div>
            {isDarkModeOn ? "Light Mode" : "Dark Mode"}
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
    </Navbar>
  );
}
