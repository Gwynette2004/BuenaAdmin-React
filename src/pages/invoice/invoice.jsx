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
    if (!selectedUser) {
      alert('User ID is required.');
      return;
    }
    if (!selectedBill) {
      alert('Please select a bill type.');
      return;
    }
    if (!uploadedFile) {
      alert('Please upload a file.');
      return;
    }
    const formData = new FormData();
    formData.append('user_id', String(selectedUser.user_id));
    formData.append('bill_type', selectedBill);
    formData.append('payment_img', uploadedFile, uploadedFile.name);

    try {
      await axios.post('http://localhost/BuenaHub/api/billing', formData);
      Swal.fire({
        title: 'Success',
        text: 'Bill has been sent',
        icon: 'success',
        position: 'center',
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      closeModal();
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Error uploading file. Please try again.');
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

  return (
    <div className="d-flex" id="wrapper">
      {/* Sidebar */}
      <div className="bg-white" id="sidebar-wrapper" style={{ position: 'fixed', height: '100vh', width: 250 }}>
        <div className="sidebar-heading text-center py-4 primary-text fs-5 fw-bold border-bottom">BuenaVista</div>
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
        <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 px-4">
          <div className="d-flex align-items-center">
            <i className="fas fa-align-left primary-text fs-4 me-3" id="menu-toggle"></i>
            <h2 className="fs-2 m-0">Invoice</h2>
          </div>
          <div className="ms-auto d-flex align-items-center">
            <div className="search-box">
              <i className="bx bx-search-alt-2"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search here..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); applySearchFilter(); }}
              />
            </div>
          </div>
        </nav>

        <div className="container-fluid px-4">
          <div className="row g-3 mt-3">
            {['electric', 'water', 'cusa', 'payment'].map(type => (
              <div className="col-md-3" key={type}>
                <button
                  className={`btn w-100${selectedBill === type ? ' selected-btn' : ''}`}
                  onClick={() => showTable(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Bill
                </button>
              </div>
            ))}
          </div>

          {displayTable && (
            <div className="mt-4">
              <div
                className="table-responsive table-scroll"
                style={{ position: 'relative', height: 740, overflowY: 'auto', border: '1px solid #ddd' }}
              >
                <table className="table table-bordered custom-table mb-0">
                  <thead className="table-header" style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                    <tr>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.user_id}>
                        <td>{user.user_id}</td>
                        <td>{user.fullname}</td>
                        <td>{user.email}</td>
                        <td>
                          <button className="btn" onClick={() => openUploadModal(user)}>Upload</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="row mb-3 p-4">
            <div className="col-md-3">
              <label htmlFor="monthSelect">Month:</label>
              <select
                id="monthSelect"
                className="form-control"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                <option value="">All</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="yearSelect">Year:</label>
              <select
                id="yearSelect"
                className="form-control"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="">All</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="billTypeSelect">Bill Type:</label>
              <select
                id="billTypeSelect"
                className="form-control"
                value={selectedBillType}
                onChange={e => setSelectedBillType(e.target.value)}
              >
                <option value="">All</option>
                {billTypes.map(billType => (
                  <option key={billType} value={billType}>{billType}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive table-scroll" style={{ position: 'relative', height: 760 }}>
            <table className="table table-bordered custom-table mb-0">
              <thead className="head">
                <tr>
                  <th>Bill ID</th>
                  <th>Name</th>
                  <th>Bill Type</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(bill => (
                  <tr key={bill.bill_id}>
                    <td>{bill.bill_id}</td>
                    <td>{bill.fullname}</td>
                    <td>{bill.bill_type}</td>
                    <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => payment(bill)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};

export default Invoice;