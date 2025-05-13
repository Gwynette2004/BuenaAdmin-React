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
            <h2 className="fs-2 m-0">Residents</h2>
          </div>
        </nav>

        <div className="container-fluid px-4">
          <div className="row my-5">
            <div className="d-flex justify-content-end align-items-center mb-3">
              {/* Search Box */}
              <div className="search-box me-2">
                <i className="bx bx-search-alt-2"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search here..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); applySearchFilter(); }}
                />
              </div>
              {/* Add User Button */}
              <button className="btns btn btn-primary me-2" onClick={() => openForm()}>
                <i className="bx bx-plus"></i> Add User
              </button>
              {/* Toggle Archived View Button */}
              <div className="ms-3">
                <button className="btn btn-secondary" onClick={toggleArchivedView}>
                  {showArchivedUsers ? 'Show Active Users' : 'Show Archived Users'}
                </button>
              </div>
            </div>

            <div className="container">
              <div className="row justify-content-center">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body p-0">
                      <div className="table-responsive table-scroll">
                        <table className="table table-bordered custom-table mb-0">
                          <thead>
                            <tr>
                              <th>User ID</th>
                              <th>Full Name</th>
                              <th>Email</th>
                              <th>House#</th>
                              <th>Contact</th>
                              {showArchivedUsers && <th>Role</th>}
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableUsers.length > 0 ? (
                              tableUsers.map(user => (
                                <tr key={user.user_id}>
                                  <td>{user.user_id}</td>
                                  <td>{user.fullname}</td>
                                  <td>{user.email}</td>
                                  <td>{user.house_number}</td>
                                  <td>{user.contact}</td>
                                  {showArchivedUsers && <td>{getRoleName(user.role_id)}</td>}
                                  <td>
                                    {!showArchivedUsers ? (
                                      <button className="btn btn-sm btn-warning" onClick={() => archiveUser(user.user_id)}>Archive</button>
                                    ) : (
                                      <button className="btn btn-sm btn-success" onClick={() => restoreUser(user.user_id)}>Restore</button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={showArchivedUsers ? 7 : 6} className="text-center">No users found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
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
        </div>
      </div>
    </div>
  );
};

export default Residents;