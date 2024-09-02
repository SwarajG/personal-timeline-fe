import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePostByID, getPostsByUser } from '@api/post';
import { getPosts } from "./slices/selector";
import { setPostList, deletePost } from "./slices/appSlice";

export default function useTimeLine() {
  const posts = useSelector(getPosts);
  const [offset, setOffset] = useState<number>(0);
  const dispatch = useDispatch();

  useEffect(() => {
    getPostsByUser(offset).then((response) => {
      dispatch(setPostList(response.posts));
      setOffset((prev) => prev + response.posts.length);
    });
  }, [dispatch]);

  const onDeletePostClick = async (id: number) => {
    await deletePostByID(id);
    dispatch(deletePost(id));
  };

  return {
    posts,
    onDeletePostClick
  };
}