import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./reservation.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("Hall");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        applyFilters();
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const filterByVenue = (venue) => {
    setSelectedVenue(venue);
    applyFilters();
  };

  const applyFilters = () => {
    const term = searchTerm.toLowerCase();
    setFilteredReservations(
      reservations.filter(
        (reservation) =>
          reservation.facility_name === selectedVenue &&
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
      alert(`Error: ${error.response?.data?.message || "An unexpected error occurred"}`);
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

  const sendNotification = async (userId, description, type) => {
    try {
      await axios.post(`http://localhost/BuenaHub/api/notifications/${userId}`, {
        user_id: userId,
        description,
        notification_type: type,
      });
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <div className="d-flex" id="wrapper">
      {/* Sidebar */}
      <div className="bg-white" id="sidebar-wrapper" style={{ position: "fixed", height: "100vh", width: "250px" }}>
        <div className="sidebar-heading text-center py-4 primary-text fs-5 fw-bold border-bottom">BuenaVista</div>
        <div className="list-group list-group-flush my-1">
          <a href="/home" className="list-group-item list-group-item-action bg-transparent second-text active">
            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
          </a>
          <a href="/invoice" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className="bx bxs-file me-2"></i>Invoice
          </a>
          <a href="/residents" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className="bx bx-male-female me-2"></i>Residents
          </a>
          <a href="/concerns" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className="bx bxs-bell-ring me-2"></i>Concerns
          </a>
          <a href="/reservations" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className="bx bxs-bookmark-star me-2"></i>Reservations
          </a>
          <a href="#" className="list-group-item list-group-item-action bg-transparent text-danger fw-bold">
            <i className="fas fa-power-off me-2"></i>Logout
          </a>
        </div>
      </div>

      {/* Page Content */}
      <div id="page-content-wrapper" style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}>
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4">
          <div className="d-flex align-items-center">
            <i className="fas fa-align-left primary-text fs-4 me-3" id="menu-toggle"></i>
            <h2 className="fs-2 m-0">Reservations</h2>
          </div>
        </nav>

        <div className="container-fluid px-4">
          {/* Venue Selector */}
          <div className="row my-4">
            <div className="col-md-12 text-center">
              <div className="btn-group w-50" role="group" aria-label="Venue Selector">
                {["Hall", "Court", "Pool"].map((venue) => (
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
                            <th style={{ width: '8%' }}>ID</th>
                            <th style={{ width: '12%' }}>Facility</th>
                            <th style={{ width: '15%' }}>Date</th>
                            <th style={{ width: '12%' }}>Time</th>
                            <th style={{ width: '28%' }}>Content</th>
                            <th style={{ width: '10%' }}>Status</th>
                            <th style={{ width: '15%' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReservations.map((reservation) => (
                            <tr key={reservation.reservation_id}>
                              <td>#{reservation.reservation_id}</td>
                              <td>{reservation.facility_name}</td>
                              <td>{new Date(reservation.reservation_date).toLocaleDateString()}</td>
                              <td>{reservation.reservation_time}</td>
                              <td>{reservation.content}</td>
                              <td>
                                <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
                                  {reservation.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-success btn-sm px-3"
                                    onClick={() => acceptReservation(reservation.reservation_id, reservation.user_id)}
                                  >
                                    <i className="bx bx-check me-1"></i>
                                    Accept
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm px-3"
                                    onClick={() => openRejectModal(reservation.reservation_id, reservation.user_id)}
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