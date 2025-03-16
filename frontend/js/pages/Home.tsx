import React, { useState } from "react";
import { UsersService } from "../api";

const Home: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await UsersService.usersLoginCreate({
        requestBody: formData,
      });

     alert("Success!");
    } catch (err) {
      console.error(err);
      alert("Invalid email or password!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login:</h2>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
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
  );
};

export default Home;
