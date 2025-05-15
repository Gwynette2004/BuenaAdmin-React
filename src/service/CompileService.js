import axios from 'axios';

class CompileService {
  constructor() {
    this.baseUrl = 'http://localhost/BuenaHub';
    this.tokenKey = 'jwt';
    this.currentUser = null;

    const token = this.getToken();
    if (token) {
      this.currentUser = this.decodeToken(token)?.data || null;
    }
  }

  // User login
  async userLogin(data) {
  try {
    const response = await axios.post(`${this.baseUrl}/login.php`, data);

    // Check if the response contains a JWT token
    if (response.data?.jwt) {
      // Decode the token to extract user details (e.g., user ID)
      const decodedToken = this.decodeToken(response.data.jwt);
      if (decodedToken?.data?.id) {
        return {
          jwt: response.data.jwt,
          userId: decodedToken.data.id, // Extract user ID from the token
        };
      } else {
        throw new Error("User ID not found in the token.");
      }
    } else {
      throw new Error("Login failed. No token returned.");
    }
  } catch (error) {
    if (error.response?.status === 403) {
      throw {
        status: 403,
        error: "This account is archived and cannot log in",
      };
    }
    throw error;
    }
  }

  // User signup
  async userSignUp(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/signup.php`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Handle errors
  handleError(error) {
    let errorMessage = 'An unknown error occurred!';
    if (error.response) {
      if (error.response.data?.includes('<!DOCTYPE html>')) {
        errorMessage = 'Server returned an HTML error page.';
      } else {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Invalid username or password.';
            break;
          case 404:
            errorMessage = 'No user matched.';
            break;
          default:
            errorMessage = `Error Code: ${error.response.status}\nMessage: ${error.response.data}`;
        }
      }
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Set token
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
    this.currentUser = this.decodeToken(token)?.data || null;
  }

  // Get token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId() {
  const token = this.getToken(); // Retrieve the token from localStorage
  if (token) {
    try {
      const decodedToken = this.decodeToken(token); // Decode the token
      return decodedToken?.data?.id || null; // Extract the `id` from `data`
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
  return null; // Return null if no token exists
}

isLoggedIn() {
  const token = this.getToken(); // Retrieve the token from localStorage
  if (token) {
    try {
      const decodedToken = this.decodeToken(token); // Decode the token
      const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds
      return decodedToken?.exp > currentTime; // Check if the token is not expired
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return false;
    }
  }
  return false; // Return false if no token exists
}
  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // Logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.currentUser = null;
  }

  // Decode JWT token
  decodeToken(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Invalid token format:', e);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    const decodedToken = this.decodeToken(token);
    if (decodedToken?.exp) {
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);
      return expirationDate < new Date();
    }
    return true;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Delete user
  async deleteUser(userId) {
    const response = await axios.post(`${this.baseUrl}/api/deleteUsers/${userId}`, {}, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get all posts
  async getAllPosts() {
    const response = await axios.get(`${this.baseUrl}/api/allpost`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get count of users
  async getCountUsers() {
    const response = await axios.get(`${this.baseUrl}/api/get_count_users`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get count of concerns
  async getCountConcerns() {
    const response = await axios.get(`${this.baseUrl}/api/get_count_concerns`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get count of reservations
  async getCountReservations() {
    const response = await axios.get(`${this.baseUrl}/api/get_count_reservations`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get all payments
  async getAllPayment() {
    const response = await axios.get(`${this.baseUrl}/api/get_payment`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Add a new bill
  async addBill(userId, formData) {
    const response = await axios.post(`${this.baseUrl}/api/billing`, formData, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Update an existing bill
  async updateBill(billId, formData) {
    const response = await axios.post(`${this.baseUrl}/updateBill/${billId}`, formData, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get active users
  async getActiveUsers() {
    const response = await axios.get(`${this.baseUrl}/getActiveUsers`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Get archived users
  async getArchivedUsers() {
    const response = await axios.get(`${this.baseUrl}/api/getArchiveUser`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Archive a user
  async archiveUser(userId) {
    const response = await axios.post(`${this.baseUrl}/api/archiveUser/${userId}`, null, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Restore a user
  async restoreUser(userId) {
    const response = await axios.post(`${this.baseUrl}/api/restoreUser/${userId}`, null, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }
}

export default new CompileService();