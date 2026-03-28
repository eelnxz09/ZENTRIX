import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  sidebarOpen: false,
  theme: 'dark',
  globalSearch: '',
  notifications: [],
  unreadCount: 0,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SEARCH':
      return { ...state, globalSearch: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, unreadCount: action.payload.filter(n => !n.read).length };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: state.notifications.filter(n => !n.read && n.id !== action.payload).length,
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [], unreadCount: 0 };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setSidebar = (open) => dispatch({ type: 'SET_SIDEBAR', payload: open });
  const setTheme = (theme) => dispatch({ type: 'SET_THEME', payload: theme });
  const setSearch = (query) => dispatch({ type: 'SET_SEARCH', payload: query });
  const setNotifications = (notifs) => dispatch({ type: 'SET_NOTIFICATIONS', payload: notifs });
  const markRead = (id) => dispatch({ type: 'MARK_READ', payload: id });

  const value = {
    ...state,
    toggleSidebar,
    setSidebar,
    setTheme,
    setSearch,
    setNotifications,
    markRead,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
