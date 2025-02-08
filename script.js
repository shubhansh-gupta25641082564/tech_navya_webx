// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Reference to key DOM elements
    const createEventForm = document.getElementById("create-event-form");
    const eventsFeed = document.getElementById("events-feed");
    const totalEventsEl = document.getElementById("total-events");
    const ticketsSoldEl = document.getElementById("tickets-sold");
    const upcomingEventsEl = document.getElementById("upcoming-events");
  
    // Ticket Booking Modal Elements
    const ticketModal = document.getElementById("ticket-modal");
    const closeTicketModalBtn = document.getElementById("close-ticket-modal");
    const ticketForm = document.getElementById("ticket-form");
    const modalEventInfo = document.getElementById("modal-event-info");
  
    // Edit Event Modal Elements
    const editModal = document.getElementById("edit-modal");
    const closeEditModalBtn = document.getElementById("close-edit-modal");
    const editEventForm = document.getElementById("edit-event-form");
    const editEventIdInput = document.getElementById("edit-event-id");
    const editEventNameInput = document.getElementById("edit-event-name");
    const editEventDateInput = document.getElementById("edit-event-date");
    const editEventDescriptionInput = document.getElementById("edit-event-description");
    const editTicketPriceInput = document.getElementById("edit-ticket-price");
  
    // Search and Filter Controls
    const searchInput = document.getElementById("search-input");
    const filterStatusSelect = document.getElementById("filter-status");
  
    // Data store for events and tickets
    let events = [];
    let ticketsSold = 0;
  
    // Utility: Create a date object for today with no time (midnight)
    function getTodayNoTime() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  
    // Update the dashboard stats
    function updateDashboard() {
      totalEventsEl.textContent = events.length;
      const todayNoTime = getTodayNoTime();
      // Upcoming events: events scheduled after today (current events excluded)
      upcomingEventsEl.textContent = events.filter(ev => {
        const eventDate = new Date(ev.date + "T00:00:00");
        return eventDate > todayNoTime;
      }).length;
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
        <button class="edit-event" data-id="${event.id}">Edit Event</button>
        <button class="delete-event" data-id="${event.id}">Delete Event</button>
      `;
      return card;
    }
  
    // Render events with search and filtering applied
    function renderEvents() {
      const searchQuery = searchInput.value.toLowerCase();
      const filterStatus = filterStatusSelect.value;
      let filteredEvents = events;
  
      // Filter events based on search query (matches name or description)
      if (searchQuery) {
        filteredEvents = filteredEvents.filter(ev =>
          ev.name.toLowerCase().includes(searchQuery) ||
          ev.description.toLowerCase().includes(searchQuery)
        );
      }
  
      const todayNoTime = getTodayNoTime();
  
      // Filter events based on status
      if (filterStatus === "upcoming") {
        // Upcoming: only events after today (current events excluded)
        filteredEvents = filteredEvents.filter(ev => {
          const eventDate = new Date(ev.date + "T00:00:00");
          return eventDate > todayNoTime;
        });
      } else if (filterStatus === "current") {
        // Current: only events scheduled for today
        filteredEvents = filteredEvents.filter(ev => {
          const eventDate = new Date(ev.date + "T00:00:00");
          return eventDate.getTime() === todayNoTime.getTime();
        });
      } else if (filterStatus === "past") {
        // Past: only events before today
        filteredEvents = filteredEvents.filter(ev => {
          const eventDate = new Date(ev.date + "T00:00:00");
          return eventDate < todayNoTime;
        });
      }
      
      // Clear and render filtered events
      eventsFeed.innerHTML = "";
      filteredEvents.forEach(ev => {
        const card = createEventCard(ev);
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
  
    // Delegate click events for booking, editing, and deleting events
    eventsFeed.addEventListener("click", (e) => {
      const eventId = e.target.getAttribute("data-id");
  
      // Handle ticket booking button click
      if (e.target.classList.contains("book-ticket")) {
        const eventObj = events.find(ev => ev.id == eventId);
        if (eventObj) {
          openTicketModal(eventObj);
        }
      }
  
      // Handle delete event button click
      if (e.target.classList.contains("delete-event")) {
        events = events.filter(ev => ev.id != eventId);
        renderEvents();
        updateDashboard();
      }
  
      // Handle edit event button click
      if (e.target.classList.contains("edit-event")) {
        const eventObj = events.find(ev => ev.id == eventId);
        if (eventObj) {
          openEditModal(eventObj);
        }
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
  
    // Close the ticket modal when the close button is clicked
    closeTicketModalBtn.addEventListener("click", () => {
      ticketModal.style.display = "none";
      ticketForm.reset();
    });
  
    // Handle ticket booking submission
    ticketForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const buyerName = document.getElementById("buyer-name").value;
      const buyerEmail = document.getElementById("buyer-email").value;
      // Simulate ticket booking confirmation (backend integration can be added here)
      alert(
        `Ticket booked successfully for ${buyerName}!\nConfirmation sent to ${buyerEmail}.`
      );
      ticketsSold++;
      updateDashboard();
      ticketModal.style.display = "none";
      ticketForm.reset();
    });
  
    // Open the edit modal and pre-fill the form with event details
    function openEditModal(eventObj) {
      editEventIdInput.value = eventObj.id;
      editEventNameInput.value = eventObj.name;
      editEventDateInput.value = eventObj.date;
      editEventDescriptionInput.value = eventObj.description;
      editTicketPriceInput.value = eventObj.ticketPrice;
      editModal.style.display = "block";
    }
  
    // Close the edit modal when the close button is clicked
    closeEditModalBtn.addEventListener("click", () => {
      editModal.style.display = "none";
      editEventForm.reset();
    });
  
    // Handle edit event form submission
    editEventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = editEventIdInput.value;
      const updatedName = editEventNameInput.value;
      const updatedDate = editEventDateInput.value;
      const updatedDescription = editEventDescriptionInput.value;
      const updatedTicketPrice = editTicketPriceInput.value;
  
      // Update the event in the events array
      events = events.map(ev => {
        if (ev.id == id) {
          return {
            ...ev,
            name: updatedName,
            date: updatedDate,
            description: updatedDescription,
            ticketPrice: updatedTicketPrice,
          };
        }
        return ev;
      });
      renderEvents();
      updateDashboard();
      editModal.style.display = "none";
      editEventForm.reset();
    });
  
    // Event listeners for search and filter controls
    searchInput.addEventListener("input", renderEvents);
    filterStatusSelect.addEventListener("change", renderEvents);
  
    // Initial dashboard update
    updateDashboard();
  });
  