import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CompileService from "../../service/CompileService";
import Swal from "sweetalert2";
import buena from "../../assets/buena.jpg";


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

    // Store the JWT token in localStorage with the correct key
    localStorage.setItem("jwt_token", response.jwt);


    // Navigate to the home page
    navigate("/home");
    setLoginError(false);
  } catch (error) {
    setErrorMessage(error.message || "Invalid email or password.");
    setLoginError(true);

    // Handle archived account error
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-4xl rounded-lg overflow-hidden shadow-lg">
        {/* Left image section */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src={buena}
            alt="Background"
            className="w-full h-full object-cover rounded-l-2xl"
          />
        </div>

        {/* Right form section */}
        <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center">
          <form onSubmit={handleSubmit(onLogin)} className="w-full max-w-xs space-y-6">
            <h2 className="text-xl font-bold text-center">Login Your Account</h2>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email", { required: "Email is required" })}
                className="w-full border-b border-gray-300 py-2 outline-none focus:border-green-600"
              />
              {errors.email && (
                <span className="text-sm text-red-600">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
                className="w-full border-b border-gray-300 py-2 outline-none focus:border-green-600"
              />
              {errors.password && (
                <span className="text-sm text-red-600">{errors.password.message}</span>
              )}
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 bg-gray-200 hover:bg-green-600 hover:text-white rounded transition"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
