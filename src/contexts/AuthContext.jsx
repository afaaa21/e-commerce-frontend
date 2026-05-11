import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const response = await api.post('/auth/login', { email, password })
    const { token, user } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } })
    return user
  }

  const register = async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const response = await api.post('/auth/register', { name, email, password })
    dispatch({ type: 'SET_LOADING', payload: false })
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (userData) => {
    const updated = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updated))
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
