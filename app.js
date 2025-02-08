// Initialize Map
const map = L.map('live-map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample real-time vehicle markers
const busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/487/487923.png',
    iconSize: [32, 32],
});

const trainIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097009.png',
    iconSize: [32, 32],
});

// Simulate real-time updates
function updateRealTimePositions() {
    // In real implementation, this would come from WebSocket/API
    const vehicles = [
        { type: 'bus', lat: 51.505 + Math.random() * 0.01, lng: -0.09 + Math.random() * 0.01 },
        { type: 'train', lat: 51.51 + Math.random() * 0.01, lng: -0.1 + Math.random() * 0.01 }
    ];

    vehicles.forEach(vehicle => {
        L.marker([vehicle.lat, vehicle.lng], {
            icon: vehicle.type === 'bus' ? busIcon : trainIcon
        }).addTo(map);
    });
}

setInterval(updateRealTimePositions, 5000);

// Trip Planning Logic
document.getElementById('plan-trip').addEventListener('click', () => {
    const start = document.getElementById('start-point').value;
    const end = document.getElementById('end-point').value;
    const mode = document.getElementById('travel-mode').value;
    
    // In real implementation, call AI routing API
    const itinerary = generateSampleItinerary(start, end, mode);
    displayItinerary(itinerary);
});

function generateSampleItinerary(start, end, mode) {
    return [
        {
            type: 'Bus',
            number: '24X',
            duration: '15 min',
            seats: 'High availability',
            fare: '$2.50'
        },
        {
            type: 'Train',
            number: 'Northern Line',
            duration: '8 min',
            seats: 'Medium availability',
            fare: '$2.00'
        }
    ];
}

function displayItinerary(steps) {
    const container = document.querySelector('.route-steps');
    container.innerHTML = '';
    
    steps.forEach(step => {
        const stepEl = document.createElement('div');
        stepEl.className = 'route-step';
        stepEl.innerHTML = `
            <span class="transport-icon">${step.type === 'Bus' ? '🚌' : '🚆'}</span>
            <div class="step-details">
                <h3>${step.type} ${step.number}</h3>
                <p>Duration: ${step.duration}</p>
                <p>${step.seats}</p>
                <p>Fare: ${step.fare}</p>
            </div>
        `;
        container.appendChild(stepEl);
    });
}

// Initialize Service
updateRealTimePositions();