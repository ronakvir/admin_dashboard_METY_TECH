import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

const Home = () => {
  const [formData, setFormData] = useState({username: "" , password: ""});
  const username = "admin";
  const password = "password";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to log in with", formData);
    if (formData.username === username && formData.password === password) {
      //useNavigate("/UserDashboard");
      alert("Correct Username and Password!")
    }
    else {
      alert("Invalid Username or Password!")
    }
  };

  return (
    <>
      <h2>Login:</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            type="username" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            />
        </div>
        <button type="submit">Login</button>
      </form>
       
    </>
  );
};

export default Home;
