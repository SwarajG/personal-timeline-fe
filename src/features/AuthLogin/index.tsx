import { useEffect, useState } from "react";
import { fetchUserProfile, logout } from "../../api/index";

export default function GoogleLogin() {
  const [user, setUser] = useState<any>(null);
  const onGoogleAuthClick = () => {
    window.location.href = "http://localhost:3001/v1/auth/google";
  };

  const onLogOutClick = () => {
    logout().then(() => {
      setUser(null);
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    fetchUserProfile().then((user) => {
      setUser(user);
    });
  };

  return (
    <div>
      {!user?.id && <button onClick={onGoogleAuthClick}>Google login</button>}
      <p>
        {user?.firstName} {user?.lastName}
      </p>
      {user?.id && <button onClick={onLogOutClick}>Logout</button>}
    </div>
  );
}
