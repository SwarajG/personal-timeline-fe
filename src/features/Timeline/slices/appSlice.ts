import { createSlice } from '@reduxjs/toolkit'

export const { actions, reducer } = createSlice({
  name: 'postList',
  initialState: {
    postList: []
  },
  reducers: {
    setPostList: (state, { payload }) => {
      state.postList = payload;
    }
  },
})

export const { setPostList } = actions

export default reducer;