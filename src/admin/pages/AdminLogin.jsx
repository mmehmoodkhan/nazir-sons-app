
import "../pages/AdminLogin.css";
export default function AdminLogin() {
  return (
    <div className="login-box">
      <h2>Admin Login</h2>

      <form>
        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="Enter email" required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="Enter password" required />
        </div>

        <button className="login-btn">Login</button>
      </form>
    </div>
  );
}
