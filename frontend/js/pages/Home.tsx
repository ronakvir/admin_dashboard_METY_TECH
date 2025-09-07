import React, { useState } from "react";
import { useNavigate} from "react-router-dom";
import { UsersService } from "../api";


const Home: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [pageView, setPageView] = useState({ currentPage: "login" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = await UsersService.usersLoginCreate({
        requestBody: formData,
      });
      // We need to be able to check what kind of user this is and route them accordingly.
      // alert("Success!");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Invalid email or password!");
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="input-field"
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="input-field"
            />
          </div>
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <button onClick={handleRegisterClick} className="register-button">
          Register with Invitation
        </button>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 12px;
          padding: 48px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
        }

        .login-header p {
          color: #666;
          font-size: 16px;
          margin: 0;
          font-weight: 400;
        }

        .login-form {
          margin-bottom: 32px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-field {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #f0f0f0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: white;
          box-sizing: border-box;
          font-weight: 400;
        }

        .input-field:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
        }

        .input-field::placeholder {
          color: #999;
          font-weight: 400;
        }

        .login-button {
          width: 100%;
          padding: 16px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 12px;
        }

        .login-button:hover {
          background: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .divider {
          text-align: center;
          margin: 32px 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #f0f0f0;
        }

        .divider span {
          background: white;
          padding: 0 20px;
          color: #999;
          font-size: 14px;
          position: relative;
          font-weight: 500;
        }

        .register-button {
          width: 100%;
          padding: 16px 20px;
          background: white;
          color: #007bff;
          border: 2px solid #007bff;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .register-button:hover {
          background: #007bff;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Home;
