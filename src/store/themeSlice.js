import { createSlice } from '@reduxjs/toolkit';

const LS_KEY = 'eklera_theme';

// ─── Read initial theme ────────────────────────────────────────────────────────
// Priority: localStorage → system preference
function getInitialDark() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved !== null) return saved === 'dark';
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ─── Apply class to <html> ─────────────────────────────────────────────────────
function applyClass(isDark) {
  const html = document.documentElement;
  html.classList.remove('dark-mode', 'light-mode');
  html.classList.add(isDark ? 'dark-mode' : 'light-mode');
}

// Apply IMMEDIATELY (before React renders) to prevent flash-of-wrong-theme
const initialIsDark = getInitialDark();
applyClass(initialIsDark);

// ─── Slice ─────────────────────────────────────────────────────────────────────
const themeSlice = createSlice({
  name: 'theme',
  initialState: { isDark: initialIsDark },
  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark;
      applyClass(state.isDark);
      try { localStorage.setItem(LS_KEY, state.isDark ? 'dark' : 'light'); } catch {}
    },
    setDark(state, action) {
      state.isDark = action.payload;
      applyClass(state.isDark);
      try { localStorage.setItem(LS_KEY, action.payload ? 'dark' : 'light'); } catch {}
    },
  },
});

export const { toggleTheme, setDark } = themeSlice.actions;
export const selectIsDark = (state) => state.theme.isDark;
export default themeSlice.reducer;
