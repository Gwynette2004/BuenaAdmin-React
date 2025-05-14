import React, { useEffect, useState } from "react";
import CompileService from "../../service/CompileService";
import Swal from "sweetalert2";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";



// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Home = () => {
  const [userCount, setUserCount] = useState(0);
  const [concernCount, setConcernCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [concerns, setConcerns] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedMonth, setSelectedMonth] = useState("Yearly");

  const userId = CompileService.getUserId();

  useEffect(() => {
    if (userId) {
      retrieveConcerns();
      retrieveReservations();
      loadStats();
    } else {
      console.error("User ID not found. Please log in.");
    }
  }, [userId, selectedMonth]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const retrieveConcerns = async () => {
    try {
      const response = await fetch(
        `http://localhost/BuenaHub/api/get_concerns/${userId}`
      );
      const data = await response.json();
      if (data && data.data) {
        const sortedConcerns = data.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((concern) => ({
            ...concern,
            content:
              concern.content.length > 50
                ? concern.content.substring(0, 50) + "..."
                : concern.content,
          }));
        setConcerns(sortedConcerns.slice(0, 5));

        const categoryCounts = { Security: 0, Maintenance: 0, Others: 0 };
        sortedConcerns.forEach((concern) => {
          if (concern.concern.toLowerCase().includes("security"))
            categoryCounts.Security++;
          else if (concern.concern.toLowerCase().includes("maintenance"))
            categoryCounts.Maintenance++;
          else categoryCounts.Others++;
        });

        setPieChartData({
          labels: ["Security", "Maintenance", "Others"],
          datasets: [
            {
              data: [
                categoryCounts.Security,
                categoryCounts.Maintenance,
                categoryCounts.Others,
              ],
              backgroundColor: ["#d6cda4", "#393e46", "#3d8361"],
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching concerns:", error);
    }
  };

  const retrieveReservations = async () => {
    try {
      const response = await fetch(
        `http://localhost/BuenaHub/api/allreservation/${userId}`
      );
      const data = await response.json();
      if (data && data.data) {
        const filteredReservations =
          selectedMonth === "Yearly"
            ? data.data
            : data.data.filter(
                (reservation) =>
                  new Date(reservation.reservation_date).getMonth() ===
                  parseInt(selectedMonth)
              );
        setReservations(filteredReservations);

        const monthlyCounts = Array(12).fill(0);
        data.data.forEach((reservation) => {
          const month = new Date(reservation.reservation_date).getMonth();
          monthlyCounts[month]++;
        });

        setBarChartData({
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Reservations",
              data:
                selectedMonth === "Yearly"
                  ? monthlyCounts
                  : monthlyCounts.map((count, index) =>
                      index === parseInt(selectedMonth) ? count : 0
                    ),
              backgroundColor: "#668678",
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const loadStats = async () => {
    try {
      const userResponse = await CompileService.getCountUsers();
      setUserCount(userResponse.data?.user_count || 0);

      const concernResponse = await CompileService.getCountConcerns();
      setConcernCount(concernResponse.data?.concerns_count || 0);

      const reservationResponse = await CompileService.getCountReservations();
      setReservationCount(reservationResponse.data?.reservations_count || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const acceptReservation = async (reservationId) => {
    try {
      const response = await fetch(
        `http://localhost/BuenaHub/api/accept_reservation/${reservationId}`,
        {
          method: "PUT",
        }
      );
      const data = await response.json();
      if (data?.message) {
        Swal.fire({
          title: "Success",
          text: "Reservation accepted",
          icon: "success",
          timer: 2000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
        retrieveReservations();
      }
    } catch (error) {
      console.error("Error accepting reservation:", error);
    }
  };

  const rejectReservation = async (reservationId) => {
    try {
      await fetch(
        `http://localhost/BuenaHub/api/delete_reservation/${reservationId}`,
        {
          method: "POST",
        }
      );
      retrieveReservations();
    } catch (error) {
      console.error("Error rejecting reservation:", error);
    }
  };

const generatePDF = () => {
  const doc = new jsPDF();

  // Set a green theme color
  const themeColor = "#3d8361";

  // Add a title to the PDF
  doc.setFontSize(22);
  doc.setTextColor(themeColor);
  doc.text("Dashboard Report", 14, 20);

  // Add a horizontal line under the title
  doc.setDrawColor(themeColor);
  doc.setLineWidth(0.5);
  doc.line(14, 25, 200, 25);

  // Add user stats with a green theme
  doc.setFontSize(12);
  doc.setTextColor(0); // Black text
  doc.text(`Residents:`, 14, 35);
  doc.setTextColor(themeColor);
  doc.text(`${userCount}`, 50, 35);

  doc.setTextColor(0);
  doc.text(`Concerns:`, 14, 42);
  doc.setTextColor(themeColor);
  doc.text(`${concernCount}`, 50, 42);

  doc.setTextColor(0);
  doc.text(`Reservations:`, 14, 49);
  doc.setTextColor(themeColor);
  doc.text(`${reservationCount}`, 50, 49);

  // Add concerns table
  if (concerns.length > 0) {
    doc.setTextColor(0); // Black text
    doc.text("Concerns", 14, 60);
    doc.autoTable({
      startY: 65,
      head: [["Name", "Email", "Concern", "Date"]],
      body: concerns.map((concern) => [
        concern.name,
        concern.email,
        concern.content,
        concern.created_at,
      ]),
      headStyles: { fillColor: themeColor, textColor: "#ffffff" },
      bodyStyles: { textColor: 0 },
    });
  }

  // Add reservations table
  if (reservations.length > 0) {
    const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70;
    doc.setTextColor(0); // Black text
    doc.text("Reservations", 14, startY);
    doc.autoTable({
      startY: startY + 5,
      head: [["ID", "Facility", "Date", "Time", "Content", "Status"]],
      body: reservations.map((reservation) => [
        reservation.reservation_id,
        reservation.facility_name,
        reservation.reservation_date,
        reservation.reservation_time,
        reservation.content,
        reservation.status,
      ]),
      headStyles: { fillColor: themeColor, textColor: "#ffffff" },
      bodyStyles: { textColor: 0 },
    });
  }

  // Save the PDF
  doc.save("dashboard_report.pdf");
};

  return (
    <div className="d-flex" id="wrapper">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div
        id="page-content-wrapper"
        style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent mb-20 mt-2 px-4">
          <div className="d-flex align-items-center">
            <i
              className="fas fa-align-left primary-text fs-4 me-3"
              id="menu-toggle"
            ></i>
            <h2 className="fs-2 m-0">Dashboard</h2>
          </div>
        </nav>

        <div className="container-fluid px-4">
          <div className="row mb-4">
            <div className="col-auto">
              <select
                className="form-select"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                <option value="Yearly">Yearly</option>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <button className="btn btn-primary" onClick={generatePDF}>
                Generate PDF
              </button>
            </div>
          </div>

          <div className="row justify-content-center my-4">
            <div className="col-12 col-sm-6 col-lg-4 p-2">
              <div className="box shadow p-4 bg-white d-flex justify-content-around align-items-center rounded">
                <div>
                  <h3 className="fs-2">{userCount}</h3>
                  <p className="fs-5">Residents</p>
                </div>
                <i className="bx bx-male-female fs-1 primary-text border rounded-full secondary-bg p-3"></i>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4 p-2">
              <div className="box shadow p-4 bg-white d-flex justify-content-around align-items-center rounded">
                <div>
                  <h3 className="fs-2">{concernCount}</h3>
                  <p className="fs-5">Concerns</p>
                </div>
                <i className="bx bxs-bell-ring fs-1 primary-text border rounded-full secondary-bg p-3"></i>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4 p-2">
              <div className="box shadow p-4 bg-white d-flex justify-content-around align-items-center rounded">
                <div>
                  <h3 className="fs-2">{reservationCount}</h3>
                  <p className="fs-5">Reservations</p>
                </div>
                <i className="bx bxs-bookmark-star fs-1 primary-text border rounded-full secondary-bg p-3"></i>
              </div>
            </div>
          </div>

          <div className="row g-3 my-2">
            <div className="col-md-7">
              <div className="p-3 bg-white shadow rounded">
                {barChartData.datasets && barChartData.datasets.length > 0 ? (
                  <Bar data={barChartData} />
                ) : (
                  <p>Loading bar chart...</p>
                )}
              </div>
            </div>

            <div className="col-md-5">
              <div className="p-3 bg-white shadow rounded">
                {barChartData.datasets && barChartData.datasets.length > 0 ? (
                  <Pie data={pieChartData} />
                ) : (
                  <p>Loading pie chart...</p>
                )}
              </div>
            </div>
          </div>

          <div className="row g-4 my-4">
            <div className="col-md-5 col-sm-12">
              <a
                href="/concerns"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="p-3 bg-white shadow rounded"
                  style={{
                    height: "500px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3 className="fs-5 mb-3">Concerns</h3>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <table className="table bg-white rounded shadow-sm table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Concern</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {concerns.map((concern, index) => (
                          <tr key={index}>
                            <td>{concern.name}</td>
                            <td>{concern.email}</td>
                            <td>{concern.concern}</td>
                            <td>{concern.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </a>
            </div>

            <div className="col-md-7 col-sm-12">
              <a
                href="/reservations"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="p-3 bg-white shadow rounded"
                  style={{
                    height: "500px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3 className="fs-5 mb-3">Reservations</h3>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <table className="table bg-white rounded shadow-sm table-hover mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Facility</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Content</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((reservation, index) => (
                          <tr key={index}>
                            <td>{reservation.reservation_id}</td>
                            <td>{reservation.facility_name}</td>
                            <td>{reservation.reservation_date}</td>
                            <td>{reservation.reservation_time}</td>
                            <td>{reservation.content}</td>
                            <td>{reservation.status}</td>
                            <td>
                              <button
                                onClick={() =>
                                  acceptReservation(reservation.reservation_id)
                                }
                                className="btn btn-success btn-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  rejectReservation(reservation.reservation_id)
                                }
                                className="btn btn-danger btn-sm"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
