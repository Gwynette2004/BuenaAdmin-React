import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CompileService from "../../service/CompileService";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import './login.css';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onLogin = async (data) => {
    try {
      const response = await CompileService.userLogin(data);

      // Check if the response contains an archived user message
      if (response.message === "This account is archived and cannot log in.") {
        Swal.fire({
          title: "Account Archived",
          text: "Your account has been archived and cannot log in.",
          icon: "error",
          confirmButtonText: "Okay",
        });
        return; // Exit early to prevent further actions
      }

      // Show success message for login
      Swal.fire({
        title: "Success",
        text: "Welcome Admin!",
        icon: "success",
        confirmButtonText: "Great!",
        position: "top-end",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });

      // Store the JWT token and navigate
      CompileService.setToken(response.jwt);
      navigate("/home");
      setLoginError(false);
    } catch (error) {
      // Handle error, including for archived users
      setErrorMessage(error.message || "Invalid email or password.");
      setLoginError(true);

      // If the error is due to an archived account, handle it here
      if (
        error.status === 403 &&
        error.error?.message === "This account is archived and cannot log in."
      ) {
        Swal.fire({
          title: "Account Archived",
          text: "Your account is archived and cannot log in.",
          icon: "error",
          confirmButtonText: "Okay",
        });
      }
    }
  };

  return (
    <div className="wrapper">
      <div className="container main">
        <div className="row">
          <div className="col-md-6 side-image">
            {/* Add your image or content here */}
            <div className="text"></div>
          </div>

          <div className="col-md-6 right">
            <div className="input-box">
              <header>Login Your Account</header>

              {/* Form */}
              <form onSubmit={handleSubmit(onLogin)}>
                <div className="input-field">
                  <input
                    type="text"
                    className="input"
                    id="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: /^\S+@\S+$/i,
                    })}
                    autoComplete="off"
                  />
                  <label htmlFor="email">Email</label>
                  {errors.email && (
                    <span className="error">{errors.email.message}</span>
                  )}
                </div>

                <div className="input-field">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="input"
                    id="pass"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <label htmlFor="pass">Password</label>
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                  {errors.password && (
                    <span className="error">{errors.password.message}</span>
                  )}
                </div>

                <div className="input-field">
                  <input type="submit" className="submit" value="Sign Up" />
                </div>
              </form>

              {loginError && (
                <div className="error-message">{errorMessage}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="shape shape-one"></div>
      <div className="shape shape-two"></div>
      <div className="shape shape-three"></div>
      <div className="shape shape-four"></div>
      <div className="shape shape-five"></div>
    </div>
  );
};

export default Login;
