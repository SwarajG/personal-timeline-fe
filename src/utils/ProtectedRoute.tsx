import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchUserProfile } from "../api";
import { getUser } from "../globalSlice/selector";
import { setUser, updateUserData } from "../globalSlice/appSlice";

export const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      fetchUserProfile().then((userData) => {
        if (userData) {
          dispatch(setUser(userData));
          dispatch(updateUserData({ id: userData.id, picture: userData.picture }));
        } else {
          navigate("/");
        }
      });
    }
  }, []);

  if (!user) {
    return null;
  }

  return children;
};
