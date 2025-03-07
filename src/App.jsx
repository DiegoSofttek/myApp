import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
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
              <Route
                path='/login'
                element={<Login></Login>}
              >
              </Route>

              <Route
                path='/register'
                element={<Register></Register>}
              >
              </Route>

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