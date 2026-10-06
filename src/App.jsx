import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { RedirectRoute } from './components/RedirectRoute';
import Home from './components/Home';
import Navbar from './components/Navbar';

function AppLayout() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login';

  return (
    <div className={`app-shell ${isAuthRoute ? 'app-shell--auth' : 'app-shell--content'}`}>
      {!isAuthRoute && <Navbar />}

      <Routes>
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
          path='/login/:state'
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
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
