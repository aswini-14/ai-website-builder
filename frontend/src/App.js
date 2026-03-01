import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ThemeToggle from "./components/ThemeToggle";
import Login from './pages/Login';
import Register from './pages/Register';
import Builder from './pages/Builder';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>

      <ThemeToggle />
    </Router>
  );
}

export default App;
