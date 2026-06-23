import "./navbar.css";
import { useAuth } from "../../contexts/AuthContext";
export function Navbar() {
    const { logout } = useAuth();
    return (
        <header className="navbar">
            <div className="navbar-brand">
                <span className="navbar-icon">📍</span>
                AtitusMaps
            </div>
            <button className="logout-btn" onClick={logout}>Sair</button>
        </header>
    );
}