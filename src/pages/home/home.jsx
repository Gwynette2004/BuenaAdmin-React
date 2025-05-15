import React, { useEffect, useState } from "react";
import CompileService from "../../service/CompileService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // Import useNavigate
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div id="wrapper" className="flex">
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
          <button
            onClick={logout} // Attach the logout function
            className="list-group-item list-group-item-action bg-transparent text-danger fw-bold"
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <i className="fas fa-power-off me-2"></i>Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        id="page-content-wrapper"
        style={{
          marginLeft: isSidebarOpen ? 250 : 0,
          width: isSidebarOpen ? "calc(100% - 250px)" : "100%",
          transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4">
          <div className="d-flex align-items-center">
            <i
              className="fas fa-align-left primary-text fs-4 me-3"
              id="menu-toggle"
              onClick={toggleSidebar}
              style={{ cursor: "pointer" }}
            ></i>
            <h2 className="fs-2 m-0">Dashboard</h2>
          </div>
        </nav>

        <div className="px-4">
          {/* Top Controls */}
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <select
                className="border border-gray-300 rounded px-3 py-2"
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
            <div>
              <button
                className="bg-green-800 hover:bg-[#3a534a] text-white font-bold py-2 px-4 rounded"
                onClick={generatePDF}
              >
                Generate PDF
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex flex-wrap justify-center my-4">
            <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
              <div className="shadow p-4 bg-white flex justify-around items-center rounded">
                <div>
                  <h3 className="text-2xl">{userCount}</h3>
                  <p className="text-lg">Residents</p>
                </div>
                <i className="bx bx-male-female text-4xl text-[#4a6c5e] border rounded-full bg-[#cfcfcf] p-3"></i>
              </div>
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
              <div className="shadow p-4 bg-white flex justify-around items-center rounded">
                <div>
                  <h3 className="text-2xl">{concernCount}</h3>
                  <p className="text-lg">Concerns</p>
                </div>
                <i className="bx bxs-bell-ring text-4xl text-[#4a6c5e] border rounded-full bg-[#cfcfcf] p-3"></i>
              </div>
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/3 p-2">
              <div className="shadow p-4 bg-white flex justify-around items-center rounded">
                <div>
                  <h3 className="text-2xl">{reservationCount}</h3>
                  <p className="text-lg">Reservations</p>
                </div>
                <i className="bx bxs-bookmark-star text-4xl text-[#4a6c5e] border rounded-full bg-[#cfcfcf] p-3"></i>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-2">
            <div className="md:col-span-7">
              <div className="p-3 bg-white shadow rounded h-[450px]">
                {barChartData.datasets.length > 0 ? (
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                    }}
                  />
                ) : (
                  <p>Loading bar chart...</p>
                )}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="p-3 bg-white shadow rounded h-[450px]">
                {pieChartData.datasets.length > 0 ? (
                  <Pie
                    data={pieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { boxWidth: 15 },
                        },
                      },
                    }}
                  />
                ) : (
                  <p>Loading pie chart...</p>
                )}
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4">
            <div className="md:col-span-5">
              <a href="/concerns" className="no-underline text-current">
                <div className="p-3 bg-white shadow rounded h-[500px] flex flex-col">
                  <h3 className="text-lg mb-3">Concerns</h3>
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full bg-white rounded shadow-sm hover:shadow-md mb-0">
                      <thead className="bg-[#4a6c5e] text-white text-center">
                        <tr>
                          <th className="py-2">Name</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Concern</th>
                          <th className="py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-left text-sm">
                        {concerns.map((concern, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-2">{concern.name}</td>
                            <td className="py-2 px-2">{concern.email}</td>
                            <td className="py-2 px-2">{concern.concern}</td>
                            <td className="py-2 px-2">{concern.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </a>
            </div>

            <div className="md:col-span-7">
              <a href="/reservations" className="no-underline text-current">
                <div className="p-3 bg-white shadow rounded h-[500px] flex flex-col">
                  <h3 className="text-lg mb-3">Reservations</h3>
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full bg-white rounded shadow-sm hover:shadow-md mb-0">
                      <thead className="bg-[#4a6c5e] text-white text-center">
                        <tr>
                          <th className="py-2">ID</th>
                          <th className="py-2">Facility</th>
                          <th className="py-2">Date</th>
                          <th className="py-2">Time</th>
                          <th className="py-2">Content</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-left text-sm">
                        {reservations.map((reservation, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-2">
                              {reservation.reservation_id}
                            </td>
                            <td className="py-2 px-2">
                              {reservation.facility_name}
                            </td>
                            <td className="py-2 px-2">
                              {reservation.reservation_date}
                            </td>
                            <td className="py-2 px-2">
                              {reservation.reservation_time}
                            </td>
                            <td className="py-2 px-2">
                              {reservation.content}
                            </td>
                            <td className="py-2 px-2">{reservation.status}</td>
                            <td className="py-2 px-2">
                              <button
                                onClick={() =>
                                  acceptReservation(reservation.reservation_id)
                                }
                                className="bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1 rounded"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  rejectReservation(reservation.reservation_id)
                                }
                                className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded ml-2"
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
