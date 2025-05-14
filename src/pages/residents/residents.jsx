import React, { useEffect, useState } from 'react';
import './residents.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';

const Residents = () => {
  const [userForm, setUserForm] = useState({
    fullname: '',
    email: '',
    password: '123',
    role_id: 2,
    house_number: '',
    contact: '',
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [user_id, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUser, setFilteredUser] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [showArchivedUsers, setShowArchivedUsers] = useState(false);

  useEffect(() => {
    retrieveArchivedUsers();
    retrieveActiveUsers();
    // Sidebar toggle
    const toggleButton = document.getElementById("menu-toggle");
    const el = document.getElementById("wrapper");
    if (toggleButton && el) {
      toggleButton.onclick = function () {
        el.classList.toggle("toggled");
      };
    }
  }, []);

  const getRoleName = (role_id) => {
    switch (role_id) {
      case 1: return 'Admin';
      case 2: return 'User';
      default: return 'Unknown';
    }
  };

  const archiveUser = (user_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to archive this user!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, archive it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post(`http://localhost/BuenaHub/api/archiveUser/${user_id}`)
          .then(() => {
            Swal.fire('Archived!', `User with ID ${user_id} has been archived.`, 'success');
            retrieveActiveUsers();
            retrieveArchivedUsers();
          })
          .catch(() => {
            Swal.fire('Error!', 'There was a problem archiving the user.', 'error');
          });
      }
    });
  };

  const toggleArchivedView = () => {
    setShowArchivedUsers(!showArchivedUsers);
    if (!showArchivedUsers) {
      retrieveArchivedUsers();
    } else {
      retrieveActiveUsers();
    }
  };

  const retrieveArchivedUsers = () => {
    axios.get('http://localhost/BuenaHub/api/archivedUser')
      .then((res) => {
        if (res.data && res.data.data) {
          setArchivedUsers(res.data.data);
        } else {
          setArchivedUsers([]);
        }
      })
      .catch(() => setArchivedUsers([]));
  };

  const retrieveActiveUsers = () => {
    axios.get('http://localhost/BuenaHub/api/activeUser')
      .then((res) => {
        if (res.data && res.data.data) {
          setUsers(res.data.data);
        } else {
          setUsers([]);
        }
      })
      .catch(() => setUsers([]));
  };

  const restoreUser = (user_id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to restore this user!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post(`http://localhost/BuenaHub/api/restoreUser/${user_id}`)
          .then(() => {
            Swal.fire('Restored!', `User with ID ${user_id} has been restored.`, 'success');
            retrieveActiveUsers();
            retrieveArchivedUsers();
          })
          .catch(() => {
            Swal.fire('Error!', 'There was a problem restoring the user.', 'error');
          });
      }
    });
  };

  const editProfile = (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!userForm.fullname || !userForm.email || !userForm.house_number || !userForm.contact) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill in all required fields.',
      });
      return;
    }
    const formData = {
      ...userForm,
      password: user_id ? userForm.password.trim() : '123',
      role_id: 2,
    };
    if (user_id) {
      axios.put(`http://localhost/BuenaHub/api/edit_profile_admin/${user_id}`, formData)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Profile Updated',
            text: 'The profile has been updated successfully!',
          });
          retrieveActiveUsers();
          closeForm();
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'There was a problem updating the profile.',
          });
        });
    } else {
      axios.post('http://localhost/BuenaHub/api/signup', formData)
        .then((response) => {
          if (response.data && response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'User Added',
              text: 'The new user has been added successfully!',
            });
            retrieveActiveUsers();
            closeForm();
          } else if (response.data && response.data.error === 'EmailAlreadyExists') {
            Swal.fire({
              icon: 'warning',
              title: 'Duplicate Email',
              text: 'The email address is already in use. Please try a different email.',
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'User Added',
              text: 'The new user has been added successfully!',
            });
          }
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Addition Failed',
            text: 'There was a problem adding the new user.',
          });
        });
    }
  };

  const openForm = (user = null) => {
    setIsFormVisible(true);
    if (user) {
      setUserId(user.user_id);
      setUserForm({
        fullname: user.fullname,
        email: user.email,
        password: user.password || '123',
        role_id: 2,
        house_number: user.house_number,
        contact: user.contact,
      });
    } else {
      setUserId(null);
      setUserForm({
        fullname: '',
        email: '',
        password: '123',
        role_id: 2,
        house_number: '',
        contact: '',
      });
    }
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setUserForm({
      fullname: '',
      email: '',
      password: '123',
      role_id: 2,
      house_number: '',
      contact: '',
    });
    setUserId(null);
  };

  const applySearchFilter = () => {
    const term = searchTerm.toLowerCase();
    setFilteredUser(users.filter(user =>
      user.fullname.toLowerCase().includes(term)
    ));
  };

  // Table data to show
  const tableUsers = showArchivedUsers
    ? archivedUsers
    : (filteredUser.length > 0 || searchTerm ? filteredUser : users);

  return (
    <div className="d-flex" id="wrapper">
      {/* Sidebar */}
      <div className="bg-white shadow-sm sidebar" id="sidebar-wrapper">
        <div className="sidebar-heading text-center py-4 text-success fs-5 fw-bold text-primary border-bottom">
          BuenaVista
        </div>
        <div className="list-group list-group-flush my-3">
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

      {/* Main Content */}
      <div id="page-content-wrapper" className="bg-light">
        {/* Navbar */}


        {/* Main Content Area */}
        <div className="container-fluid px-4 py-4">
          <div className="row g-4">
            {/* Stats Cards */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 mt-20 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Total Residents</h6>
                  <div className="d-flex align-items-center">
                    <i className='bx bx-user-circle fs-1 text-success'></i>
                    <h3 className="ms-2 mb-0">{users.length}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 mt-20 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Archived Users</h6>
                  <div className="d-flex align-items-center">
                    <i className='bx bx-archive fs-1 text-success'></i>
                    <h3 className="ms-2 mb-0">{archivedUsers.length}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                    <h5 className="card-title mb-0">
                      {showArchivedUsers ? 'Archived Residents' : 'Active Residents'}
                    </h5>
                    
                    <div className="d-flex flex-wrap gap-3">
                      {/* Search Box */}
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control search-input"
                          placeholder="Search residents..."
                          value={searchTerm}
                          onChange={e => { setSearchTerm(e.target.value); applySearchFilter(); }}
                        />
                        <i className="bx bx-search position-absolute search-icon"></i>
                      </div>

                      {/* Add User Button */}
                      <button 
                        className="btn btn-primary d-flex align-items-center"
                        onClick={() => setIsFormVisible(true)}
                      >
                        <i className="bx bx-plus-circle me-2"></i>
                        Add User
                      </button>

                      {/* Archive Toggle Button */}
                      <button 
                        className={`btn ${showArchivedUsers ? 'btn-success' : 'btn-warning'} d-flex align-items-center`}
                        onClick={toggleArchivedView}
                      >
                        <i className={`bx ${showArchivedUsers ? 'bx-archive-out' : 'bx-archive-in'} me-2`}></i>
                        {showArchivedUsers ? 'Show Active' : 'Show Archived'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-container">
                    <div className="table-scroll">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Resident</th>
                            <th className="d-none d-md-table-cell">Contact Info</th>
                            <th className="d-none d-lg-table-cell">House #</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableUsers.map(user => (
                            <tr key={user.user_id}>
                              <td>#{user.user_id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-circle bg-primary text-white me-2">
                                    {user.fullname.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h6 className="mb-0">{user.fullname}</h6>
                                    <small className="text-muted d-md-none">{user.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="d-none d-md-table-cell">
                                <div>
                                  <div>{user.email}</div>
                                  <small className="text-muted">{user.contact}</small>
                                </div>
                              </td>
                              <td className="d-none d-lg-table-cell">{user.house_number}</td>
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  {!showArchivedUsers ? (
                                    <>
                                      <button 
                                        className="btn btn-primary px-3"
                                        onClick={() => openForm(user)}
                                        title="Edit User"
                                      >
                                        <i className="bx bx-edit-alt me-1"></i>
                                        Edit
                                      </button>
                                      <button 
                                        className="btn btn-warning px-3"
                                        onClick={() => archiveUser(user.user_id)}
                                        title="Archive User"
                                      >
                                        <i className="bx bx-archive-in me-1"></i>
                                        Archive
                                      </button>
                                    </>
                                  ) : (
                                    <button 
                                      className="btn btn-success px-3"
                                      onClick={() => restoreUser(user.user_id)}
                                      title="Restore User"
                                    >
                                      <i className="bx bx-archive-out me-1"></i>
                                      Restore
                                    </button>
                                  )}
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

      {/* Modal Form */}
      {isFormVisible && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{user_id ? 'Edit User' : 'Add User'}</h5>
                <button type="button" className="btn-close" onClick={closeForm}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={editProfile}>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label htmlFor="fullname" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="fullname"
                      className="form-control"
                      value={userForm.fullname}
                      onChange={e => setUserForm({ ...userForm, fullname: e.target.value })}
                      required
                    />
                  </div>
                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      required
                    />
                  </div>
                  {/* House Number */}
                  <div className="mb-3">
                    <label htmlFor="house_number" className="form-label">House #</label>
                    <input
                      type="text"
                      id="house_number"
                      className="form-control"
                      value={userForm.house_number}
                      onChange={e => setUserForm({ ...userForm, house_number: e.target.value })}
                      required
                    />
                  </div>
                  {/* Contact */}
                  <div className="mb-3">
                    <label htmlFor="contact" className="form-label">Contact</label>
                    <input
                      type="text"
                      id="contact"
                      className="form-control"
                      value={userForm.contact}
                      onChange={e => setUserForm({ ...userForm, contact: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    <i className="bx bx-plus"></i> {user_id ? 'Update' : 'Add'} User
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Residents;