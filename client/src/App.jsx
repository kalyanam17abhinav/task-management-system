import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react'
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/" element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
