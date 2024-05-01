import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, logout } from "../../api/index";
import { setUser } from "../../globalSlice/appSlice";
import { getUser } from "../../globalSlice/selector";
import Loader from "../../utils/Loader";

export default function GoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onGoogleAuthClick = () => {
    window.location.href = "http://localhost:3001/v1/auth/google";
  };

  const onLogOutClick = () => {
    logout().then(() => {
      dispatch(setUser(null));
      navigate("/");
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchUserProfile().then((user) => {
      dispatch(setUser(user));
      navigate("/dashboard");
    });
  }, [dispatch, navigate]);

  if (!isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {!user?.id && <Button onClick={onGoogleAuthClick}>Google login</Button>}
      <p>
        {user?.firstName} {user?.lastName}
      </p>
      {user?.id && <button onClick={onLogOutClick}>Logout</button>}
    </div>
  );
}
