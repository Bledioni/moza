import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/public/Home';
import Fustanet from '../pages/public/Fustanet';
import FustanDetails from '../pages/public/FustanDetails';
import Login from '../pages/staff/Login';
import Dashboard from '../pages/staff/Dashboard';
import Fustane from '../pages/staff/Fustane';
import DressProfile from '../pages/staff/DressProfile';
import DressTicket from '../pages/staff/DressTicket';
import Rezervime from '../pages/staff/Rezervime';
import Categories from '../pages/staff/Categories';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Kerkesat from '../pages/staff/Kerkesat';
import KerkesatEStatusi from '../pages/public/KerkesatEStatusi';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/fustanet" element={<Fustanet />} />
      <Route path="/fustanet/:id" element={<FustanDetails />} />

      <Route path="/staff/login" element={<Login />} />

      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/fustane"
        element={
          <ProtectedRoute>
            <Fustane />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/fustane/:id"
        element={
          <ProtectedRoute>
            <DressProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/fustane/:id/etikete"
        element={
          <ProtectedRoute>
            <DressTicket />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/rezervime"
        element={
          <ProtectedRoute>
            <Rezervime />
          </ProtectedRoute>
        }
      />

      <Route
  path="/staff/kerkesat"
  element={
    <ProtectedRoute>
      <Kerkesat />
    </ProtectedRoute>
  }
/>

<Route path="/statusi" element={<KerkesatEStatusi />} />



      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}