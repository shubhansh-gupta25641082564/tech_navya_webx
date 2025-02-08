// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Reference to key DOM elements
    const createEventForm = document.getElementById("create-event-form");
    const eventsFeed = document.getElementById("events-feed");
    const totalEventsEl = document.getElementById("total-events");
    const ticketsSoldEl = document.getElementById("tickets-sold");
    const upcomingEventsEl = document.getElementById("upcoming-events");
  
    const ticketModal = document.getElementById("ticket-modal");
    const closeModalBtn = document.getElementById("close-modal");
    const ticketForm = document.getElementById("ticket-form");
    const modalEventInfo = document.getElementById("modal-event-info");
  
    // Data store for events and tickets
    let events = [];
    let ticketsSold = 0;
  
    // Update the dashboard stats
    function updateDashboard() {
      totalEventsEl.textContent = events.length;
      upcomingEventsEl.textContent = events.length; // Simplified as "upcoming" count
      ticketsSoldEl.textContent = ticketsSold;
    }
  
    // Create an event card element from an event object
    function createEventCard(event) {
      const card = document.createElement("div");
      card.classList.add("event-card");
      card.innerHTML = `
        <h3>${event.name}</h3>
        <p class="event-date">${event.date}</p>
        <p>${event.description}</p>
        <p><strong>Ticket Price:</strong> $${event.ticketPrice}</p>
        <button class="book-ticket" data-id="${event.id}">Book Ticket</button>
        <button class="delete-event" data-id="${event.id}">Delete Event</button>
      `;
      return card;
    }
  
    // Render the list of events to the feed
    function renderEvents() {
      eventsFeed.innerHTML = "";
      events.forEach((event) => {
        const card = createEventCard(event);
        eventsFeed.appendChild(card);
      });
    }
  
    // Handle new event creation
    createEventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("event-name").value;
      const date = document.getElementById("event-date").value;
      const description = document.getElementById("event-description").value;
      const ticketPrice = document.getElementById("ticket-price").value;
  
      // Create an event object with a unique ID
      const eventObj = {
        id: Date.now(),
        name,
        date,
        description,
        ticketPrice,
      };
  
      // Add new event to the beginning of the events array
      events.unshift(eventObj);
      renderEvents();
      updateDashboard();
      createEventForm.reset();
    });
  
    // Delegate click events for booking tickets and deleting events
    eventsFeed.addEventListener("click", (e) => {
      const eventId = e.target.getAttribute("data-id");
  
      // Handle ticket booking button click
      if (e.target.classList.contains("book-ticket")) {
        const eventObj = events.find((ev) => ev.id == eventId);
        if (eventObj) {
          openTicketModal(eventObj);
        }
      }
  
      // Handle delete event button click
      if (e.target.classList.contains("delete-event")) {
        // Remove the event from the events array
        events = events.filter((ev) => ev.id != eventId);
        renderEvents();
        updateDashboard();
      }
    });
  
    // Open the ticket booking modal and display event details
    function openTicketModal(eventObj) {
      modalEventInfo.innerHTML = `
        <p><strong>Event:</strong> ${eventObj.name}</p>
        <p><strong>Date:</strong> ${eventObj.date}</p>
        <p><strong>Price:</strong> $${eventObj.ticketPrice}</p>
      `;
      ticketModal.style.display = "block";
      ticketModal.dataset.eventId = eventObj.id;
    }
  
    // Close the modal when the close button is clicked
    closeModalBtn.addEventListener("click", () => {
      ticketModal.style.display = "none";
      ticketForm.reset();
    });
  
    // Handle ticket booking submission
    ticketForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const buyerName = document.getElementById("buyer-name").value;
      const buyerEmail = document.getElementById("buyer-email").value;
      // Simulate ticket booking confirmation (you can integrate with your backend here)
      alert(
        `Ticket booked successfully for ${buyerName}!\nConfirmation sent to ${buyerEmail}.`
      );
      ticketsSold++;
      updateDashboard();
      ticketModal.style.display = "none";
      ticketForm.reset();
    });
  
    // Initial dashboard update
    updateDashboard();
  });
  