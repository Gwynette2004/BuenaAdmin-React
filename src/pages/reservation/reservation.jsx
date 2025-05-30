import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./reservation.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link, useNavigate } from "react-router-dom";
import CompileService from "../../service/CompileService";



const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("All"); // Default to "All"
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    retrieveReservations();
  }, []);

  const retrieveReservations = async () => {
    try {
      const response = await axios.get(
        `http://localhost/BuenaHub/api/allreservation/`
      );
      if (response.data && response.data.data) {
        setReservations(response.data.data);
        setFilteredReservations(response.data.data); // Display all reservations by default
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };


  const filterByVenue = (venue) => {
    setSelectedVenue(venue);
    if (venue === "All") {
      setFilteredReservations(reservations); // Show all reservations
    } else {
      applyFilters();
    }
  };

  const applyFilters = () => {
    const term = searchTerm.toLowerCase();
    setFilteredReservations(
      reservations.filter(
        (reservation) =>
          (selectedVenue === "All" ||
            reservation.facility_name === selectedVenue) &&
          (reservation.facility_name.toLowerCase().includes(term) ||
            reservation.content.toLowerCase().includes(term))
      )
    );
  };

  const acceptReservation = async (reservationId, userId) => {
    try {
      const response = await axios.put(
        `http://localhost/BuenaHub/api/accept_reservation/${reservationId}`
      );
      if (response.data?.message) {
        Swal.fire({
          title: "Success",
          text: "Reservation accepted.",
          icon: "success",
          position: "top-end",
          toast: true,
          timer: 2000,
          showConfirmButton: false,
        });
        sendNotification(
          userId,
          `Your reservation with ID ${reservationId} has been accepted.`,
          "Reservation"
        );
        retrieveReservations();
      }
    } catch (error) {
      console.error("Error accepting reservation:", error);
      alert(
        `Error: ${error.response?.data?.message || "An unexpected error occurred"}`
      );
    }
  };

  const openRejectModal = (reservationId, userId) => {
    setSelectedReservationId(reservationId);
    setSelectedUserId(userId);
    setRejectionReason("");
    setIsModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsModalOpen(false);
  };

  const confirmRejection = () => {
    if (selectedReservationId && selectedUserId) {
      rejectReservation(selectedReservationId, selectedUserId, rejectionReason);
      closeRejectModal();
    }
  };

  const rejectReservation = async (reservationId, userId, reason) => {
    if (!reason.trim()) {
      Swal.fire({
        title: "Error",
        text: "Please provide a rejection reason.",
        icon: "warning",
      });
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost/BuenaHub/api/reject_reservation/${reservationId}`,
        { reason }
      );
      if (response.data) {
        Swal.fire({
          title: "Success",
          text: "Reservation rejected.",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
        });
        sendNotification(
          userId,
          `Your reservation (ID: ${reservationId}) has been rejected. Reason: ${reason}`,
          "Reservation"
        );
        retrieveReservations();
      }
    } catch (error) {
      console.error("Error rejecting reservation:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "An unexpected error occurred",
        icon: "error",
      });
    }
  };
  const logout = () => {
    CompileService.logout(); // Clear the JWT token
    Swal.fire({
      title: "Logged Out",
      text: "You have been successfully logged out.",
      icon: "success",
      confirmButtonText: "Okay",
    }).then(() => {
      navigate("/"); // Redirect to the login page
    });
  };
  const sendNotification = async (userId, description, type) => {
    try {
      await axios.post(
        `http://localhost/BuenaHub/api/notifications/${userId}`,
        {
          user_id: userId,
          description,
          notification_type: type,
        }
      );
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div className="d-flex" id="wrapper">
           {/* Sidebar */}
      <div
        className="bg-white"
        id="sidebar-wrapper"
        style={{
          position: "fixed",
          height: "100vh",
          width: isSidebarOpen ? 250 : 0,
          transition: "width 0.3s ease-in-out",
          overflow: "hidden",
        }}
      >
        <div className="sidebar-heading text-center py-4 success-text fs-5 fw-bold border-bottom">
          BuenaVista
        </div>
        <div className="list-group list-group-flush my-1">
          <Link
            to="/home"
            className="list-group-item list-group-item-action bg-transparent second-text active"
          >
            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
          </Link>
          <Link
            to="/invoice"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bxs-file me-2"></i>Invoice
          </Link>
          <Link
            to="/residents"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bx-male-female me-2"></i>Residents
          </Link>
          <Link
            to="/concerns"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bxs-bell-ring me-2"></i>Concerns
          </Link>
          <Link
            to="/reservations"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bxs-bookmark-star me-2"></i>Reservations
          </Link>
          <button
            onClick={logout} // Attach the logout function
            className="list-group-item list-group-item-action bg-transparent text-danger fw-bold"
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <i className="fas fa-power-off me-2"></i>Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div
        id="page-content-wrapper"
        style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4">
          <div className="d-flex align-items-center">
            <i
              className="fas fa-align-left primary-text fs-4 me-3"
              id="menu-toggle"
            ></i>
            <h2 className="fs-2 m-0">Reservations</h2>
          </div>
        </nav>

        <div className="container-fluid px-4">
          {/* Venue Selector */}
          <div className="row my-4">
            <div className="col-md-12 text-center">
              <div
                className="btn-group w-50"
                role="group"
                aria-label="Venue Selector"
              >
                {["All", "Hall", "Court", "Pool"].map((venue) => (
                  <button
                    key={venue}
                    type="button"
                    className={`btn custom-btn w-50 ${selectedVenue === venue ? "active" : ""}`}
                    onClick={() => filterByVenue(venue)}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="row my-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Reservation Requests</h5>
                    <div className="search-box">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search reservations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-container">
                    <div className="table-scroll">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th style={{ width: "8%" }}>ID</th>
                            <th style={{ width: "12%" }}>Facility</th>
                            <th style={{ width: "15%" }}>Date</th>
                            <th style={{ width: "12%" }}>Time</th>
                            <th style={{ width: "28%" }}>Content</th>
                            <th style={{ width: "10%" }}>Status</th>
                            <th style={{ width: "15%" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReservations.map((reservation) => (
                            <tr key={reservation.reservation_id}>
                              <td>#{reservation.reservation_id}</td>
                              <td>{reservation.facility_name}</td>
                              <td>
                                {new Date(
                                  reservation.reservation_date
                                ).toLocaleDateString()}
                              </td>
                              <td>{reservation.reservation_time}</td>
                              <td>{reservation.content}</td>
                              <td>
                                <span
                                  className={`status-badge status-${reservation.status.toLowerCase()}`}
                                >
                                  {reservation.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-success btn-sm px-3"
                                    onClick={() =>
                                      acceptReservation(
                                        reservation.reservation_id,
                                        reservation.user_id
                                      )
                                    }
                                  >
                                    <i className="bx bx-check me-1"></i>
                                    Accept
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm px-3"
                                    onClick={() =>
                                      openRejectModal(
                                        reservation.reservation_id,
                                        reservation.user_id
                                      )
                                    }
                                  >
                                    <i className="bx bx-x me-1"></i>
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {isModalOpen && (
        <div className="custom-modal">
          <div className="modal-content">
            <h5>Reject Reservation</h5>
            <p>Are you sure you want to reject this reservation?</p>
            <label htmlFor="rejectionReason">Rejection Reason:</label>
            <textarea
              id="rejectionReason"
              className="form-control"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeRejectModal}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmRejection}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;
