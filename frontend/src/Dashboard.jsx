import { useEffect, useState } from "react";

import {
  getCurrentUser,
  getMyTickets,
  createTicket,
} from "./api";

import TicketDetails from "./TicketDetails";


function Dashboard({ onLogout }) {

  // ==========================================
  // USER STATE
  // ==========================================

  const [user, setUser] = useState(null);


  // ==========================================
  // TICKETS STATE
  // ==========================================

  const [tickets, setTickets] = useState([]);

  const [selectedTicketId, setSelectedTicketId] =
    useState(null);


  // ==========================================
  // CREATE TICKET STATES
  // ==========================================

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("Medium");


  // ==========================================
  // LOADING STATES
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);


  // ==========================================
  // MESSAGE STATES
  // ==========================================

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {

    setLoading(true);

    setError("");

    try {

      // Get current logged-in user
      const userData =
        await getCurrentUser();


      // Get user's tickets
      const ticketData =
        await getMyTickets();


      setUser(userData);


      setTickets(
        Array.isArray(ticketData)
          ? ticketData
          : []
      );


    } catch (error) {

      console.error(
        "Dashboard Error:",
        error
      );


      setError(
        error.message ||
        "Failed to load dashboard."
      );


      // If token expired or invalid
      if (
        error.message?.includes("token") ||
        error.message?.includes("credentials") ||
        error.message?.includes("logged in")
      ) {

        handleLogout();

      }


    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD DASHBOARD ON OPEN
  // ==========================================

  useEffect(() => {

    loadDashboard();

  }, []);


  // ==========================================
  // CREATE NEW TICKET
  // ==========================================

  const handleCreateTicket = async (e) => {

    e.preventDefault();

    setMessage("");

    setError("");


    // Validation

    if (
      !title.trim() ||
      !description.trim()
    ) {

      setError(
        "Please enter title and description."
      );

      return;

    }


    setCreating(true);


    try {

      // Create ticket
      const data =
        await createTicket({

          title: title.trim(),

          description: description.trim(),

          priority: priority,

        });


      console.log(
        "Create Ticket Response:",
        data
      );


      // Success message

      setMessage(
        "Ticket created successfully!"
      );


      // Clear form

      setTitle("");

      setDescription("");

      setPriority("Medium");


      // Reload tickets

      const updatedTickets =
        await getMyTickets();


      setTickets(
        Array.isArray(updatedTickets)
          ? updatedTickets
          : []
      );


    } catch (error) {

      console.error(
        "Create Ticket Error:",
        error
      );


      setError(
        error.message ||
        "Failed to create ticket."
      );


    } finally {

      setCreating(false);

    }

  };


  // ==========================================
  // OPEN TICKET DETAILS
  // ==========================================

  const handleViewTicket = (ticketId) => {

    setMessage("");

    setError("");

    setSelectedTicketId(ticketId);

  };


  // ==========================================
  // BACK TO TICKET LIST
  // ==========================================

  const handleBackToTickets = async () => {

    setSelectedTicketId(null);

    // Reload latest ticket data
    try {

      const updatedTickets =
        await getMyTickets();


      setTickets(
        Array.isArray(updatedTickets)
          ? updatedTickets
          : []
      );

    } catch (error) {

      console.error(
        "Refresh Tickets Error:",
        error
      );

    }

  };


  // ==========================================
  // TICKET DELETED
  // ==========================================

  const handleTicketDeleted = async () => {

    // Close TicketDetails
    setSelectedTicketId(null);


    // Reload dashboard
    await loadDashboard();


    // Show message
    setMessage(
      "Ticket deleted successfully!"
    );

  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "role"
    );


    setUser(null);

    setTickets([]);

    setSelectedTicketId(null);


    if (onLogout) {

      onLogout();

    }

  };


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-loading">

          <h2>
            Loading Dashboard...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // TICKET DETAILS PAGE
  // ==========================================

  if (selectedTicketId !== null) {

    return (

      <div className="dashboard-page">

        <TicketDetails

          ticketId={selectedTicketId}


          // Back button
          onBack={
            handleBackToTickets
          }


          // After delete
          onDeleted={
            handleTicketDeleted
          }

        />

      </div>

    );

  }


  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (

    <div className="dashboard-page">


      {/* ======================================
          DASHBOARD NAVBAR
      ====================================== */}

      <nav className="dashboard-navbar">


        <div className="dashboard-logo">

          🤖 AI Customer Support

        </div>


        <div className="dashboard-nav-right">


          {user && (

            <span className="user-name">

              👤 {user.full_name}

            </span>

          )}


          <button

            className="logout-btn"

            onClick={
              handleLogout
            }

          >

            Logout

          </button>


        </div>

      </nav>



      {/* ======================================
          DASHBOARD CONTAINER
      ====================================== */}

      <main className="dashboard-container">


        {/* ====================================
            WELCOME SECTION
        ==================================== */}

        <section className="welcome-section">


          <div>

            <h1>

              Welcome,

              {" "}

              {user
                ? user.full_name
                : "User"
              }

              👋

            </h1>


            <p>

              Manage your customer
              support tickets from
              your dashboard.

            </p>

          </div>


          {/* DASHBOARD STATS */}

          <div className="dashboard-stats">


            {/* TOTAL */}

            <div className="stat-card">

              <h3>

                {tickets.length}

              </h3>

              <p>

                Total Tickets

              </p>

            </div>


            {/* OPEN */}

            <div className="stat-card">

              <h3>

                {
                  tickets.filter(
                    (ticket) =>
                      ticket.status ===
                      "Open"
                  ).length
                }

              </h3>

              <p>

                Open Tickets

              </p>

            </div>


            {/* CLOSED */}

            <div className="stat-card">

              <h3>

                {
                  tickets.filter(
                    (ticket) =>
                      ticket.status ===
                      "Closed"
                  ).length
                }

              </h3>

              <p>

                Closed Tickets

              </p>

            </div>


          </div>

        </section>



        {/* ====================================
            SUCCESS MESSAGE
        ==================================== */}

        {message && (

          <div className="success-message">

            {message}

          </div>

        )}



        {/* ====================================
            ERROR MESSAGE
        ==================================== */}

        {error && (

          <div className="error-message">

            {error}

          </div>

        )}



        {/* ====================================
            CREATE TICKET
        ==================================== */}

        <section className="create-ticket-section">


          <h2>

            🎫 Create New Support Ticket

          </h2>


          <p>

            Tell us about your problem
            and our support team will
            help you.

          </p>


          <form

            className="ticket-form"

            onSubmit={
              handleCreateTicket
            }

          >


            {/* TITLE */}

            <label>

              Ticket Title

            </label>


            <input

              type="text"

              placeholder="Example: Problem with my order"

              value={title}

              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }

              disabled={creating}

              required

            />



            {/* DESCRIPTION */}

            <label>

              Description

            </label>


            <textarea

              placeholder="Describe your problem in detail..."

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              rows="5"

              disabled={creating}

              required

            />



            {/* PRIORITY */}

            <label>

              Priority

            </label>


            <select

              value={priority}

              onChange={(e) =>
                setPriority(
                  e.target.value
                )
              }

              disabled={creating}

            >

              <option value="Low">

                Low

              </option>


              <option value="Medium">

                Medium

              </option>


              <option value="High">

                High

              </option>

            </select>



            {/* CREATE BUTTON */}

            <button

              type="submit"

              className="primary-btn"

              disabled={creating}

            >

              {creating

                ? "Creating Ticket..."

                : "Create Ticket"

              }

            </button>


          </form>

        </section>



        {/* ====================================
            MY TICKETS
        ==================================== */}

        <section className="my-tickets-section">


          <div className="section-header">


            <div>

              <h2>

                📋 My Support Tickets

              </h2>


              <p>

                View and manage your
                support requests.

              </p>

            </div>


            <button

              className="secondary-btn"

              onClick={
                loadDashboard
              }

            >

              🔄 Refresh

            </button>


          </div>



          {/* ==================================
              NO TICKETS
          ================================== */}

          {tickets.length === 0 && (

            <div className="no-tickets">

              <div className="empty-icon">

                🎫

              </div>


              <h3>

                No Tickets Yet

              </h3>


              <p>

                Create your first
                support ticket above.

              </p>

            </div>

          )}



          {/* ==================================
              TICKET LIST
          ================================== */}

          {tickets.length > 0 && (

            <div className="tickets-grid">


              {tickets.map(
                (ticket) => (

                  <div

                    className="ticket-card"

                    key={
                      ticket.id
                    }

                  >


                    {/* TICKET HEADER */}

                    <div className="ticket-card-header">


                      <span className="ticket-id">

                        #{ticket.id}

                      </span>


                      <span

                        className={

                          ticket.status ===
                          "Closed"

                            ? "status closed"

                            : "status open"

                        }

                      >

                        {ticket.status ||
                          "Open"
                        }

                      </span>


                    </div>



                    {/* TITLE */}

                    <h3>

                      {ticket.title}

                    </h3>



                    {/* DESCRIPTION */}

                    <p>

                      {ticket.description}

                    </p>



                    {/* PRIORITY */}

                    <div className="ticket-priority">

                      Priority:

                      {" "}

                      <strong>

                        {ticket.priority ||
                          "Medium"
                        }

                      </strong>

                    </div>



                    {/* VIEW BUTTON */}

                    <button

                      className="primary-btn full"

                      onClick={() => {

                        handleViewTicket(
                          ticket.id
                        );

                      }}

                    >

                      View Ticket

                    </button>


                  </div>

                )
              )}

            </div>

          )}

        </section>


      </main>


      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="dashboard-footer">

        <p>

          🤖 AI Customer Support Platform

        </p>

        <p>

          Smart support.
          Faster solutions.
          Happier customers.

        </p>

      </footer>


    </div>

  );

}


export default Dashboard;