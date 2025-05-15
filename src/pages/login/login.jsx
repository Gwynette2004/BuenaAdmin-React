import React, { useState, useEffect } from "react";
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

  // Redirect if already authenticated
  useEffect(() => {
    if (CompileService.isLoggedIn()) {
      navigate("/home");
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const onLogin = async (data) => {
    try {
      const response = await CompileService.userLogin(data);

      // Check if the response contains a JWT token
      if (response.jwt) {
        // Store the JWT token
        CompileService.setToken(response.jwt);

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

        navigate("/home");
      } else {
        throw new Error("Login failed. No token returned.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";
      setErrorMessage(errorMsg);
      setLoginError(true);

      Swal.fire({
        title: "Error",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "Okay",
      });
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
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
                className="w-full border-b border-gray-300 py-2 outline-none focus:border-green-600"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-0 top-0 mt-2 mr-2 text-gray-500"
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
              {errors.password && (
                <span className="text-sm text-red-600">{errors.password.message}</span>
              )}
            </div>

            {/* Error Feedback */}
            {loginError && (
              <div className="text-sm text-red-500 text-center">{errorMessage}</div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 bg-gray-200 hover:bg-green-600 hover:text-white rounded transition"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
