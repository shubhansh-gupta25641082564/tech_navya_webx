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
    const editEventImageInput = document.getElementById("edit-event-image");
  
    // Search and Filter Controls
    const searchInput = document.getElementById("search-input");
    const filterStatusSelect = document.getElementById("filter-status");
    const filterCategorySelect = document.getElementById("filter-category");
  
    // Data store for events and tickets
    let events = [];
    let ticketsSold = 0;
  
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
          // Check dimensions (minimum 300x300, maximum 2000x2000)
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
      // Upcoming events: only events scheduled after today (excluding current)
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
          start: ev.date, // Expected format "YYYY-MM-DD"
          extendedProps: {
            description: ev.description,
            category: ev.category
          }
        });
      });
    }

    // Helper function to generate a shareable URL for an event
function getEventUrl(event) {
    // For demonstration, we use a dummy base URL. Replace with your actual event URL.
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
    
    // Generate social share URLs using the event URL and title
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
        <button class="book-ticket" data-id="${event.id}">Book Ticket</button>
        <button class="edit-event" data-id="${event.id}">Edit Event</button>
        <button class="delete-event" data-id="${event.id}">Delete Event</button>
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
  
      // Filter based on search query (name or description)
      if (searchQuery) {
        filteredEvents = filteredEvents.filter(ev =>
          ev.name.toLowerCase().includes(searchQuery) ||
          ev.description.toLowerCase().includes(searchQuery)
        );
      }
  
      const todayNoTime = getTodayNoTime();
  
      // Filter based on event status
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
  
      // Function to add event (with optional imageData)
      function addEvent(imageData = null) {
        const eventObj = {
          id: Date.now(),
          name,
          date,
          description,
          ticketPrice,
          category,
          image: imageData
        };
  
        events.unshift(eventObj);
        renderEvents();
        updateDashboard();
        updateCalendarEvents();
        createEventForm.reset();
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
      // Clear the file input so user may choose a new image if desired
      editEventImageInput.value = "";
      editModal.style.display = "block";
    }
  
    // Close the edit modal when the close button is clicked
    closeEditModalBtn.addEventListener("click", () => {
      editModal.style.display = "none";
      editEventForm.reset();
    });
  
    // Handle edit event form submission with image update support and validations
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
  
      // Function to update the event (with new imageData if provided)
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
              // Use new image if provided; otherwise keep the existing image
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
        updateEvent(); // No new image selected; keep existing image.
      }
    });
  
    // Event listeners for search and filter controls
    searchInput.addEventListener("input", renderEvents);
    filterStatusSelect.addEventListener("change", renderEvents);
    filterCategorySelect.addEventListener("change", renderEvents);
  
    // Initial dashboard update
    updateDashboard();
  });
  