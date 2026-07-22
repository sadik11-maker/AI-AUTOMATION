import { useState } from "react";
import { createTicket } from "./api";

function TicketForm({ onTicketCreated, onCancel }) {

  // ==========================================
  // FORM STATES
  // ==========================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ==========================================
  // CREATE TICKET
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    // Validation

    if (!title.trim()) {
      setError("Please enter a ticket title.");
      return;
    }


    if (!description.trim()) {
      setError("Please enter a ticket description.");
      return;
    }


    setLoading(true);


    try {

      const data = await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority: priority,
      });


      console.log(
        "Ticket Created:",
        data
      );


      setSuccess(
        "Ticket created successfully!"
      );


      // Clear form

      setTitle("");
      setDescription("");
      setPriority("Medium");


      // Tell Dashboard to reload tickets

      if (onTicketCreated) {
        onTicketCreated();
      }


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

      setLoading(false);

    }

  };


  return (

    <div className="ticket-form-container">

      {/* ======================================
          FORM HEADER
      ====================================== */}

      <div className="ticket-form-header">

        <div>

          <h2>
            Create New Support Ticket
          </h2>

          <p>
            Tell us about your problem and
            our support team will help you.
          </p>

        </div>


        <button
          type="button"
          className="close-form-btn"
          onClick={onCancel}
        >
          ×
        </button>

      </div>


      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (

        <div className="ticket-error">
          {error}
        </div>

      )}


      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {success && (

        <div className="ticket-success">
          {success}
        </div>

      )}


      {/* ======================================
          TICKET FORM
      ====================================== */}

      <form onSubmit={handleSubmit}>

        {/* TITLE */}

        <div className="form-group">

          <label>
            Ticket Title
          </label>

          <input
            type="text"
            placeholder="Example: Problem with my order"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

        </div>


        {/* DESCRIPTION */}

        <div className="form-group">

          <label>
            Description
          </label>

          <textarea
            placeholder="Describe your problem in detail..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows="6"
          />

        </div>


        {/* PRIORITY */}

        <div className="form-group">

          <label>
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
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

        </div>


        {/* BUTTONS */}

        <div className="ticket-form-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >

            {loading
              ? "Creating Ticket..."
              : "Create Ticket"
            }

          </button>

        </div>

      </form>

    </div>

  );
}

export default TicketForm;