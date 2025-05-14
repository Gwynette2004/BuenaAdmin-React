import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const billTypes = ['electric', 'water', 'cusa', 'payment'];

const Invoice = () => {
  const [selectedBill, setSelectedBill] = useState('');
  const [displayTable, setDisplayTable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allBill, setAllBill] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBillType, setSelectedBillType] = useState('');
  const [years, setYears] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedBillImage, setSelectedBillImage] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    retrieveUsers();
    allBills();
    initializeYears();
    // eslint-disable-next-line
  }, []);

  const retrieveUsers = async () => {
    try {
      const resp = await axios.get('http://localhost/BuenaHub/api/allusers');
      if (resp.data && resp.data.data) {
        const filtered = resp.data.data.filter(user => !user.archived);
        setUsers(filtered);
        setFilteredUsers(filtered);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const allBills = async () => {
    try {
      const resp = await axios.get('http://localhost/BuenaHub/api/all_payment');
      if (resp.data && resp.data.data) {
        const filtered = resp.data.data.filter(bill => !bill.user?.archived);
        setAllBill(filtered);
        setFilteredBills(filtered);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const initializeYears = () => {
    const currentYear = new Date().getFullYear();
    const yearsArr = [];
    for (let year = currentYear; year >= currentYear - 10; year--) {
      yearsArr.push(year);
    }
    setYears(yearsArr);
  };

  const filterBills = () => {
    setFilteredBills(
      allBill.filter((bill) => {
        const billDate = new Date(bill.created_at);
        const isMonthMatch =
          selectedMonth === ''
            ? true
            : billDate.getMonth() === months.indexOf(selectedMonth);
        const isYearMatch =
          selectedYear === '' ? true : billDate.getFullYear() === +selectedYear;
        const isBillTypeMatch =
          selectedBillType === '' ? true : bill.bill_type === selectedBillType;
        return isMonthMatch && isYearMatch && isBillTypeMatch;
      })
    );
  };

  useEffect(() => {
    filterBills();
    // eslint-disable-next-line
  }, [selectedMonth, selectedYear, selectedBillType, allBill]);

  const showTable = (billType) => {
    setSelectedBill(billType);
    setDisplayTable(true);
    setFilteredUsers([...users]);
    setSearchTerm('');
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users
        .filter(user => !user.archived)
        .filter(user => user.fullname.toLowerCase().includes(term))
    );
  };

  const openUploadModal = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setUploadedFile(null);
    setSelectedBill('');
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const submitBillForm = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedBill || !uploadedFile) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill in all required fields',
        icon: 'error',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('user_id', selectedUser.user_id);
    formData.append('bill_type', selectedBill);
    formData.append('payment_img', uploadedFile);
  
    try {
      // Upload the bill
      const response = await axios.post('http://localhost/BuenaHub/api/billing', formData);
      
      if (response.data) {
        // Send notification to user
        await sendNotification(
          selectedUser.user_id,
          `A new ${selectedBill} bill has been uploaded for your review.`,
          'Billing'
        );
  
        // Show success message
        Swal.fire({
          title: 'Success',
          text: 'Bill uploaded and notification sent',
          icon: 'success',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false
        });
  
        // Reset form and refresh data
        closeModal();
        allBills();
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to upload bill',
        icon: 'error',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };
  

  const payment = (bill) => {
    setSelectedBillImage(bill.payment_img);
    setIsImageModalVisible(true);
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
    setSelectedBillImage('');
  };

  // Sidebar toggle (optional, for menu icon)
  useEffect(() => {
    const toggleButton = document.getElementById("menu-toggle");
    const el = document.getElementById("wrapper");
    if (toggleButton && el) {
      toggleButton.onclick = function () {
        el.classList.toggle("toggled");
      };
    }
  }, []);



  // Add this function after your existing functions
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
      <div className="bg-white" id="sidebar-wrapper" style={{ position: 'fixed', height: '100vh', width: 250 }}>
        <div className="sidebar-heading text-center py-4 success-text fs-5 fw-bold border-bottom">BuenaVista</div>
        <div className="list-group list-group-flush my-1">
          <a href="/home" className="list-group-item list-group-item-action bg-transparent second-text active">
            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
          </a>
          <a href="/invoice" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className='bx bxs-file me-2'></i>Invoice
          </a>
          <a href="/residents" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className='bx bx-male-female me-2'></i>Residents
          </a>
          <a href="/concerns" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className='bx bxs-bell-ring me-2'></i>Concerns
          </a>
          <a href="/reservations" className="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i className='bx bxs-bookmark-star me-2'></i>Reservations
          </a>
          <a href="#" className="list-group-item list-group-item-action bg-transparent text-danger fw-bold">
            <i className="fas fa-power-off me-2"></i>Logout
          </a>
        </div>
      </div>
      <div id="page-content-wrapper" style={{ marginLeft: 250, width: 'calc(100% - 250px)' }}>
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4 mb-10">
          <div className="d-flex align-items-center">
            <i className="fas fa-align-left primary-text fs-4 me-3" id="menu-toggle"></i>
            <h2 className="fs-2 m-0">Invoice</h2>
          </div>
        </nav>

        <div className="container-fluid px-4 py-4">
          <div className="row g-4">
            {/* Stats Card */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Total Bills</h6>
                  <div className="d-flex align-items-center">
                    <i className='bx bx-file fs-1 text-success'></i>
                    <h3 className="ms-2 mb-0">{allBill.length}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Categories */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Bill Categories</h5>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3 mb-1
                  ">
                    {['electric', 'water', 'cusa', 'payment'].map(type => (
                      <div className="col-12 col-sm-6 col-lg-3" key={type}>
                        <button
                          className={`btn w-100 ${selectedBill === type ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => showTable(type)}
                        >
                          <i className={`bx bx-${type === 'electric' ? 'bulb' : type === 'water' ? 'water' : type === 'cusa' ? 'building-house' : 'credit-card'} me-2`}></i>
                          {type.charAt(0).toUpperCase() + type.slice(1)} Bill
                        </button>
                      </div>
                    ))}
                  </div>
                  {displayTable && (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                      <h5 className="card-title mb-0">User List</h5>
                      <div className="search-box">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={e => { setSearchTerm(e.target.value); applySearchFilter(); }}
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
                              <th>User ID</th>
                              <th>Full Name</th>
                              <th className="d-none d-md-table-cell">Email</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map(user => (
                              <tr key={user.user_id}>
                                <td>#{user.user_id}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-circle bg-success text-white me-2">
                                      {user.fullname.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h6 className="mb-0">{user.fullname}</h6>
                                      <small className="text-muted d-md-none">{user.email}</small>
                                    </div>
                                  </div>
                                </td>
                                <td className="d-none d-md-table-cell">{user.email}</td>
                                <td>
                                  <button 
                                    className="btn btn-success btn-sm px-3"
                                    onClick={() => openUploadModal(user)}
                                  >
                                    <i className="bx bx-upload me-1"></i>
                                    Upload
                                  </button>
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
            )}
                </div>
              </div>
            </div>

            {/* Bills List with Integrated Filters */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="card-title mb-0 fw-bold">Bills List</h5>
                    <div className="d-flex gap-2 flex-wrap">
                      <select
                        className="form-select form-select-sm"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={{ width: 'auto' }}
                      >
                        <option value="">All Months</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                      <select
                        className="form-select form-select-sm"
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        style={{ width: 'auto' }}
                      >
                        <option value="">All Years</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select
                        className="form-select form-select-sm"
                        value={selectedBillType}
                        onChange={e => setSelectedBillType(e.target.value)}
                        style={{ width: 'auto' }}
                      >
                        <option value="">All Types</option>
                        {billTypes.map(billType => (
                          <option key={billType} value={billType}>
                            {billType.charAt(0).toUpperCase() + billType.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-container">
                    <div className="table-scroll">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Bill ID</th>
                            <th>Name</th>
                            <th className="d-none d-md-table-cell">Bill Type</th>
                            <th className="d-none d-md-table-cell">Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBills.map(bill => (
                            <tr key={bill.bill_id}>
                              <td>#{bill.bill_id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-circle bg-succcess text-white me-2">
                                    {bill.fullname.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h6 className="mb-0">{bill.fullname}</h6>
                                    <small className="text-muted d-md-none">
                                      {bill.bill_type} - {new Date(bill.created_at).toLocaleDateString()}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td className="d-none d-md-table-cell">{bill.bill_type}</td>
                              <td className="d-none d-md-table-cell">
                                {new Date(bill.created_at).toLocaleDateString()}
                              </td>
                              <td>
                                <button 
                                  className="btn btn-success btn-sm px-3"
                                  onClick={() => payment(bill)}
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
                </div>
              </div>
            </div>

            {/* Users Table (only shown when category is selected) */}
            
          </div>
        </div>

        {/* Image View Modal */}
        {isImageModalVisible && (
          <div id="imageViewModal" className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <div className="modal-content" style={{ background: '#fff', borderRadius: 8, padding: 20, position: 'relative' }}>
              <div className="modal-header">
                <button className="btn-close" onClick={closeImageModal}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={`http://localhost/${selectedBillImage}`}
                  alt="Bill"
                  className="img-fluid"
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom Modal */}
        {isModalVisible && (
          <div id="customModal" className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <div className="modal-content" style={{ background: '#fff', borderRadius: 8, padding: 20, position: 'relative' }}>
              <div className="modal-header">
                <h5 className="modal-title">Upload Document for {selectedUser?.fullname}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={submitBillForm}>
                  <div className="mb-3">
                    <label htmlFor="fileInput" className="form-label">Upload Image</label>
                    <input type="file" id="fileInput" className="form-control" onChange={onFileChange} />
                    <label htmlFor="billTypeDropdown" className="form-label">Select Bill Type</label>
                    <select
                      id="billTypeDropdown"
                      className="form-select"
                      value={selectedBill}
                      onChange={e => setSelectedBill(e.target.value)}
                      required
                    >
                      <option value="" disabled>Choose Bill Type</option>
                      <option value="electric">Electric Bill</option>
                      <option value="water">Water Bill</option>
                      <option value="cusa">CUSA Bill</option>
                      <option value="payment">Payment Bill</option>
                    </select>
                  </div>
                  <button type="submit" className="btn" disabled={!uploadedFile || !selectedBill}>Submit</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;