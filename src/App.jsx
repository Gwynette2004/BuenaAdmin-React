import { useState } from "react";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Concerns from "./pages/concerns/concerns";
import Reservations from "./pages/reservation/reservation";
import Invoice from "./pages/invoice/invoice";
import Residents from "./pages/residents/residents";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/concerns" element={<Concerns/>} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/residents" element={<Residents />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
