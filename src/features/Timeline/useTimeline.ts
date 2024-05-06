import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePostByID, getPostsByUser } from '@api/post';
import { getPosts } from "./slices/selector";
import { setPostList } from "./slices/appSlice";

export default function useTimeLine() {
  const posts = useSelector(getPosts);
  const dispatch = useDispatch();

  useEffect(() => {
    getPostsByUser().then((response) => {
      dispatch(setPostList(response.posts));
    });
  }, []);

  const onDeletePostClick = async (e, id) => {
    await deletePostByID(id);
  };

  return {
    posts,
    onDeletePostClick
  };
}