import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import Profile from "./pages/Profile.jsx";
import OpportunitiesSearch from "./pages/OpportunitiesSearch.jsx";
import CategoryList from "./pages/CategoryList.jsx";
import OpportunityDetail from "./pages/OpportunityDetail.jsx";
import ApplyForm from "./pages/ApplyForm.jsx";
import NotFound from "./pages/NotFound.jsx";

function getStoredAuth() {
  if (typeof window === "undefined") return { token: null, role: null };
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const role =
    localStorage.getItem("role") || sessionStorage.getItem("role");
  return { token, role };
}

function ProtectedRoute({ children }) {
  const { token } = getStoredAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function StudentRoute({ children }) {
  const { token, role } = getStoredAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { token, role } = getStoredAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/student" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/student"
          element={
              <StudentDashboard />
          }
        />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/opportunities" element={<OpportunitiesSearch />} />
        <Route path="/opportunities/:category" element={<CategoryList />} />
        <Route path="/opportunity/:id" element={<OpportunityDetail />} />
        <Route path="/opportunity/:id/apply" element={<ApplyForm />} />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

