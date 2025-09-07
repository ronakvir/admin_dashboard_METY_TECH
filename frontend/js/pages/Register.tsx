import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminInvitesService, UsersService } from "../api";

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      const decoded = decodeURIComponent(tokenFromUrl);
      setToken(decoded);
      verifyToken(decoded);
    } else {
      setShowTokenInput(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");
      const response = (await AdminInvitesService.adminInvitesVerifyTokenCreate({
        requestBody: { token: tokenToVerify.trim() },
      })) as any;

      if (response?.valid) {
        setEmail(response.email);
        setTokenValid(true);
        setShowTokenInput(false);
      } else {
        setTokenValid(false);
        setShowTokenInput(true);
        setMessage("Invalid or expired invitation token");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      setTokenValid(false);
      setShowTokenInput(true);
      setMessage("Failed to verify invitation token");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      await verifyToken(token.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setMessage("Passwords don't match");
      setMessageType("error");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");
      await UsersService.usersRegisterCreate({
        requestBody: {
          token,
          password,
          password_confirm: passwordConfirm,
        },
      });

      setMessage("Registration successful! Redirecting to login...");
      setMessageType("success");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Registration failed:", error);
      setMessage(error?.response?.data?.detail || "Registration failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const showVerifying = loading && tokenValid === null && !showTokenInput;
  const showTokenStage = showTokenInput || tokenValid === false;
  const showPasswordStage = tokenValid === true && !showTokenInput;

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Header */}
        <div className="register-header">
          {showVerifying && (
            <>
              <h1>Verifying Invitation</h1>
              <p>Please wait while we verify your token…</p>
            </>
          )}
          {showTokenStage && (
            <>
              <h1>Complete Registration</h1>
              <p>Enter your invitation token to get started</p>
            </>
          )}
          {showPasswordStage && (
            <>
              <h1>Complete Registration</h1>
              <p>Set your password to get started</p>
            </>
          )}
        </div>

        {/* Loading/Spinner */}
        {showVerifying && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Verifying invitation...</p>
          </div>
        )}

        {/* Message */}
        {!!message && (
          <div className={`message ${messageType === "success" ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {/* Token Input Stage */}
        {showTokenStage && (
          <>
            <form onSubmit={handleTokenSubmit} className="register-form">
              <div className="input-group">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your invitation token"
                  className={`input-field ${tokenValid === false ? "input-invalid" : ""}`}
                  aria-invalid={tokenValid === false}
                  required
                />
                {tokenValid === false && (
                  <small className="hint-error">That token looks invalid. Please paste a fresh link or token.</small>
                )}
              </div>

              <button type="submit" disabled={loading} className="register-button">
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>

            <div className="login-link">
              <p>
                Already have an account?{" "}
                <button onClick={() => navigate("/")} className="link-button">
                  Sign in here
                </button>
              </p>
            </div>
          </>
        )}

        {/* Password Stage */}
        {showPasswordStage && (
          <>
            <form onSubmit={handleSubmit} className="register-form">
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="input-field disabled-input"
                  placeholder="Email address"
                />
                <small>This email was provided in your invitation</small>
              </div>

              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter your password (min 8 characters)"
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm your password"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="register-button">
                {loading ? "Creating Account..." : "Complete Registration"}
              </button>
            </form>

            <div className="login-link">
              <p>
                Already have an account?{" "}
                <button onClick={() => navigate("/")} className="link-button">
                  Sign in here
                </button>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Shared styles: always present, so every branch is styled */}
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          padding: 20px;
        }

        .register-container {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 12px;
          padding: 48px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .register-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .register-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
        }

        .register-header p {
          color: #666;
          font-size: 16px;
          margin: 0;
          font-weight: 400;
        }

        .loading-state {
          text-align: center;
          padding: 24px 0 8px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f0f0f0;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .message {
          padding: 12px 16px;
          margin: 0 0 20px 0;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .register-form {
          margin-bottom: 16px;
        }

        .input-group {
          margin-bottom: 16px;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
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

        /* Clear invalid visual for token errors */
        .input-invalid {
          border-color: #dc3545 !important;
          box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1) !important;
        }

        .disabled-input {
          background-color: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .input-group small {
          display: block;
          margin-top: 8px;
          color: #666;
          font-size: 12px;
          font-weight: 400;
        }

        .hint-error {
          color: #dc3545;
        }

        .register-button {
          width: 100%;
          padding: 14px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .register-button:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .register-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .login-link {
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .login-link p {
          margin: 0;
          color: #666;
          font-size: 14px;
          font-weight: 400;
        }

        .link-button {
          background: none;
          border: none;
          color: #007bff;
          text-decoration: none;
          cursor: pointer;
          font-size: inherit;
          font-weight: 600;
        }

        .link-button:hover {
          color: #0056b3;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Register;
