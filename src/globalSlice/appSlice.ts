import { createSlice } from '@reduxjs/toolkit'

export const { actions, reducer } = createSlice({
  name: 'globalData',
  initialState: {
    user: null,
    isDarkModeOn: false,
    userList: [],
    tags: []
  },
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
    },
    setIsDarkModeOn: (state, { payload }) => {
      state.isDarkModeOn = payload;
    },
    updateUserData: (state, { payload }) => {
      state.userList.push(payload);
    },
    setTags: (state, { payload }) => {
      state.tags = payload;
    }
  },
})

export const { setUser, setIsDarkModeOn, updateUserData, setTags } = actions

export default reducer;