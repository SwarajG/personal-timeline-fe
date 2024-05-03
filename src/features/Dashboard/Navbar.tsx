import { useDispatch, useSelector } from "react-redux";
import { MdDarkMode, MdOutlineDarkMode } from "react-icons/md";
import { Avatar, Dropdown, Navbar } from "flowbite-react";

import { getIsDarkModeOn } from "../../globalSlice/selector";
import { setIsDarkModeOn } from "../../globalSlice/appSlice";

export default function NavbarComponent() {
  const dispatch = useDispatch();
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
    <Navbar fluid className="fixed w-full">
      <Navbar.Brand href="https://flowbite-react.com">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Flowbite React
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar
              alt="User settings"
              img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
              rounded
            />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm">Bonnie Green</span>
            <span className="block truncate text-sm font-medium">
              name@flowbite.com
            </span>
          </Dropdown.Header>
          <Dropdown.Item>Dashboard</Dropdown.Item>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Item>Earnings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="#" active>
          Home
        </Navbar.Link>
        <Navbar.Link href="#">About</Navbar.Link>
        <Navbar.Link href="#">Services</Navbar.Link>
        <Navbar.Link href="#">Pricing</Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link>
        <Navbar.Link>
          <div className="flex items-center h-5">
            {isDarkModeOn ? (
              <MdDarkMode onClick={onDarkModeClick} />
            ) : (
              <MdOutlineDarkMode onClick={onDarkModeClick} />
            )}
          </div>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
