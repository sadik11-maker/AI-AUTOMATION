const API_URL = "http://127.0.0.1:8000";


// ==========================================
// HELPER: GET TOKEN
// ==========================================

function getToken() {

  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error(
      "You are not logged in."
    );
  }

  return token;
}


// ==========================================
// HELPER: HANDLE RESPONSE
// ==========================================

async function handleResponse(response) {

  const data =
    await response.json().catch(
      () => ({})
    );


  if (!response.ok) {

    throw new Error(
      data.detail ||
      data.message ||
      `Request failed: ${response.status}`
    );

  }


  return data;

}



// ==========================================
// REGISTER USER
// ==========================================

export async function registerUser(
  userData
) {

  const response = await fetch(
    `${API_URL}/register`,
    {

      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        userData
      ),

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// LOGIN USER
// ==========================================

export async function loginUser(
  email,
  password
) {

  const formData =
    new URLSearchParams();


  formData.append(
    "username",
    email
  );


  formData.append(
    "password",
    password
  );


  const response = await fetch(
    `${API_URL}/login`,
    {

      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: formData,

    }
  );


  const data =
    await handleResponse(
      response
    );


  // Save JWT Token

  localStorage.setItem(
    "access_token",
    data.access_token
  );


  // Save User Role

  if (data.role) {

    localStorage.setItem(
      "role",
      data.role
    );

  }


  return data;

}



// ==========================================
// GET CURRENT USER
// ==========================================

export async function getCurrentUser() {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/me`,
    {

      method: "GET",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// GET MY PROFILE
// ==========================================

export async function getMyProfile() {

  return await getCurrentUser();

}



// ==========================================
// LOGOUT
// ==========================================

export function logoutUser() {

  localStorage.removeItem(
    "access_token"
  );


  localStorage.removeItem(
    "role"
  );

}



// ==========================================
// GET MY TICKETS
// ==========================================

export async function getMyTickets() {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets`,
    {

      method: "GET",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// GET SINGLE TICKET
// ==========================================

export async function getTicketById(
  ticketId
) {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets/${ticketId}`,
    {

      method: "GET",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// CREATE NEW TICKET
// ==========================================

export async function createTicket(
  ticketData
) {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets`,
    {

      method: "POST",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },


      body: JSON.stringify({

        title:
          ticketData.title,

        description:
          ticketData.description,

        priority:
          ticketData.priority,

      }),

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// UPDATE TICKET
// ==========================================

export async function updateTicket(
  ticketId,
  ticketData
) {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets/${ticketId}`,
    {

      method: "PUT",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },


      body: JSON.stringify({

        title:
          ticketData.title,

        description:
          ticketData.description,

        priority:
          ticketData.priority,

      }),

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// CLOSE TICKET
// ==========================================

export async function closeTicket(
  ticketId
) {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/close`,
    {

      method: "PATCH",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// DELETE TICKET
// ==========================================

export async function deleteTicket(
  ticketId
) {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets/${ticketId}`,
    {

      method: "DELETE",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// GET TICKET COMMENTS
// ==========================================

export async function getTicketComments(
  ticketId
) {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/comments`,
    {

      method: "GET",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },

    }
  );


  return await handleResponse(
    response
  );

}



// ==========================================
// ADD TICKET COMMENT
// ==========================================

export async function addTicketComment(
  ticketId,
  commentText
) {

  const token =
    getToken();


  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/comments`,
    {

      method: "POST",

      headers: {

        "Authorization":
          `Bearer ${token}`,

        "Content-Type":
          "application/json",

      },


      body: JSON.stringify({

        content:
          commentText,

      }),

    }
  );


  return await handleResponse(
    response
  );

}