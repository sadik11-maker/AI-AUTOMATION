import { useState, useEffect } from "react";

import TicketDetails from "./TicketDetails";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from "./api";

import Dashboard from "./Dashboard";


function App() {

  // ==========================================
  // MODAL STATES
  // ==========================================

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);


  // ==========================================
  // AUTH STATES
  // ==========================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [currentUser, setCurrentUser] = useState(null);


  // ==========================================
  // TICKET DETAILS STATE
  // ==========================================

  const [selectedTicketId, setSelectedTicketId] = useState(null);


  // ==========================================
  // LOGIN STATES
  // ==========================================

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");


  // ==========================================
  // REGISTER STATES
  // ==========================================

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");


  // ==========================================
  // MESSAGE STATES
  // ==========================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // ==========================================
  // CHECK LOGIN ON PAGE LOAD
  // ==========================================

  useEffect(() => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      return;
    }


    getCurrentUser()

      .then((user) => {

        setCurrentUser(user);

        setIsLoggedIn(true);

      })

      .catch((error) => {

        console.error(
          "Session Error:",
          error
        );

        logoutUser();

        setIsLoggedIn(false);

        setCurrentUser(null);

      });

  }, []);


  // ==========================================
  // OPEN LOGIN
  // ==========================================

  const openLogin = () => {

    setMessage("");

    setError("");

    setShowRegister(false);

    setShowLogin(true);

  };


  // ==========================================
  // OPEN REGISTER
  // ==========================================

  const openRegister = () => {

    setMessage("");

    setError("");

    setShowLogin(false);

    setShowRegister(true);

  };


  // ==========================================
  // HANDLE REGISTER
  // ==========================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setMessage("");

    setError("");


    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword.trim()
    ) {

      setError(
        "Please fill in all fields."
      );

      return;

    }


    if (registerPassword.length < 8) {

      setError(
        "Password must be at least 8 characters."
      );

      return;

    }


    setLoading(true);


    try {

      const data = await registerUser({

        full_name:
          registerName.trim(),

        email:
          registerEmail.trim(),

        password:
          registerPassword,

      });


      console.log(
        "Registration Response:",
        data
      );


      setMessage(
        "Registration successful! Please login."
      );


      setRegisterName("");

      setRegisterEmail("");

      setRegisterPassword("");


      setShowRegister(false);

      setShowLogin(true);


    } catch (error) {

      console.error(
        "Registration Error:",
        error
      );


      setError(
        error.message ||
        "Registration failed."
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // HANDLE LOGIN
  // ==========================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setMessage("");

    setError("");


    if (
      !loginEmail.trim() ||
      !loginPassword
    ) {

      setError(
        "Please enter email and password."
      );

      return;

    }


    setLoading(true);


    try {

      const data = await loginUser(

        loginEmail.trim(),

        loginPassword

      );


      console.log(
        "Login Response:",
        data
      );


      const user =
        await getCurrentUser();


      setCurrentUser(user);

      setIsLoggedIn(true);


      setMessage(
        `Welcome back, ${user.full_name}!`
      );


      setShowLogin(false);


      setLoginEmail("");

      setLoginPassword("");


    } catch (error) {

      console.error(
        "Login Error:",
        error
      );


      setError(
        error.message ||
        "Login failed."
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // HANDLE LOGOUT
  // ==========================================

  const handleLogout = () => {

    logoutUser();


    setIsLoggedIn(false);

    setCurrentUser(null);


    // Clear selected ticket

    setSelectedTicketId(null);


    setMessage(
      "You have been logged out successfully."
    );

    setError("");

  };


  // ==========================================
  // OPEN TICKET DETAILS
  // ==========================================

  const handleViewTicket = (ticketId) => {

    console.log(
      "Opening Ticket:",
      ticketId
    );


    setSelectedTicketId(ticketId);

  };


  // ==========================================
  // BACK FROM TICKET DETAILS
  // ==========================================

  const handleBackFromTicket = () => {

    setSelectedTicketId(null);

  };


  // ==========================================
  // AFTER TICKET DELETE
  // ==========================================

  const handleTicketDeleted = () => {

    setSelectedTicketId(null);

    setMessage(
      "Ticket deleted successfully."
    );

  };


  // ==========================================
  // IF USER IS LOGGED IN
  // ==========================================

  if (isLoggedIn) {


    // ========================================
    // SHOW TICKET DETAILS
    // ========================================

    if (selectedTicketId) {

      return (

        <TicketDetails

          ticketId={
            selectedTicketId
          }

          onBack={
            handleBackFromTicket
          }

          onDeleted={
            handleTicketDeleted
          }

        />

      );

    }


    // ========================================
    // SHOW DASHBOARD
    // ========================================

    return (

      <Dashboard

        onLogout={
          handleLogout
        }

        onViewTicket={
          handleViewTicket
        }

      />

    );

  }


  // ==========================================
  // LANDING PAGE
  // ==========================================

  return (

    <div className="app">


      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="navbar">

        <div className="logo">

          🤖 AI Support

        </div>


        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#features">
            Features
          </a>

          <a href="#about">
            About
          </a>


          <button
            className="login-btn"
            onClick={openLogin}
          >

            Login

          </button>


          <button
            className="register-btn"
            onClick={openRegister}
          >

            Register

          </button>

        </div>

      </nav>



      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (

        <div className="success-message">

          {message}

        </div>

      )}



      {/* ======================================
          HERO
      ====================================== */}

      <section
        id="home"
        className="hero-section"
      >

        <div className="hero-content">


          <div className="badge">

            🚀 Smart Customer Support

          </div>


          <h1>

            AI-Powered Customer

            <span>
              {" "}Support Platform
            </span>

          </h1>


          <p>

            Manage customer support tickets,
            communicate with customers,
            and provide faster support using
            our intelligent platform.

          </p>


          <div className="hero-buttons">


            <button
              className="primary-btn"
              onClick={openRegister}
            >

              Get Started

            </button>


            <button
              className="secondary-btn"
              onClick={() => {

                document
                  .getElementById("features")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

              }}
            >

              Learn More

            </button>


          </div>

        </div>



        {/* ==================================
            AI CHAT CARD
        ================================== */}

        <div className="hero-card">

          <div className="card-header">

            <span className="status-dot"></span>

            AI Support Assistant

          </div>


          <div className="chat-message ai">

            Hello! 👋 How can I help you today?

          </div>


          <div className="chat-message user">

            I have a problem with my order.

          </div>


          <div className="chat-message ai">

            Don't worry! Let me help you solve
            this issue.

          </div>

        </div>

      </section>



      {/* ======================================
          FEATURES
      ====================================== */}

      <section
        id="features"
        className="features-section"
      >

        <h2>

          Everything You Need
          for Customer Support

        </h2>


        <p className="section-description">

          Our platform helps you manage
          customer conversations and
          support requests efficiently.

        </p>


        <div className="features-grid">


          <div className="feature-card">

            <div className="feature-icon">
              🎫
            </div>

            <h3>
              Ticket Management
            </h3>

            <p>

              Create, update, close and manage
              customer support tickets from
              one place.

            </p>

          </div>



          <div className="feature-card">

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              AI Assistance
            </h3>

            <p>

              Use AI-powered assistance to
              provide faster and smarter
              customer responses.

            </p>

          </div>



          <div className="feature-card">

            <div className="feature-icon">
              💬
            </div>

            <h3>
              Customer Comments
            </h3>

            <p>

              Customers and support teams
              can communicate through
              ticket comments.

            </p>

          </div>



          <div className="feature-card">

            <div className="feature-icon">
              📊
            </div>

            <h3>
              Admin Dashboard
            </h3>

            <p>

              Admins can monitor tickets
              and manage customer support
              activities.

            </p>

          </div>


        </div>

      </section>



      {/* ======================================
          ABOUT
      ====================================== */}

      <section
        id="about"
        className="about-section"
      >

        <div>

          <h2>

            Built for Modern Customer Support

          </h2>


          <p>

            The AI Customer Support Platform
            is designed to simplify customer
            service management. Users can
            register, login, create support
            tickets, update tickets, close
            tickets, delete tickets and
            communicate through comments.

          </p>

        </div>

      </section>



      {/* ======================================
          FOOTER
      ====================================== */}

      <footer>

        <h3>

          🤖 AI Customer Support Platform

        </h3>


        <p>

          Smart support.
          Faster solutions.
          Happier customers.

        </p>


        <p className="copyright">

          © 2026 AI Customer Support Platform

        </p>

      </footer>



      {/* ======================================
          LOGIN MODAL
      ====================================== */}

      {showLogin && (

        <div className="modal-overlay">

          <div className="modal">


            <button
              className="close-btn"
              onClick={() => {

                setShowLogin(false);

                setError("");

              }}
            >

              ×

            </button>


            <h2>

              Welcome Back

            </h2>


            <p>

              Login to your account

            </p>


            {error && (

              <div className="error-message">

                {error}

              </div>

            )}


            <form
              onSubmit={handleLogin}
            >


              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(
                    e.target.value
                  )
                }
                required
              />


              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
                }
                required
              />


              <button
                type="submit"
                className="primary-btn full"
                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : "Login"
                }

              </button>


            </form>


            <p className="modal-footer">

              Don't have an account?


              <button
                onClick={() => {

                  setShowLogin(false);

                  setError("");

                  setShowRegister(true);

                }}
              >

                Register

              </button>


            </p>


          </div>

        </div>

      )}



      {/* ======================================
          REGISTER MODAL
      ====================================== */}

      {showRegister && (

        <div className="modal-overlay">

          <div className="modal">


            <button
              className="close-btn"
              onClick={() => {

                setShowRegister(false);

                setError("");

              }}
            >

              ×

            </button>


            <h2>

              Create Account

            </h2>


            <p>

              Register for AI Customer Support

            </p>


            {error && (

              <div className="error-message">

                {error}

              </div>

            )}


            <form
              onSubmit={handleRegister}
            >


              <input
                type="text"
                placeholder="Full Name"
                value={registerName}
                onChange={(e) =>
                  setRegisterName(
                    e.target.value
                  )
                }
                required
              />


              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) =>
                  setRegisterEmail(
                    e.target.value
                  )
                }
                required
              />


              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                value={registerPassword}
                onChange={(e) =>
                  setRegisterPassword(
                    e.target.value
                  )
                }
                required
                minLength={8}
              />


              <button
                type="submit"
                className="register-btn full"
                disabled={loading}
              >

                {loading
                  ? "Creating Account..."
                  : "Create Account"
                }

              </button>


            </form>


            <p className="modal-footer">

              Already have an account?


              <button
                onClick={() => {

                  setShowRegister(false);

                  setError("");

                  setShowLogin(true);

                }}
              >

                Login

              </button>


            </p>


          </div>

        </div>

      )}


    </div>

  );

}


export default App;