// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Global variables for events and tickets sold
    let events = [];
    let ticketsSold = 0;
  
    // Load data from localStorage
    function loadData() {
      const eventsData = localStorage.getItem("eventsData");
      if (eventsData) {
        try {
          events = JSON.parse(eventsData);
        } catch (e) {
          events = [];
        }
      } else {
        events = [];
      }
      const tickets = localStorage.getItem("ticketsSold");
      if (tickets) {
        ticketsSold = parseInt(tickets);
      } else {
        ticketsSold = 0;
      }
    }
  
    // Save data to localStorage
    function saveData() {
      localStorage.setItem("eventsData", JSON.stringify(events));
      localStorage.setItem("ticketsSold", ticketsSold.toString());
    }
  
    // Load persisted data on page load
    loadData();
  
    // Reference to key DOM elements
    const createEventForm = document.getElementById("create-event-form");
    const eventsFeed = document.getElementById("events-feed");
    const totalEventsEl = document.getElementById("total-events");
    const ticketsSoldEl = document.getElementById("tickets-sold");
    const upcomingEventsEl = document.getElementById("upcoming-events");
    const totalRsvpsEl = document.getElementById("total-rsvps");
  
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
    const editEventImageInput = document.getElementById("edit-event-image");
  
    // RSVP Modal Elements
    const rsvpModal = document.getElementById("rsvp-modal");
    const closeRsvpModalBtn = document.getElementById("close-rsvp-modal");
    const rsvpForm = document.getElementById("rsvp-form");
    const rsvpModalInfo = document.getElementById("rsvp-modal-info");
  
    // Search and Filter Controls
    const searchInput = document.getElementById("search-input");
    const filterStatusSelect = document.getElementById("filter-status");
    const filterCategorySelect = document.getElementById("filter-category");
  
    // Initialize FullCalendar (if using calendar integration)
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
  
    // Function to validate an image file (extension, size, and dimensions)
    function validateImage(file, onValid, onError) {
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        onError("Unsupported file type. Allowed types: JPG, JPEG, PNG.");
        return;
      }
      const maxSize = 2 * 1024 * 1024; // 2MB limit
      if (file.size > maxSize) {
        onError("File size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = function() {
          const width = img.width;
          const height = img.height;
          // Check dimensions (minimum 150x150, maximum 300x300 as per your settings)
          if (width < 150 || height < 150) {
            onError("Image dimensions are too small. Minimum size is 150x150 pixels.");
            return;
          }
          if (width > 300 || height > 300) {
            onError("Image dimensions are too large. Maximum allowed is 300x300 pixels.");
            return;
          }
          onValid(dataUrl);
        };
        img.onerror = function() {
          onError("Error loading image. Please select a valid image file.");
        };
        img.src = dataUrl;
      };
      reader.onerror = function() {
        onError("Error reading file.");
      };
      reader.readAsDataURL(file);
    }
  
    // Update the dashboard stats
    function updateDashboard() {
      totalEventsEl.textContent = events.length;
      const todayNoTime = getTodayNoTime();
      upcomingEventsEl.textContent = events.filter(ev => {
        const eventDate = new Date(ev.date + "T00:00:00");
        return eventDate > todayNoTime;
      }).length;
      ticketsSoldEl.textContent = ticketsSold;
      // Calculate total RSVPs across all events
      let totalRsvp = 0;
      events.forEach(ev => {
        totalRsvp += ev.rsvpCount ? ev.rsvpCount : 0;
      });
      totalRsvpsEl.textContent = totalRsvp;
    }
  
    // Update the calendar with all events
    function updateCalendarEvents() {
      calendar.removeAllEvents();
      events.forEach(ev => {
        calendar.addEvent({
          id: ev.id.toString(),
          title: ev.name,
          start: ev.date,
          extendedProps: {
            description: ev.description,
            category: ev.category
          }
        });
      });
    }
  
    // Helper function to generate a shareable URL for an event
    function getEventUrl(event) {
      return encodeURIComponent("https://example.com/event?id=" + event.id);
    }
  
    // Create an event card element from an event object
    function createEventCard(event) {
      const card = document.createElement("div");
      card.classList.add("event-card");
      let imageHTML = "";
      if (event.image) {
        imageHTML = `<img src="${event.image}" class="event-image" alt="Event Image">`;
      }
      
      const eventUrl = getEventUrl(event);
      const shareText = encodeURIComponent("Check out this event: " + event.name);
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${eventUrl}`;
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${eventUrl}`;
      const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${eventUrl}`;
    
      card.innerHTML = `
        ${imageHTML}
        <div class="card-content">
          <h3>${event.name}</h3>
          <p class="event-date">${event.date}</p>
          <p>${event.description}</p>
          <p><strong>Ticket Price:</strong> $${event.ticketPrice}</p>
          <p><strong>Category:</strong> ${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</p>
          <p class="rsvp-count"><strong>RSVPs:</strong> ${event.rsvpCount ? event.rsvpCount : 0}</p>
          <!-- Action buttons in one row -->
          <div class="action-buttons">
            <button class="book-ticket" data-id="${event.id}">Book Ticket</button>
            <button class="rsvp-event" data-id="${event.id}">RSVP</button>
            <button class="edit-event" data-id="${event.id}">Edit Event</button>
            <button class="delete-event" data-id="${event.id}">Delete Event</button>
          </div>
          <div class="share-buttons">
            <span>Share: </span>
            <a href="${facebookShareUrl}" target="_blank" class="share-btn facebook">Facebook</a>
            <a href="${twitterShareUrl}" target="_blank" class="share-btn twitter">Twitter</a>
            <a href="${linkedInShareUrl}" target="_blank" class="share-btn linkedin">LinkedIn</a>
          </div>
        </div>
      `;
      return card;
    }
    
    // Render events with search, status, and category filtering applied
    function renderEvents() {
      const searchQuery = searchInput.value.toLowerCase();
      const filterStatus = filterStatusSelect.value;
      const filterCategory = filterCategorySelect.value;
      let filteredEvents = events;
    
      if (searchQuery) {
        filteredEvents = filteredEvents.filter(ev =>
          ev.name.toLowerCase().includes(searchQuery) ||
          ev.description.toLowerCase().includes(searchQuery)
        );
      }
    
      const todayNoTime = getTodayNoTime();
    
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
    
      if (filterCategory !== "all") {
        filteredEvents = filteredEvents.filter(ev => ev.category === filterCategory);
      }
      
      eventsFeed.innerHTML = "";
      filteredEvents.forEach(ev => {
        const card = createEventCard(ev);
        eventsFeed.appendChild(card);
      });
    }
    
    // Handle new event creation with image upload support and validations
    createEventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("event-name").value;
      const date = document.getElementById("event-date").value;
      const description = document.getElementById("event-description").value;
      const ticketPrice = document.getElementById("ticket-price").value;
      const category = document.getElementById("event-category").value;
      const imageInput = document.getElementById("event-image");
      const file = imageInput.files[0];
    
      function addEvent(imageData = null) {
        const eventObj = {
          id: Date.now(),
          name,
          date,
          description,
          ticketPrice,
          category,
          image: imageData,
          rsvpCount: 0
        };
    
        events.unshift(eventObj);
        renderEvents();
        updateDashboard();
        updateCalendarEvents();
        createEventForm.reset();
        saveData();
      }
    
      if (file) {
        validateImage(file,
          function(dataUrl) {
            addEvent(dataUrl);
          },
          function(errorMsg) {
            alert(errorMsg);
          }
        );
      } else {
        addEvent();
      }
    });
    
    // Delegate click events for booking, editing, deleting, and RSVPing events
    eventsFeed.addEventListener("click", (e) => {
      const eventId = e.target.getAttribute("data-id");
    
      if (e.target.classList.contains("book-ticket")) {
        const eventObj = events.find(ev => ev.id == eventId);
        if (eventObj) {
          openTicketModal(eventObj);
        }
      }
    
      if (e.target.classList.contains("rsvp-event")) {
        const eventObj = events.find(ev => ev.id == eventId);
        if (eventObj) {
          openRsvpModal(eventObj);
        }
      }
    
      if (e.target.classList.contains("delete-event")) {
        events = events.filter(ev => ev.id != eventId);
        renderEvents();
        updateDashboard();
        updateCalendarEvents();
        saveData();
      }
    
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
    
    closeTicketModalBtn.addEventListener("click", () => {
      ticketModal.style.display = "none";
      ticketForm.reset();
    });
    
    ticketForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const buyerName = document.getElementById("buyer-name").value;
      const buyerEmail = document.getElementById("buyer-email").value;
      alert(`Ticket booked successfully for ${buyerName}!\nConfirmation sent to ${buyerEmail}.`);
      ticketsSold++;
      updateDashboard();
      ticketModal.style.display = "none";
      ticketForm.reset();
      saveData();
    });
    
    // Open the RSVP modal and pre-fill with event details
    function openRsvpModal(eventObj) {
      rsvpModalInfo.innerHTML = `
        <p><strong>Event:</strong> ${eventObj.name}</p>
        <p><strong>Date:</strong> ${eventObj.date}</p>
        <p><strong>Category:</strong> ${eventObj.category.charAt(0).toUpperCase() + eventObj.category.slice(1)}</p>
      `;
      rsvpModal.dataset.eventId = eventObj.id;
      rsvpModal.style.display = "block";
    }
    
    closeRsvpModalBtn.addEventListener("click", () => {
      rsvpModal.style.display = "none";
      rsvpForm.reset();
    });
    
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rsvpName = document.getElementById("rsvp-name").value;
      const rsvpEmail = document.getElementById("rsvp-email").value;
      const eventId = rsvpModal.dataset.eventId;
      events = events.map(ev => {
        if (ev.id == eventId) {
          const currentCount = ev.rsvpCount ? ev.rsvpCount : 0;
          return { ...ev, rsvpCount: currentCount + 1 };
        }
        return ev;
      });
      alert(`RSVP submitted for ${rsvpName}!`);
      updateDashboard();
      renderEvents();
      rsvpModal.style.display = "none";
      rsvpForm.reset();
      saveData();
    });
    
    // Open the edit modal and pre-fill with event details
    function openEditModal(eventObj) {
      editEventIdInput.value = eventObj.id;
      editEventNameInput.value = eventObj.name;
      editEventDateInput.value = eventObj.date;
      editEventDescriptionInput.value = eventObj.description;
      editTicketPriceInput.value = eventObj.ticketPrice;
      editEventCategorySelect.value = eventObj.category;
      editEventImageInput.value = "";
      editModal.style.display = "block";
    }
    
    closeEditModalBtn.addEventListener("click", () => {
      editModal.style.display = "none";
      editEventForm.reset();
    });
    
    editEventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = editEventIdInput.value;
      const updatedName = editEventNameInput.value;
      const updatedDate = editEventDateInput.value;
      const updatedDescription = editEventDescriptionInput.value;
      const updatedTicketPrice = editTicketPriceInput.value;
      const updatedCategory = editEventCategorySelect.value;
      const imageInput = editEventImageInput;
      const file = imageInput.files[0];
    
      function updateEvent(imageData) {
        events = events.map(ev => {
          if (ev.id == id) {
            return {
              ...ev,
              name: updatedName,
              date: updatedDate,
              description: updatedDescription,
              ticketPrice: updatedTicketPrice,
              category: updatedCategory,
              image: imageData !== undefined ? imageData : ev.image
            };
          }
          return ev;
        });
        renderEvents();
        updateDashboard();
        updateCalendarEvents();
        editModal.style.display = "none";
        editEventForm.reset();
        saveData();
      }
    
      if (file) {
        validateImage(file,
          function(dataUrl) {
            updateEvent(dataUrl);
          },
          function(errorMsg) {
            alert(errorMsg);
          }
        );
      } else {
        updateEvent();
      }
    });
    
    searchInput.addEventListener("input", renderEvents);
    filterStatusSelect.addEventListener("change", renderEvents);
    filterCategorySelect.addEventListener("change", renderEvents);
    
    updateDashboard();
    renderEvents();
    updateCalendarEvents();
  });
  