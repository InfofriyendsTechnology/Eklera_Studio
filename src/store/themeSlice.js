import { createSlice } from '@reduxjs/toolkit';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: prefersDark,
  },
  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark;
    },
    setDark(state, action) {
      state.isDark = action.payload;
    },
  },
});

export const { toggleTheme, setDark } = themeSlice.actions;
export const selectIsDark = (state) => state.theme.isDark;
export default themeSlice.reducer;
