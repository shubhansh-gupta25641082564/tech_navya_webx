// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    //light & dark
    const themeToggle = document.getElementById("theme-toggle");
    let isLightMode = true; // Default mode

    themeToggle.addEventListener("click", () => {
        // Toggle light/dark mode
        document.body.classList.toggle("light-mode", isLightMode);
        document.body.classList.toggle("dark-mode", !isLightMode);

        // Change image source
        themeToggle.src = isLightMode ? "full-moonpng.png" : "sunpng.png";

        // Update mode
        isLightMode = !isLightMode;
    });

    // -------------------------------
    // Persistence & Authentication Setup
    // -------------------------------
    let events = [];
    let ticketsSold = 0;
    let currentUser = null;

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
        ticketsSold = tickets ? parseInt(tickets) : 0;
        const userData = localStorage.getItem("currentUser");
        currentUser = userData ? JSON.parse(userData) : null;
    }

    function saveData() {
        localStorage.setItem("eventsData", JSON.stringify(events));
        localStorage.setItem("ticketsSold", ticketsSold.toString());
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    loadData();

    // -------------------------------
    // User Authentication Functions
    // -------------------------------
    function loadUsers() {
        const usersData = localStorage.getItem("users");
        return usersData ? JSON.parse(usersData) : [];
    }
    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }
    function updateUserUI() {
        const userAuthDiv = document.getElementById("user-auth");
        userAuthDiv.innerHTML = "";
        if (currentUser) {
            userAuthDiv.innerHTML = `
          <span>Hello, ${currentUser.name}</span>
          <button id="logout-btn">Logout</button>
        `;
            document.getElementById("logout-btn").addEventListener("click", () => {
                currentUser = null;
                saveData();
                updateUserUI();
            });
        } else {
            userAuthDiv.innerHTML = `
          <button id="login-btn">Login</button>
          <button id="register-btn">Register</button>
        `;
            document.getElementById("login-btn").addEventListener("click", () => {
                document.getElementById("login-modal").style.display = "block";
            });
            document.getElementById("register-btn").addEventListener("click", () => {
                document.getElementById("register-modal").style.display = "block";
            });
        }
    }
    updateUserUI();

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

    // Review Modal Elements
    const reviewModal = document.getElementById("review-modal");
    const closeReviewModalBtn = document.getElementById("close-review-modal");
    const reviewForm = document.getElementById("review-form");
    const reviewModalInfo = document.getElementById("review-modal-info");

    // Chat/Discussion Modal Elements
    const chatModal = document.getElementById("chat-modal");
    const closeChatModalBtn = document.getElementById("close-chat-modal");
    const chatForm = document.getElementById("chat-form");
    const chatMessagesDiv = document.getElementById("chat-messages");

    // Login Modal Elements
    const loginModal = document.getElementById("login-modal");
    const closeLoginModalBtn = document.getElementById("close-login-modal");
    const loginForm = document.getElementById("login-form");

    // Register Modal Elements
    const registerModal = document.getElementById("register-modal");
    const closeRegisterModalBtn = document.getElementById("close-register-modal");
    const registerForm = document.getElementById("register-form");

    // NEW: Map Modal Elements
    const mapModal = document.getElementById("map-modal");
    const closeMapModalBtn = document.getElementById("close-map-modal");

    // Search and Filter Controls
    const searchInput = document.getElementById("search-input");
    const filterStatusSelect = document.getElementById("filter-status");
    const filterCategorySelect = document.getElementById("filter-category");

    // Data store for events and tickets
    // let events = [];
    // let ticketsSold = 0;

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

    function validateImage(file, onValid, onError) {
        const allowedExtensions = ["jpg", "jpeg", "png"];
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            onError("Unsupported file type. Allowed types: JPG, JPEG, PNG.");
            return;
        }
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            onError("File size exceeds 2MB limit.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            const dataUrl = e.target.result;
            const img = new Image();
            img.onload = function () {
                const width = img.width;
                const height = img.height;
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
            img.onerror = function () {
                onError("Error loading image. Please select a valid image file.");
            };
            img.src = dataUrl;
        };
        reader.onerror = function () {
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

    function getEventUrl(event) {
        return encodeURIComponent("https://example.com/event?id=" + event.id);
    }

    // -------------------------------
    // Reviews & Ratings Helper
    // -------------------------------
    function calculateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) return "No reviews yet";
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avg = total / reviews.length;
        return avg.toFixed(1) + " (" + reviews.length + " reviews)";
    }

    // -------------------------------
    // Map Integration (Feature 12) - Using existing code from previous steps if needed
    // -------------------------------
    function geocodeAddress(address) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                } else {
                    throw new Error("Location not found.");
                }
            });
    }

    function openMapModal(eventObj) {
        if (!eventObj.location) {
            alert("No location provided for this event.");
            return;
        }
        geocodeAddress(eventObj.location)
            .then(coords => {
                mapModal.style.display = "block";
                const mapContainer = document.getElementById("map");
                mapContainer.innerHTML = "";
                const map = L.map("map").setView([coords.lat, coords.lon], 13);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                L.marker([coords.lat, coords.lon]).addTo(map)
                    .bindPopup(`<b>${eventObj.name}</b><br>${eventObj.location}`)
                    .openPopup();
            })
            .catch(err => {
                alert("Error: " + err.message);
            });
    }

    // -------------------------------
    // Create Event Card with Chat, Reviews, and Map Integration
    // -------------------------------
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

        const averageRating = calculateAverageRating(event.reviews);

        card.innerHTML = `
          ${imageHTML}
          <div class="card-content">
            <h3>${event.name}</h3>
            <p class="event-date">${event.date}</p>
            <p>${event.description}</p>
            <p><strong>Ticket Price:</strong> $${event.ticketPrice}</p>
            <p><strong>Category:</strong> ${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</p>
            <p><strong>Location:</strong> ${event.location || "Not specified"}</p>
            <p><strong>Average Rating:</strong> ${averageRating}</p>
            <p class="rsvp-count"><strong>RSVPs:</strong> ${event.rsvpCount ? event.rsvpCount : 0}</p>
            <div class="action-buttons">
              <button class="book-ticket" data-id="${event.id}">Book Ticket</button>
              <button class="rsvp-event" data-id="${event.id}">RSVP</button>
              <button class="review-event" data-id="${event.id}">Review</button>
              <button class="chat-event" data-id="${event.id}">Chat</button>
              <button class="map-event" data-id="${event.id}">Show Map</button>
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

    // -------------------------------
    // Render Events
    // -------------------------------
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

    // Create Event Handler
    createEventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Please log in to create an event.");
            return;
        }
        const name = document.getElementById("event-name").value;
        const date = document.getElementById("event-date").value;
        const description = document.getElementById("event-description").value;
        const ticketPrice = document.getElementById("ticket-price").value;
        const category = document.getElementById("event-category").value;
        const location = document.getElementById("event-location").value;
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
                location,
                image: imageData,
                rsvpCount: 0,
                reviews: [],
                discussions: [],
                createdBy: currentUser ? currentUser.email : null
            };
            events.unshift(eventObj);
            renderEvents();
            updateDashboard();
            updateCalendarEvents();
            createEventForm.reset();
            saveData();
            checkReminders();
        }

        if (file) {
            validateImage(file,
                function (dataUrl) {
                    addEvent(dataUrl);
                },
                function (errorMsg) {
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

        if (e.target.classList.contains("review-event")) {
            const eventObj = events.find(ev => ev.id == eventId);
            if (eventObj) {
                openReviewModal(eventObj);
            }
        }

        if (e.target.classList.contains("chat-event")) {
            const eventObj = events.find(ev => ev.id == eventId);
            if (eventObj) {
                openChatModal(eventObj);
            }
        }

        if (e.target.classList.contains("map-event")) {
            const eventObj = events.find(ev => ev.id == eventId);
            if (eventObj) {
                openMapModal(eventObj);
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
        alert(`Ticket booked successfully for ${buyerName}!\nConfirmation sent to ${buyerEmail}.`);
        ticketsSold++;
        updateDashboard();
        ticketModal.style.display = "none";
        ticketForm.reset();
        saveData();
    });

    // -------------------------------
    // RSVP Modal Handlers
    // -------------------------------
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

    // -------------------------------
    // Review Modal Handlers
    // -------------------------------
    function openReviewModal(eventObj) {
        reviewModalInfo.innerHTML = `
          <p><strong>Event:</strong> ${eventObj.name}</p>
          <p><strong>Date:</strong> ${eventObj.date}</p>
        `;
        reviewModal.dataset.eventId = eventObj.id;
        reviewModal.style.display = "block";
    }

    document.getElementById("close-review-modal").addEventListener("click", () => {
        reviewModal.style.display = "none";
        reviewForm.reset();
    });

    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rating = parseInt(document.getElementById("review-rating").value);
        const reviewText = document.getElementById("review-text").value;
        const eventId = reviewModal.dataset.eventId;
        events = events.map(ev => {
            if (ev.id == eventId) {
                const newReview = { rating, reviewText };
                const reviews = ev.reviews ? ev.reviews : [];
                reviews.push(newReview);
                return { ...ev, reviews };
            }
            return ev;
        });
        alert("Review submitted!");
        renderEvents();
        reviewModal.style.display = "none";
        reviewForm.reset();
        saveData();
    });

    // -------------------------------
    // Chat/Discussion Modal Handlers
    // -------------------------------
    function openChatModal(eventObj) {
        renderChatMessages(eventObj);
        chatModal.dataset.eventId = eventObj.id;
        chatModal.style.display = "block";
    }

    function renderChatMessages(eventObj) {
        if (!eventObj.discussions) eventObj.discussions = [];
        chatMessagesDiv.innerHTML = "";
        eventObj.discussions.forEach(msg => {
            const msgDiv = document.createElement("div");
            msgDiv.classList.add("chat-message");
            msgDiv.innerHTML = `<strong>${msg.sender}:</strong> ${msg.message} <span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>`;
            chatMessagesDiv.appendChild(msgDiv);
        });
    }

    closeChatModalBtn.addEventListener("click", () => {
        chatModal.style.display = "none";
        chatForm.reset();
    });

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = document.getElementById("chat-message").value;
        const eventId = chatModal.dataset.eventId;
        if (!currentUser) {
            alert("Please log in to participate in discussions.");
            return;
        }
        events = events.map(ev => {
            if (ev.id == eventId) {
                if (!ev.discussions) ev.discussions = [];
                ev.discussions.push({
                    sender: currentUser.name,
                    message,
                    timestamp: new Date().toISOString()
                });
                return ev;
            }
            return ev;
        });
        const eventObj = events.find(ev => ev.id == eventId);
        renderChatMessages(eventObj);
        chatForm.reset();
        saveData();
    });

    // -------------------------------
    // Map Integration (Feature 12 - Using existing code for location)
    // -------------------------------
    function openMapModal(eventObj) {
        if (!eventObj.location) {
            alert("No location provided for this event.");
            return;
        }
        geocodeAddress(eventObj.location)
            .then(coords => {
                mapModal.style.display = "block";
                const mapContainer = document.getElementById("map");
                mapContainer.innerHTML = "";
                const map = L.map("map").setView([coords.lat, coords.lon], 13);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);
                L.marker([coords.lat, coords.lon]).addTo(map)
                    .bindPopup(`<b>${eventObj.name}</b><br>${eventObj.location}`)
                    .openPopup();
            })
            .catch(err => {
                alert("Error: " + err.message);
            });
    }

    function geocodeAddress(address) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                } else {
                    throw new Error("Location not found.");
                }
            });
    }

    // Open the edit modal and pre-fill the form with event details
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
                function (dataUrl) {
                    updateEvent(dataUrl);
                },
                function (errorMsg) {
                    alert(errorMsg);
                }
            );
        } else {
            updateEvent();
        }
    });

    // -------------------------------
    // Authentication Handlers
    // -------------------------------
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;
        const users = loadUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            saveData();
            updateUserUI();
            loginModal.style.display = "none";
            loginForm.reset();
            alert("Logged in successfully!");
        } else {
            alert("Invalid email or password.");
        }
    });

    closeLoginModalBtn.addEventListener("click", () => {
        loginModal.style.display = "none";
        loginForm.reset();
    });

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim().toLowerCase();
        const password = document.getElementById("register-password").value;
        let users = loadUsers();
        if (users.find(u => u.email === email)) {
            alert("User with this email already exists.");
            return;
        }
        const newUser = { name, email, password };
        users.push(newUser);
        saveUsers(users);
        alert("Registration successful! Please log in.");
        registerModal.style.display = "none";
        registerForm.reset();
    });

    closeRegisterModalBtn.addEventListener("click", () => {
        registerModal.style.display = "none";
        registerForm.reset();
    });

    // -------------------------------
    // Notifications & Reminders
    // -------------------------------
    function checkReminders() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowStr = `${yyyy}-${mm}-${dd}`;

        events.forEach(ev => {
            if (ev.date === tomorrowStr) {
                if (Notification.permission === "granted") {
                    setTimeout(() => {
                        new Notification("Reminder: " + ev.name, {
                            body: "Your event is scheduled for tomorrow!",
                            icon: ev.image || ""
                        });
                    }, 5000);
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            setTimeout(() => {
                                new Notification("Reminder: " + ev.name, {
                                    body: "Your event is scheduled for tomorrow!",
                                    icon: ev.image || ""
                                });
                            }, 5000);
                        }
                    });
                }
            }
        });
    }

    // -------------------------------
    // Search & Filter Event Listeners
    // -------------------------------
    searchInput.addEventListener("input", renderEvents);
    filterStatusSelect.addEventListener("change", renderEvents);
    filterCategorySelect.addEventListener("change", renderEvents);

    // -------------------------------
    // Initial Updates on Page Load
    // -------------------------------
    updateDashboard();
    renderEvents();
    updateCalendarEvents();
    checkReminders();
});