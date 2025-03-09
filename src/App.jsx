import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { RedirectRoute } from './components/RedirectRoute'
import Home from './components/Home'
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          
          <Navbar></Navbar>

          <div className='card'>
            <Routes>

              {/* Redireccion automática según estado del usuario */}
              <Route path='/' element={<RedirectRoute />} />

              <Route
                path='/login'
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              
              <Route
                path='/register'
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              <Route
                path='/home'
                element={<ProtectedRoute><Home></Home></ProtectedRoute>}
              >
              </Route>

            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App