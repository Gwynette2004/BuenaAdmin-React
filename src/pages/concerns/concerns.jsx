import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./concerns.css";
import "bootstrap/dist/css/bootstrap.min.css";
import CompileService from "../../service/CompileService";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Concerns = () => {
  const [concerns, setConcerns] = useState([]);
  const [filteredConcerns, setFilteredConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [preview, setPreview] = useState("");
  const [displayTable, setDisplayTable] = useState(false);
  const [selectedConcerns, setSelectedConcerns] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    const userId = CompileService.getUserId(); // Use CompileService to get the user ID
    if (!userId) {
      alert("You need to log in first.");
      window.location.href = "/login"; // Redirect to login page
      return;
    }
    setUserId(userId);
    retrieveConcerns();
  }, []);

  const retrieveConcerns = async () => {
    try {
      const response = await axios.get(
        "http://localhost/BuenaHub/api/get_concerns"
      );
      if (response.data && response.data.data) {
        const sortedConcerns = response.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setConcerns(sortedConcerns);
        setFilteredConcerns(sortedConcerns);
      } else {
        console.error("No concerns found or incorrect response structure");
      }
    } catch (error) {
      console.error("Error fetching concerns:", error);
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      Swal.fire({
        title: "Warning!",
        text: "File is too large. Maximum size is 5MB.",
        icon: "warning",
        position: "top-end",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    setFileToUpload(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const uploadFile = async () => {
    if (!content) {
      Swal.fire({
        title: "Info!",
        text: "Please fill in the required fields.",
        icon: "info",
        position: "top-end",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("user_id", userId);
    if (fileToUpload) formData.append("file", fileToUpload);

    try {
      await axios.post("http://localhost/BuenaHub/api/addPost", formData);
      Swal.fire({
        title: "Success!",
        text: "Upload successful.",
        icon: "success",
        position: "top-end",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      setIsFormVisible(false);
      retrieveConcerns();
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire({
        title: "Error!",
        text: "Error uploading file. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again!",
      });
    }
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase();
    if (term) {
      setFilteredConcerns(
        concerns.filter(
          (concern) =>
            concern.fullname.toLowerCase().includes(term) ||
            concern.concern.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredConcerns([...concerns]);
    }
  };

  const showTable = (concernType) => {
    setSelectedConcerns(concernType);
    setDisplayTable(true);
    setFilteredConcerns(
      concerns.filter(
        (concern) => concern.concern.toLowerCase() === concernType.toLowerCase()
      )
    );
  };

  return (
    <>
      <link
        href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
      />

      <div className="d-flex" id="wrapper">
        <div
          className="bg-white"
          id="sidebar-wrapper"
          style={{ position: "fixed", height: "100vh", width: "250px" }}
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
          style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
        >
          <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4">
            <div className="d-flex align-items-center w-100">
              <div className="d-flex align-items-center">
                <i
                  className="fas fa-align-left primary-text fs-4 me-3"
                  id="menu-toggle"
                ></i>
                <h2 className="fs-2 m-0">Concerns</h2>
              </div>
              <div className="ms-auto">
                <button className="btn" onClick={() => setIsFormVisible(true)}>
                  Post Update
                </button>
              </div>
            </div>
          </nav>

          <div className="container-fluid px-4">
            <div className="row g-3 mt-9">
              <div className="col-md-4">
                <button
                  className={`btn w-100 ${
                    selectedConcerns === "security" ? "selected-btn" : ""
                  }`}
                  onClick={() => showTable("security")}
                >
                  Security
                </button>
              </div>
              <div className="col-md-4">
                <button
                  className={`btn w-100 ${
                    selectedConcerns === "maintenance" ? "selected-btn" : ""
                  }`}
                  onClick={() => showTable("maintenance")}
                >
                  Maintenance
                </button>
              </div>
              <div className="col-md-4">
                <button
                  className={`btn w-100 ${
                    selectedConcerns === "others" ? "selected-btn" : ""
                  }`}
                  onClick={() => showTable("others")}
                >
                  Others
                </button>
              </div>
            </div>

            {displayTable && (
              <div className="mt-4">
                <div
                  className="table-responsive table-scroll"
                  style={{
                    position: "relative",
                    height: "740px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                  }}
                >
                  <table className="table table-bordered custom-table">
                    <thead className="head">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>House #</th>
                        <th>Concerns</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConcerns.map((concern, index) => (
                        <tr key={index}>
                          <td>{concern.name}</td>
                          <td>{concern.email}</td>
                          <td>{concern.house_number || "N/A"}</td>
                          <td>{concern.concern}</td>
                          <td>
                            <button
                              className="btn"
                              onClick={() => setSelectedConcern(concern)}
                            >
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

            {selectedConcern && (
              <div
                className="modal-backdrop"
                onClick={() => setSelectedConcern(null)}
              >
                <div className="modals" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Concern Details</h5>
                        <button
                          type="button"
                          className="close-button"
                          onClick={() => setSelectedConcern(null)}
                          aria-label="Close"
                        >
                          <i className="bx bx-x"></i>
                        </button>
                      </div>
                      <div className="modal-body">
                        <div className="details">
                          <div className="label">Name:</div>
                          <div className="content">{selectedConcern.name}</div>
                        </div>
                        <div className="details">
                          <div className="label">Concern:</div>
                          <div className="content">
                            {selectedConcern.concern}
                          </div>
                        </div>
                        <div className="details">
                          <div className="label">House#:</div>
                          <div className="content">
                            {selectedConcern.house_number}
                          </div>
                        </div>
                        <div className="details messages-section">
                          <div className="label">Messages:</div>
                          <div className="message-box">
                            {selectedConcern.content}
                          </div>
                        </div>
                        <div className="detail created-at">
                          <div className="label">Created At:</div>
                          <div className="value">
                            {new Date(
                              selectedConcern.created_at
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isFormVisible && (
              <div className="modal">
                <div className="modal-contents">
                  <button
                    className="close-button"
                    onClick={() => setIsFormVisible(false)}
                    aria-label="Close"
                  >
                    <i className="bx bx-x"></i>
                  </button>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      uploadFile();
                    }}
                  >
                    <div className="form-container">
                      <input
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        required
                      />
                    </div>
                    <div className="form-container">
                      <label htmlFor="postImage">Upload Image:</label>
                      <input
                        type="file"
                        id="postImage"
                        name="file"
                        onChange={handleFileInput}
                      />
                    </div>
                    {preview && (
                      <div className="preview-container">
                        <img src={preview} alt="Image preview" />
                      </div>
                    )}
                    <div className="button-container">
                      <button type="submit">Create Post</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Concerns;
