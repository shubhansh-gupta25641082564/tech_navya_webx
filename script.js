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
    const editEventCategorySelect = document.getElementById("edit-event-category");
  
    // Search and Filter Controls
    const searchInput = document.getElementById("search-input");
    const filterStatusSelect = document.getElementById("filter-status");
    const filterCategorySelect = document.getElementById("filter-category");
  
    // Data store for events and tickets
    let events = [];
    let ticketsSold = 0;
  
    // Initialize FullCalendar
    const calendarEl = document.getElementById("calendar-container");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth'
    });
    calendar.render();
  
    // Utility: Create a date object for today with no time (midnight)
    function getTodayNoTime() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  
    // Update the dashboard stats
    function updateDashboard() {
      totalEventsEl.textContent = events.length;
      const todayNoTime = getTodayNoTime();
      // Upcoming events: only events scheduled after today (current events excluded)
      upcomingEventsEl.textContent = events.filter(ev => {
        const eventDate = new Date(ev.date + "T00:00:00");
        return eventDate > todayNoTime;
      }).length;
      ticketsSoldEl.textContent = ticketsSold;
    }
  
    // Update the calendar with all events
    function updateCalendarEvents() {
      calendar.removeAllEvents();
      events.forEach(ev => {
        calendar.addEvent({
          id: ev.id.toString(),
          title: ev.name,
          start: ev.date, // Assumes format "YYYY-MM-DD"
          extendedProps: {
            description: ev.description,
            category: ev.category
          }
        });
      });
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
        <p><strong>Category:</strong> ${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</p>
        <button class="book-ticket" data-id="${event.id}">Book Ticket</button>
        <button class="edit-event" data-id="${event.id}">Edit Event</button>
        <button class="delete-event" data-id="${event.id}">Delete Event</button>
      `;
      return card;
    }
  
    // Render events with search, status, and category filtering applied
    function renderEvents() {
      const searchQuery = searchInput.value.toLowerCase();
      const filterStatus = filterStatusSelect.value;
      const filterCategory = filterCategorySelect.value;
      let filteredEvents = events;
  
      // Filter based on search query (name or description)
      if (searchQuery) {
        filteredEvents = filteredEvents.filter(ev =>
          ev.name.toLowerCase().includes(searchQuery) ||
          ev.description.toLowerCase().includes(searchQuery)
        );
      }
  
      const todayNoTime = getTodayNoTime();
  
      // Filter based on status: upcoming, current, or past
      if (filterStatus === "upcoming") {
        filteredEvents = filteredEvents.filter(ev => {
          const eventDate = new Date(ev.date + "T00:00:00");
          return eventDate > todayNoTime;
        });
      } else if (filterStatus === "current") {
        filteredEvents = filteredEvents.filter(ev => {
          const eventDate = new Date(ev.date + "T00:00:00");
          return eventDate.getTime() === todayNoTime.getTime();
        });
      } else if (filterStatus === "past") {
        filteredEvents = filteredEvents.filter(ev => {
          const eventDate = new Date(ev.date + "T00:00:00");
          return eventDate < todayNoTime;
        });
      }
  
      // Filter based on event category if not "all"
      if (filterCategory !== "all") {
        filteredEvents = filteredEvents.filter(ev => ev.category === filterCategory);
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
      const category = document.getElementById("event-category").value;
  
      // Create an event object with a unique ID and the selected category
      const eventObj = {
        id: Date.now(),
        name,
        date,
        description,
        ticketPrice,
        category
      };
  
      // Add new event to the beginning of the events array
      events.unshift(eventObj);
      renderEvents();
      updateDashboard();
      updateCalendarEvents();
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
        updateCalendarEvents();
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
        <p><strong>Category:</strong> ${eventObj.category.charAt(0).toUpperCase() + eventObj.category.slice(1)}</p>
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
      editEventCategorySelect.value = eventObj.category;
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
      const updatedCategory = editEventCategorySelect.value;
  
      // Update the event in the events array
      events = events.map(ev => {
        if (ev.id == id) {
          return {
            ...ev,
            name: updatedName,
            date: updatedDate,
            description: updatedDescription,
            ticketPrice: updatedTicketPrice,
            category: updatedCategory
          };
        }
        return ev;
      });
      renderEvents();
      updateDashboard();
      updateCalendarEvents();
      editModal.style.display = "none";
      editEventForm.reset();
    });
  
    // Event listeners for search and filter controls
    searchInput.addEventListener("input", renderEvents);
    filterStatusSelect.addEventListener("change", renderEvents);
    filterCategorySelect.addEventListener("change", renderEvents);
  
    // Initial dashboard update
    updateDashboard();
  });
  