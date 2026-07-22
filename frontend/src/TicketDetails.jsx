import { useEffect, useState } from "react";

import {
  getTicketById,
  updateTicket,
  closeTicket,
  deleteTicket,
  addTicketComment,
  getTicketComments,
} from "./api";


function TicketDetails({
  ticketId,
  onBack,
  onDeleted,
}) {

  // ==========================================
  // TICKET STATES
  // ==========================================

  const [ticket, setTicket] = useState(null);

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("Medium");


  // ==========================================
  // COMMENT STATES
  // ==========================================

  const [comments, setComments] =
    useState([]);

  const [commentMessage, setCommentMessage] =
    useState("");

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentSaving, setCommentSaving] =
    useState(false);


  // ==========================================
  // LOADING STATES
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // ==========================================
  // MESSAGE STATES
  // ==========================================

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD TICKET
  // ==========================================

  const loadTicket = async () => {

    setLoading(true);

    setError("");

    try {

      const data =
        await getTicketById(ticketId);

      console.log(
        "Ticket Details:",
        data
      );

      setTicket(data);

      setTitle(
        data.title || ""
      );

      setDescription(
        data.description || ""
      );

      setPriority(
        data.priority || "Medium"
      );

    } catch (error) {

      console.error(
        "Get Ticket Error:",
        error
      );

      setError(
        error.message ||
        "Failed to load ticket."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD COMMENTS
  // ==========================================

  const loadComments = async () => {

    setCommentsLoading(true);

    try {

      const data =
        await getTicketComments(ticketId);

      console.log(
        "Ticket Comments:",
        data
      );

      setComments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Get Comments Error:",
        error
      );

      setError(
        error.message ||
        "Failed to load comments."
      );

    } finally {

      setCommentsLoading(false);

    }

  };


  // ==========================================
  // LOAD TICKET + COMMENTS
  // ==========================================

  useEffect(() => {

    if (ticketId) {

      loadTicket();

      loadComments();

    }

  }, [ticketId]);


  // ==========================================
  // UPDATE TICKET
  // ==========================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    setMessage("");

    setError("");


    if (
      !title.trim() ||
      !description.trim()
    ) {

      setError(
        "Title and description are required."
      );

      return;

    }


    setSaving(true);


    try {

      const data =
        await updateTicket(
          ticketId,
          {
            title: title,
            description: description,
            priority: priority,
          }
        );


      console.log(
        "Update Ticket Response:",
        data
      );


      setMessage(
        "Ticket updated successfully!"
      );


      await loadTicket();


    } catch (error) {

      console.error(
        "Update Ticket Error:",
        error
      );


      setError(
        error.message ||
        "Failed to update ticket."
      );


    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // CLOSE TICKET
  // ==========================================

  const handleClose = async () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to close this ticket?"
      );


    if (!confirmed) {

      return;

    }


    setMessage("");

    setError("");

    setSaving(true);


    try {

      const data =
        await closeTicket(ticketId);


      console.log(
        "Close Ticket Response:",
        data
      );


      setMessage(
        "Ticket closed successfully!"
      );


      await loadTicket();


    } catch (error) {

      console.error(
        "Close Ticket Error:",
        error
      );


      setError(
        error.message ||
        "Failed to close ticket."
      );


    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // DELETE TICKET
  // ==========================================

  const handleDelete = async () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this ticket?"
      );


    if (!confirmed) {

      return;

    }


    setMessage("");

    setError("");

    setSaving(true);


    try {

      const data =
        await deleteTicket(ticketId);


      console.log(
        "Delete Ticket Response:",
        data
      );


      alert(
        "Ticket deleted successfully!"
      );


      if (onDeleted) {

        onDeleted();

      } else if (onBack) {

        onBack();

      }


    } catch (error) {

      console.error(
        "Delete Ticket Error:",
        error
      );


      setError(
        error.message ||
        "Failed to delete ticket."
      );


    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // ADD COMMENT
  // ==========================================

  const handleAddComment = async (e) => {

    e.preventDefault();

    setMessage("");

    setError("");


    if (!commentMessage.trim()) {

      setError(
        "Please write a comment."
      );

      return;

    }


    setCommentSaving(true);


    try {

      const data =
        await addTicketComment(
          ticketId,
          commentMessage.trim()
        );


      console.log(
        "Add Comment Response:",
        data
      );


      setCommentMessage("");


      setMessage(
        "Comment added successfully!"
      );


      // Reload comments

      await loadComments();


    } catch (error) {

      console.error(
        "Add Comment Error:",
        error
      );


      setError(
        error.message ||
        "Failed to add comment."
      );


    } finally {

      setCommentSaving(false);

    }

  };


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (

      <div className="ticket-details-page">

        <div className="ticket-details-card">

          <h2>
            Loading Ticket...
          </h2>

          <p>
            Please wait while we load
            the ticket details.
          </p>

        </div>

      </div>

    );

  }


  // ==========================================
  // ERROR / TICKET NOT FOUND
  // ==========================================

  if (!ticket) {

    return (

      <div className="ticket-details-page">

        <div className="ticket-details-card">

          <h2>
            Ticket Not Found
          </h2>


          {error && (

            <div className="error-message">

              {error}

            </div>

          )}


          <button

            className="secondary-btn"

            onClick={onBack}

          >

            ← Back to Tickets

          </button>


        </div>

      </div>

    );

  }


  // ==========================================
  // MAIN UI
  // ==========================================

  return (

    <div className="ticket-details-page">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="ticket-details-header">


        <button

          className="secondary-btn"

          onClick={onBack}

        >

          ← Back to Tickets

        </button>


        <h1>

          Ticket Details

        </h1>


      </div>



      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (

        <div className="success-message">

          {message}

        </div>

      )}



      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (

        <div className="error-message">

          {error}

        </div>

      )}



      {/* ======================================
          TICKET INFORMATION
      ====================================== */}

      <div className="ticket-info-card">


        <div className="ticket-info-row">

          <strong>
            Ticket ID:
          </strong>

          <span>

            #{ticket.id}

          </span>

        </div>



        <div className="ticket-info-row">

          <strong>
            Status:
          </strong>


          <span

            className={

              ticket.status === "Closed"

                ? "status closed"

                : "status open"

            }

          >

            {ticket.status || "Open"}

          </span>

        </div>



        <div className="ticket-info-row">

          <strong>
            Created At:
          </strong>


          <span>

            {ticket.created_at

              ? new Date(
                  ticket.created_at
                ).toLocaleString()

              : "N/A"

            }

          </span>

        </div>


      </div>



      {/* ======================================
          UPDATE FORM
      ====================================== */}

      <div className="ticket-details-card">


        <h2>

          Update Ticket

        </h2>


        <form
          onSubmit={handleUpdate}
        >


          <label>

            Ticket Title

          </label>


          <input

            type="text"

            value={title}

            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }

            placeholder="Enter ticket title"

            disabled={saving}

          />



          <label>

            Description

          </label>


          <textarea

            value={description}

            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }

            placeholder="Describe your problem"

            rows="6"

            disabled={saving}

          />



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

            disabled={saving}

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



          <button

            type="submit"

            className="primary-btn"

            disabled={saving}

          >

            {saving

              ? "Saving..."

              : "Update Ticket"

            }

          </button>


        </form>


      </div>



      {/* ======================================
          TICKET ACTIONS
      ====================================== */}

      <div className="ticket-actions-card">


        <h2>

          Ticket Actions

        </h2>


        <div className="action-buttons">


          {ticket.status !== "Closed" && (

            <button

              className="close-ticket-btn"

              onClick={handleClose}

              disabled={saving}

            >

              {saving

                ? "Processing..."

                : "Close Ticket"

              }

            </button>

          )}



          {ticket.status === "Closed" && (

            <button

              className="disabled-btn"

              disabled

            >

              Ticket Closed

            </button>

          )}



          <button

            className="delete-ticket-btn"

            onClick={handleDelete}

            disabled={saving}

          >

            {saving

              ? "Deleting..."

              : "Delete Ticket"

            }

          </button>


        </div>


      </div>



      {/* ======================================
          COMMENTS SECTION
      ====================================== */}

      <div className="comments-section">


        <h2>

          💬 Ticket Comments

        </h2>


        <p>

          Communicate with the support team
          about this ticket.

        </p>



        {/* ====================================
            ADD COMMENT FORM
        ==================================== */}

        <form

          className="comment-form"

          onSubmit={handleAddComment}

        >


          <textarea

            value={commentMessage}

            onChange={(e) =>
              setCommentMessage(
                e.target.value
              )
            }

            placeholder="Write your comment..."

            rows="4"

            disabled={commentSaving}

          />


          <button

            type="submit"

            className="primary-btn"

            disabled={commentSaving}

          >

            {commentSaving

              ? "Adding Comment..."

              : "Add Comment"

            }

          </button>


        </form>



        {/* ====================================
            COMMENTS LIST
        ==================================== */}

        <div className="comments-list">


          <h3>

            Previous Comments

          </h3>


          {commentsLoading && (

            <p>

              Loading comments...

            </p>

          )}



          {!commentsLoading &&
            comments.length === 0 && (

              <div className="no-comments">

                <p>

                  No comments yet.

                </p>

              </div>

            )
          }



          {!commentsLoading &&
            comments.length > 0 && (

              comments.map(
                (comment) => (

                  <div

                    className="comment-card"

                    key={
                      comment.id
                    }

                  >


                    <div className="comment-header">


                      <strong>

                        User #{comment.user_id}

                      </strong>


                      <span>

                        {comment.created_at

                          ? new Date(
                              comment.created_at
                            ).toLocaleString()

                          : ""

                        }

                      </span>


                    </div>


                    <p>

                      {comment.message}

                    </p>


                  </div>

                )
              )

            )
          }


        </div>


      </div>


    </div>

  );

}


export default TicketDetails;