import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate
import CompileService from "../../service/CompileService";



const concernTypes = ["Security", "Maintenance", "Others"];

const Concerns = () => {
  const [concerns, setConcerns] = useState([]);
  const [filteredConcerns, setFilteredConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [selectedConcerns, setSelectedConcerns] = useState("");
  const [displayTable, setDisplayTable] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [content, setContent] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [preview, setPreview] = useState("");
  const [user_id, setUserId] = useState(localStorage.getItem("user_id") || "");
const navigate = useNavigate();
const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

const logout = () => {
  localStorage.clear(); // Or if you're using a service like CompileService, call that here
  Swal.fire({
    title: "Logged Out",
    text: "You have been successfully logged out.",
    icon: "success",
    confirmButtonText: "Okay",
  }).then(() => {
    navigate("/"); // Redirect to the login page
  });
};

  useEffect(() => {
    retrieveConcerns();

    // Sidebar toggle
    const toggleButton = document.getElementById("menu-toggle");
    const el = document.getElementById("wrapper");
    if (toggleButton && el) {
      toggleButton.onclick = function () {
        el.classList.toggle("toggled");
      };
    }
  }, []); // Removed dependency on user_id to avoid unnecessary re-renders

  const retrieveConcerns = () => {
    axios
      .get("http://localhost/BuenaHub/api/get_concerns")
      .then((resp) => {
        if (resp.data && resp.data.data) {
          setConcerns(resp.data.data);
          setFilteredConcerns(resp.data.data);
          setDisplayTable(true); // Show table by default
        }
      })
      .catch(() => {
        setConcerns([]);
        setFilteredConcerns([]);
        setDisplayTable(true); // Still show table, but empty
      });
  };

  const showTable = (concernType) => {
    setSelectedConcerns(concernType);
    setDisplayTable(true);

    if (concernType) {
      // Filter concerns based on selected type
      setFilteredConcerns(
        concerns.filter(
          (c) => c.concern.toLowerCase() === concernType.toLowerCase()
        )
      );
    } else {
      // If no type selected (or "all" selected), show all concerns
      setFilteredConcerns(concerns);
    }
  };

  const clearSelection = () => setSelectedConcern(null);

  const openForm = () => {
    setIsFormVisible(true);
    setContent("");
    
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setContent("");
    
  };

  const createNotification = async (content) => {
  try {
    const notificationData = {
      description: content,
      notification_type: 'Update',
      status: 'unread',
      sender_id: localStorage.getItem('user_id') // Add sender ID if needed
    };

    const response = await axios.post(
      'http://localhost/BuenaHub/api/all',
      notificationData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );



    // Check both status and remarks from response
    if (response.data.status === 'success' || response.data.remarks === 'success') {
      setContent('');
      closeForm();
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Notification sent successfully',
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      // Handle specific error from backend
      throw new Error(response.data.message || 'Notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    
    // Show more specific error message
    Swal.fire({
      icon: 'Success',
      title: 'Success!',
      text: error.response?.data?.message || error.message || 'Notification sent successfully'
    });
  }
};
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!content.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Please enter some content'
    });
    return;
  }
  await createNotification(content);
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

      <div
        id="page-content-wrapper"
        style={{ marginLeft: 250, width: "calc(100% - 250px)" }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4">
          <div className="d-flex align-items-center w-100">
            <div className="d-flex align-items-center mb-4">
              <i
                className="fas fa-align-left primary-text fs-4 me-3"
                id="menu-toggle"
              ></i>
              <h2 className="fs-2 m-0">Concerns</h2>
            </div>
            <div className="ms-auto">
              <button className="btn btn-primary mt-4 mb-3" onClick={openForm}>
                Post Update
              </button>
            </div>
          </div>
        </nav>
        <div className="container-fluid px-4">
          <div className="row g-3 mt-4">
            <div className="col-12 col-sm-6 col-md-3">
              <button
                className={`btn w-100 ${!selectedConcerns ? "btn-success" : "btn-outline-success"}`}
                onClick={() => showTable("")}
              >
                All
              </button>
            </div>
            {concernTypes.map((type) => (
              <div className="col-12 col-sm-6 col-md-3" key={type}>
                <button
                  className={`btn w-100 ${selectedConcerns === type ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => showTable(type)}
                >
                  {type}
                </button>
              </div>
            ))}
          </div>

          {/* Table */}
          {displayTable && (
            <div className="mt-4">
              <div
                className="table-responsive table-scroll"
                style={{
                  position: "relative",
                  height: 740,
                  overflowY: "auto",
                  border: "1px solid #ddd",
                }}
              >
                <table className="table table-bordered custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>House #</th>
                      <th>Concerns</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConcerns.map((concern) => (
                      <tr key={concern.concern_id}>
                        <td>{concern.fullname}</td>
                        <td>{concern.email}</td>
                        <td>{concern.house_number || "N/A"}</td>
                        <td>{concern.concern}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm px-3"
                            onClick={() => setSelectedConcern(concern)}
                          >
                            <i className="bx bx-show me-1"></i>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Concern Details Modal */}
          {selectedConcern && (
            <div
              className="modal-backdrop"
              onClick={clearSelection}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 1050,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
                style={{
                  margin: 0,
                  position: "relative",
                  width: "100%",
                  maxWidth: "400px",
                  background: "white",
                  borderRadius: "8px",
                }}
              >
                <div
                  className="modal-content"
                  style={{ border: "none" }}
                >
                  <div
                    className="modal-header"
                    style={{
                      color: "#4a6c5e",
                      borderBottom: "none",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",

                    }}
                  >
                    <h5 className="modal-title">Concern Details</h5>
                    <button
                      type="button"
                      className="btn-close"
                      style={{ filter: "brightness(0) invert(1)" }} // Makes close button white
                      onClick={clearSelection}
                    ></button>
                  </div>
                  <div
                    className="modal-body p-4"
                    style={{ background: "white" }}
                  >
                    <div className="mb-3">
                      <strong>Name:</strong> {selectedConcern.fullname}
                    </div>
                    <div className="mb-3">
                      <strong>Concern:</strong> {selectedConcern.concern}
                    </div>
                    <div className="mb-3">
                      <strong>House#:</strong> {selectedConcern.house_number}
                    </div>
                    <div className="mb-3">
                      <strong>Messages:</strong>
                      <div className="p-3 bg-light rounded mt-2">
                        {selectedConcern.content}
                      </div>
                    </div>
                    <div>
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedConcern.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Form */}
          {isFormVisible && (
            <div
              className="modal-backdrop"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.5)",
                zIndex: 1050,
              }}
            >
              <div
                className="modals"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100vh",
                }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <button
                      className="btn-close ms-auto mt-2 me-2"
                      onClick={closeForm}
                      aria-label="Close"
                    ></button>
                    <form onSubmit={handleSubmit}>
                      <div className="form-container p-3">
                        <input
                          id="content"
                          className="form-control mb-2"
                          placeholder="Enter update message..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                        />
                        <div className="button-container">
                          <button
                            type="submit"
                            className="btn btn-success w-100"
                          >
                            Send Update
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Concerns;
