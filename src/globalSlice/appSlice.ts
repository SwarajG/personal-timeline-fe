import { createSlice } from '@reduxjs/toolkit'

export const { actions, reducer } = createSlice({
  name: 'globalData',
  initialState: {
    user: null,
    isDarkModeOn: false
  },
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
    },
    setIsDarkModeOn: (state, { payload }) => {
      state.isDarkModeOn = payload;
    }
  },
})

export const { setUser, setIsDarkModeOn } = actions

export default reducer;