import { createSlice } from '@reduxjs/toolkit'

export const { actions, reducer } = createSlice({
  name: 'postList',
  initialState: {
    postList: []
  },
  reducers: {
    setPostList: (state, { payload }) => {
      state.postList = payload;
    },
    deletePost: (state, { payload }) => {
      state.postList = state.postList.filter(({ id }) => id !== payload);
    },
    addPost: (state, { payload }) => {
      state.postList = [payload, ...state.postList];
    }
  },
})

export const { setPostList, deletePost, addPost } = actions

export default reducer;