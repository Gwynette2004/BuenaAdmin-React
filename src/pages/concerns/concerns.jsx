import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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

  useEffect(() => {
    const fetchUserId = async () => {
      if (!user_id) {
        try {
          const token = localStorage.getItem("jwt_token"); // Use the correct key
          console.log("Retrieved token from localStorage:", token); // Debugging log

          if (!token) {
            throw new Error("No authentication token found.");
          }

          console.log("Authorization header:", `Bearer ${token}`);

          const response = await axios.get("http://localhost/BuenaHub/api/get_user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data && response.data.user_id) {
            setUserId(response.data.user_id);
            localStorage.setItem("user_id", response.data.user_id);
          } else {
            console.error("Failed to fetch user_id from the backend.");
          }
        } catch (error) {
          if (error.response && error.response.status === 403) {
            console.error("Access forbidden: Please check your authentication.");
            Swal.fire({
              title: "Access Denied",
              text: "You are not authorized to access this resource.",
              icon: "error",
              confirmButtonText: "OK",
            }).then(() => {
              localStorage.removeItem("jwt_token"); // Use the correct key
              window.location.href = "/"; // Redirect to login page
            });
          } else {
            console.error("Error fetching user_id:", error);
          }
        }
      }
    };

    fetchUserId();
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
    setFileToUpload(null);
    setPreview("");
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setContent("");
    setFileToUpload(null);
    setPreview("");
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file && file.size > maxSize) {
      Swal.fire({
        title: "Warning!",
        text: "File is too large. Maximum size is 5MB.",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      return;
    }
    setFileToUpload(file);
    console.log("Selected file:", file); // Debugging log
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = (e) => {
    e.preventDefault();

    if (!content) {
      Swal.fire({
        title: "Info!",
        text: "Please fill in the required fields.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      return;
    }

    const formData = new FormData();
    formData.append("content", content); // Add content
    formData.append("user_id", user_id); // Add user_id
    if (fileToUpload) {
      formData.append("file", fileToUpload); // Add file if present
    }

    console.log("FormData content:", content); // Debugging log
    console.log("FormData user_id:", user_id); // Debugging log
    console.log("FormData file:", fileToUpload); // Debugging log

    axios
      .post("http://localhost/BuenaHub/api/addPost", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure correct content type
        },
      })
      .then((response) => {
        console.log("Upload response:", response.data); // Debugging log
        Swal.fire({
          title: "Success!",
          text: "Upload successful.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        closeForm();
        retrieveConcerns();
      })
      .catch((error) => {
        console.error("Error uploading file:", error); // Debugging log
        Swal.fire({
          title: "Error!",
          text: "Error uploading file. Please try again.",
          icon: "error",
          confirmButtonText: "Try Again!",
        });
      });
  };

  return (
    <div className="d-flex" id="wrapper">
      {/* Sidebar */}
      <div
        className="bg-white"
        id="sidebar-wrapper"
        style={{ position: "fixed", height: "100vh", width: 250 }}
      >
        <div className="sidebar-heading text-center py-4 primary-text fs-5 fw-bold border-bottom">
          BuenaVista
        </div>
        <div className="list-group list-group-flush my-1">
          <a
            href="/home"
            className="list-group-item list-group-item-action bg-transparent second-text active"
          >
            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
          </a>
          <a
            href="/invoice"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bxs-file me-2"></i>Invoice
          </a>
          <a
            href="/residents"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bx-male-female me-2"></i>Residents
          </a>
          <a
            href="/concerns"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bxs-bell-ring me-2"></i>Concerns
          </a>
          <a
            href="/reservations"
            className="list-group-item list-group-item-action bg-transparent second-text fw-bold"
          >
            <i className="bx bxs-bookmark-star me-2"></i>Reservations
          </a>
          <a
            href="#"
            className="list-group-item list-group-item-action bg-transparent text-danger fw-bold"
          >
            <i className="fas fa-power-off me-2"></i>Logout
          </a>
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
                    <form onSubmit={uploadFile}>
                      <div className="form-container p-3">
                        <input
                          id="content"
                          className="form-control mb-2"
                          placeholder="What's on your mind?"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                        />
                        <label htmlFor="postImage" className="form-label">
                          Upload Image:
                        </label>
                        <input
                          type="file"
                          id="postImage"
                          name="file"
                          className="form-control mb-2"
                          onChange={handleFileInput}
                        />
                        {preview && (
                          <div className="preview-container mb-2">
                            <img
                              src={preview}
                              alt="Preview"
                              className="img-fluid"
                              style={{ maxHeight: 200 }}
                            />
                          </div>
                        )}
                        <div className="button-container">
                          <button
                            type="submit"
                            className="btn btn-success w-100"
                          >
                            Create Post
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
