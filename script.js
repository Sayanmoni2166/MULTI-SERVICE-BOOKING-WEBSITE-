// Initialize
let navStack = [];
let cabKm = 0;
let cabTimerInterval = null;
let currentService = null;
let cabPaid = false;
document.addEventListener('DOMContentLoaded', () => {
    // Welcome Overlay - Hide first to prevent blocking
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 1500);
    }

    // Initialize Data safely
    try { loadWestBengalCities(); } catch(e) { console.error('Error loading cities:', e); }
    try { loadIndianAirports(); } catch(e) { console.error('Error loading airports:', e); }
    try { loadIndianStations(); } catch(e) { console.error('Error loading stations:', e); }
    try { loadIndianCities(); } catch(e) { console.error('Error loading hotels:', e); }
    try { seedHotelAdminData(); } catch(e) { console.error('Error seeding hotel admin:', e); }
    try { seedReviews(); } catch(e) { console.error('Error seeding reviews:', e); }
    try { loadReviews(); } catch(e) { console.error('Error loading reviews:', e); }
    try { initTheme(); } catch(e) { console.error('Error init theme:', e); }
    try { initDrivers(); } catch(e) { console.error('Error init drivers:', e); }
    try { initCarousel(); } catch(e) { console.error('Error init carousel:', e); }
    try { initImageHoverSwap(); } catch(e) { console.error('Error init image hover:', e); }
    // Initial overlay auto-hide
    // Event Listeners
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.addEventListener('click', goBack);
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) homeBtn.addEventListener('click', () => showSection('home'));
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});

// Show/Hide Sections
function showSection(sectionId) {
    const current = document.querySelector('.section:not(.hidden)');
    if (current && current.id !== sectionId) navStack.push(current.id);
    showLoadingOverlay(2000, () => {
        document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
        document.getElementById(sectionId).classList.remove('hidden');
    });
}

if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true
    });
}

// AI Agent Feature
function showAIAgentMessage() {
    alert("I will backin major update 2.0.");
}

// Show Service Details
function showService(service) {
    const current = document.querySelector('.service-details:not(.hidden)');
    if (current && current.id !== service + '-section') navStack.push(current.id);
    showLoadingOverlay(2000, () => {
        document.querySelectorAll('.service-details').forEach(detail => detail.classList.add('hidden'));
        document.getElementById(service + '-section').classList.remove('hidden');
    });
}

// Cab Functions
function showCabCustomer() {
    document.getElementById('cab-customer').classList.remove('hidden');
    document.getElementById('cab-driver').classList.add('hidden');
}



function calculateCabFare() {
    const source = document.getElementById('cab-source').value;
    const dest = document.getElementById('cab-destination').value;
    const type = document.getElementById('cab-type').value;
    if (!source || !dest || !type) return;
    cabKm = computeCabDistance(source, dest);
    const rates = { sedan: 15, suv: 25, luxury: 35 };
    const fare = rates[type] * cabKm;
    document.getElementById('cab-fare-display').textContent = `Distance: ${cabKm} km | Fare: ₹${fare}`;
}

let currentWallet = 0;
let isDutyOn = false;

function showCabDriver() {
    // Payment check removed
    document.getElementById('cab-driver').classList.remove('hidden');
    document.getElementById('cab-customer').classList.add('hidden');
}

function loginCabDriver() {
    const u = document.getElementById('driver-user').value;
    const p = document.getElementById('driver-pass').value;
    const re = /^WB\d{4}$/;
    
    if (re.test(u) && u === p) {
        document.getElementById('driver-panel').classList.remove('hidden');
        
        // Random Driver Logic
        const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
        // Ensure we have drivers, fallback if empty
        const list = drivers.length > 0 ? drivers : [
            { name: 'Ramesh Gupta', car: 'Swift Dzire', number: 'WB02 A1234' },
            { name: 'Suresh Das', car: 'Hyundai Xcent', number: 'WB04 B5678' }
        ];
        const randomDriver = list[Math.floor(Math.random() * list.length)];
        
        displayDriverDetails(randomDriver);
        
        // Random Cashout Amount (2000 to 9999)
        currentWallet = Math.floor(Math.random() * 8000) + 2000;
        const walletEl = document.getElementById('driver-wallet');
        if (walletEl) walletEl.textContent = `₹${currentWallet}`;
        
        // Reset Duty
        isDutyOn = false;
        updateDutyButton();
        
    } else {
        alert('Incorrect Credentials. User ID must be WB#### (e.g., WB1234) and Password must match.');
    }
}

function toggleDuty() {
    isDutyOn = !isDutyOn;
    updateDutyButton();
}

function updateDutyButton() {
    const btn = document.getElementById('duty-toggle-btn');
    if (btn) {
        if (isDutyOn) {
            btn.textContent = 'DUTY ON';
            btn.className = 'duty-btn on';
        } else {
            btn.textContent = 'DUTY OFF';
            btn.className = 'duty-btn off';
        }
    }
}

function processCashout() {
    if (currentWallet <= 0) {
        alert('No balance to cashout.');
        return;
    }
    const tax = currentWallet * 0.18;
    const net = currentWallet - tax;
    
    alert(`Cashout Summary:\n\nTotal Balance: ₹${currentWallet}\nService Tax (18%): -₹${tax.toFixed(2)}\n\nNet Payout: ₹${net.toFixed(2)}`);
    
    currentWallet = 0;
    const walletEl = document.getElementById('driver-wallet');
    if (walletEl) walletEl.textContent = `₹0`;
}

function openChat() {
    const m = document.getElementById('chat-modal');
    if (m) m.classList.remove('hidden');
}

function showLoadingOverlay(duration, thenFn) {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) {
        if (typeof thenFn === 'function') thenFn();
        return;
    }
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.add('hidden');
        if (typeof thenFn === 'function') thenFn();
    }, duration || 2000);
}

function closeChat() {
    const m = document.getElementById('chat-modal');
    if (m) m.classList.add('hidden');
}

function sendChat() {
    const input = document.getElementById('chat-text');
    const messages = document.getElementById('chat-messages');
    if (!input || !messages) return;
    const text = input.value.trim();
    if (!text) return;
    const user = document.createElement('div');
    user.textContent = `You: ${text}`;
    messages.appendChild(user);
    let reply = 'Okay.';
    const t = text.toLowerCase();
    if (t.includes('cab')) reply = 'Use Cab Booking under Services.';
    else if (t.includes('flight')) reply = 'Select airports to view flights.';
    else if (t.includes('train')) reply = 'Select stations to view trains.';
    else if (t.includes('hotel')) reply = 'Pick a city to list hotels.';
    else if (t.includes('pay')) reply = 'Choose a payment method and Pay Now.';
    const bot = document.createElement('div');
    bot.textContent = `Assistant: ${reply}`;
    messages.appendChild(bot);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}
// Data Loading Functions
function loadWestBengalCities() {
    const cities = [
        'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling',
        'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda',
        'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur',
        'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
    ];
    localStorage.setItem('westBengalCities', JSON.stringify(cities));
    const selects = ['cab-source', 'cab-destination'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            select.appendChild(option);
        });
    });
}

function loadIndianAirports() {
    const airports = [
        'Indira Gandhi International Airport (Delhi)', 'Chhatrapati Shivaji Maharaj International Airport (Mumbai)',
        'Kempegowda International Airport (Bangalore)', 'Netaji Subhas Chandra Bose International Airport (Kolkata)',
        'Rajiv Gandhi International Airport (Hyderabad)', 'Sardar Vallabhbhai Patel International Airport (Ahmedabad)',
        'Cochin International Airport (Kochi)', 'Pune Airport (Pune)', 'Goa International Airport (Goa)',
        'Chennai International Airport (Chennai)', 'Jaipur International Airport (Jaipur)', 'Lucknow Airport (Lucknow)',
        'Patna Airport (Patna)', 'Bhubaneswar Airport (Bhubaneswar)', 'Guwahati Airport (Guwahati)',
        'Thiruvananthapuram International Airport (Trivandrum)', 'Calicut International Airport (Calicut)',
        'Mangalore International Airport (Mangalore)', 'Nagpur Airport (Nagpur)', 'Visakhapatnam Airport (Visakhapatnam)'
    ];
    localStorage.setItem('indianAirports', JSON.stringify(airports));
    const selects = ['flight-source', 'flight-destination'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        airports.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport;
            option.textContent = airport;
            select.appendChild(option);
        });
    });
}

function loadIndianStations() {
    const stations = [
        'New Delhi Railway Station', 'Mumbai Central', 'Howrah Junction (Kolkata)', 'Chennai Central',
        'Bangalore City Railway Station', 'Ahmedabad Junction', 'Pune Junction', 'Jaipur Junction',
        'Lucknow Junction', 'Patna Junction', 'Bhubaneswar Railway Station', 'Guwahati Railway Station',
        'Thiruvananthapuram Central', 'Calicut Railway Station', 'Mangalore Junction', 'Nagpur Railway Station',
        'Visakhapatnam Railway Station', 'Kanpur Central', 'Allahabad Junction', 'Varanasi Junction'
    ];
    localStorage.setItem('indianStations', JSON.stringify(stations));
    const selects = ['train-source', 'train-destination'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station;
            option.textContent = station;
            select.appendChild(option);
        });
    });
}

function loadIndianCities() {
    const cities = {
        'Delhi': {
            hotels: [
                'Hotel Taj Mahal', 'ITC Maurya', 'The Oberoi', 'Radisson Blu', 'Le Meridien',
                'Hyatt Regency', 'Shangri-La', 'JW Marriott', 'Park Plaza', 'Novotel',
                'Ibis', 'Holiday Inn', 'Courtyard by Marriott', 'Hilton Garden Inn', 'Marriott Executive Apartments',
                'The Leela', 'Four Seasons', 'Rosewood', 'St. Regis', 'Ritz-Carlton'
            ]
        },
        'Mumbai': {
            hotels: [
                'The Taj Mahal Palace', 'ITC Grand Central', 'Trident Nariman Point', 'The Oberoi Mumbai', 'Four Seasons Mumbai',
                'JW Marriott Mumbai Sahar', 'Hyatt Regency Mumbai', 'Radisson Blu', 'Le Meridien', 'Novotel Mumbai Juhu Beach',
                'Ibis Mumbai Airport', 'Holiday Inn Mumbai International Airport', 'Courtyard by Marriott Mumbai International Airport', 'Hilton Mumbai International Airport',
                'Marriott Executive Apartments Mumbai', 'The Leela Mumbai', 'Rosewood Mumbai', 'St. Regis Mumbai', 'Ritz-Carlton Mumbai', 'Park Plaza Mumbai'
            ]
        },
        'Kolkata': {
            hotels: [
                'The Astor', 'ITC Sonar', 'Hyatt Regency Kolkata', 'The Oberoi Grand', 'JW Marriott Kolkata',
                'Radisson Blu Kolkata', 'Novotel Kolkata Hotel & Residences', 'Ibis Kolkata Rajarhat', 'Holiday Inn Kolkata Airport', 'Courtyard by Marriott Kolkata',
                'Hilton Kolkata', 'Marriott Executive Apartments Kolkata', 'The Leela Kolkata', 'Four Seasons Kolkata', 'Rosewood Kolkata',
                'St. Regis Kolkata', 'Ritz-Carlton Kolkata', 'Park Plaza Kolkata', 'Taj Bengal Kolkata', 'ITC Royal Bengal'
            ]
        },
        'Bangalore': {
            hotels: [
                'The Oberoi Bengaluru', 'ITC Gardenia', 'JW Marriott Bengaluru', 'Hyatt Regency Bengaluru', 'Radisson Blu Bengaluru',
                'Le Meridien Bengaluru', 'Novotel Bengaluru Techpark', 'Ibis Bengaluru City Centre', 'Holiday Inn Bengaluru Racecourse', 'Courtyard by Marriott Bengaluru',
                'Hilton Bengaluru Embassy GolfLinks', 'Marriott Executive Apartments Bengaluru', 'The Leela Bengaluru', 'Four Seasons Bengaluru', 'Rosewood Bengaluru',
                'St. Regis Bengaluru', 'Ritz-Carlton Bengaluru', 'Park Plaza Bengaluru', 'Taj Yeshwantpur Bengaluru', 'ITC Windsor Bengaluru'
            ]
        },
        'Chennai': {
            hotels: [
                'ITC Grand Chola', 'The Leela Chennai', 'Hyatt Regency Chennai', 'Radisson Blu Chennai City Centre', 'Novotel Chennai Chamiers Road',
                'Ibis Chennai City Centre', 'Holiday Inn Chennai - Adyar', 'Courtyard by Marriott Chennai', 'Hilton Chennai', 'Marriott Executive Apartments Chennai',
                'Four Seasons Chennai', 'Rosewood Chennai', 'St. Regis Chennai', 'Ritz-Carlton Chennai', 'Park Plaza Chennai',
                'Taj Coromandel Chennai', 'ITC Park Chennai', 'The Oberoi Chennai', 'JW Marriott Chennai', 'Le Meridien Chennai'
            ]
        }
    };
    localStorage.setItem('indianCities', JSON.stringify(cities));
    const select = document.getElementById('hotel-city');
    Object.keys(cities).forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });
}

function uploadDocuments() {
    const uid = document.getElementById('driver-user').value;
    if (!uid) { alert('Enter User ID first.'); return; }
    const docsKey = `driverDocs:${uid}`;
    const status = { rc: !!document.getElementById('rc-upload').files.length,
                     license: !!document.getElementById('license-upload').files.length,
                     pollution: !!document.getElementById('pollution-upload').files.length };
    localStorage.setItem(docsKey, JSON.stringify(status));
    alert('Documents status saved.');
    const display = document.getElementById('driver-profile-display');
    if (display) {
        const prev = display.innerHTML;
        const docText = `<p>Docs: RC ${status.rc ? 'Uploaded' : 'Missing'} • License ${status.license ? 'Uploaded' : 'Missing'} • Pollution ${status.pollution ? 'Uploaded' : 'Missing'}</p>`;
        display.innerHTML = prev + docText;
    }
}

function displayDriverDetails(driver) {
    const profileHTML = `
        <div class="driver-info-box">
            <h3>${driver.name}</h3>
            <p>${driver.car} • ${driver.number}</p>
            <p>RC No: ${driver.rcNo} • Pollution: ${driver.pollutionStatus}</p>
            <p>Car Details: ${driver.carDetails.color} • ${driver.carDetails.year}</p>
        </div>
    `;
    const profileDisplay = document.getElementById('driver-profile-display');
    if (profileDisplay) profileDisplay.innerHTML = profileHTML;
}

function seedHotelAdminData() {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
    const customers = JSON.parse(localStorage.getItem('hotelCustomers') || '[]');
    if (rooms.length > 0 || customers.length > 0) return;
    const seedRooms = [
        { roomNo: '101', type: 'single', status: 'vacant' },
        { roomNo: '102', type: 'single', status: 'occupied' },
        { roomNo: '201', type: 'double', status: 'vacant' },
        { roomNo: '202', type: 'double', status: 'occupied' },
        { roomNo: '307', type: 'suite', status: 'vacant' }
    ];
    const seedCustomers = [
        { name: 'Rhea Kapoor', address: 'Mumbai', roomNo: '102' },
        { name: 'Anil Verma', address: 'Delhi', roomNo: '202' }
    ];
    localStorage.setItem('hotelRooms', JSON.stringify(seedRooms));
    localStorage.setItem('hotelCustomers', JSON.stringify(seedCustomers));
}

function loadHotelAdminData() {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
    const customers = JSON.parse(localStorage.getItem('hotelCustomers') || '[]');
    const roomsEl = document.getElementById('admin-rooms');
    const customersEl = document.getElementById('admin-customers');
    if (roomsEl) {
        roomsEl.innerHTML = '';
        rooms.forEach(r => {
            const div = document.createElement('div');
            div.className = 'hotel-item';
            div.textContent = `Room ${r.roomNo} • ${r.type.toUpperCase()} • ${r.status}`;
            roomsEl.appendChild(div);
        });
    }
    if (customersEl) {
        customersEl.innerHTML = '';
        customers.forEach(c => {
            const div = document.createElement('div');
            div.className = 'hotel-item';
            div.textContent = `${c.name} • ${c.address} • Room ${c.roomNo}`;
            customersEl.appendChild(div);
        });
    }
    const form = document.getElementById('admin-add-form');
    if (form && !form._bound) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            addHotelRoomCustomer();
        });
        form._bound = true;
    }
}

function addHotelRoomCustomer() {
    const name = document.getElementById('admin-customer-name').value.trim();
    const address = document.getElementById('admin-customer-address').value.trim();
    const type = document.getElementById('admin-room-type').value;
    const roomNo = document.getElementById('admin-room-number').value.trim();
    if (!name || !address || !type || !roomNo) return;
    const rooms = JSON.parse(localStorage.getItem('hotelRooms') || '[]');
    const customers = JSON.parse(localStorage.getItem('hotelCustomers') || '[]');
    const idx = rooms.findIndex(r => r.roomNo === roomNo);
    if (idx === -1) {
        rooms.push({ roomNo, type, status: 'occupied' });
    } else {
        rooms[idx].type = type;
        rooms[idx].status = 'occupied';
    }
    customers.unshift({ name, address, roomNo });
    localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    localStorage.setItem('hotelCustomers', JSON.stringify(customers));
    loadHotelAdminData();
    document.getElementById('admin-add-form').reset();
    alert('Added/Assigned successfully.');
}

// Hotel Functions
function showHotelCustomer() {
    document.getElementById('hotel-customer').classList.remove('hidden');
    document.getElementById('hotel-admin').classList.add('hidden');
}

function showHotelAdmin() {
    document.getElementById('hotel-admin').classList.remove('hidden');
    document.getElementById('hotel-customer').classList.add('hidden');
}

function showHotels() {
    const city = document.getElementById('hotel-city').value;
    if (!city) return;
    const hotels = JSON.parse(localStorage.getItem('indianCities'))[city].hotels;
    const container = document.getElementById('hotels-container');
    container.innerHTML = '';
    hotels.forEach(hotel => {
        const div = document.createElement('div');
        div.className = 'hotel-item';
        div.textContent = hotel;
        div.onclick = () => selectHotel(hotel);
        container.appendChild(div);
    });
    document.getElementById('hotel-list').classList.remove('hidden');
}

function selectHotel(hotel) {
    document.getElementById('hotel-booking-form').classList.remove('hidden');
}

function loginAdmin() {
    const u = document.getElementById('admin-username').value;
    const p = document.getElementById('admin-password').value;
    if (u && p && u === p) {
        document.getElementById('admin-panel').classList.remove('hidden');
        loadHotelAdminData();
    } else {
        alert('Incorrect password');
    }
}

// Flight Functions
function showFlights() {
    const source = document.getElementById('flight-source').value;
    const dest = document.getElementById('flight-destination').value;
    if (!source || !dest) return;
    const flights = [
        'Flight 101 - 6:00 AM', 'Flight 102 - 8:00 AM', 'Flight 103 - 10:00 AM',
        'Flight 104 - 12:00 PM', 'Flight 105 - 2:00 PM', 'Flight 106 - 4:00 PM',
        'Flight 107 - 6:00 PM', 'Flight 108 - 8:00 PM', 'Flight 109 - 10:00 PM',
        'Flight 110 - 12:00 AM'
    ];
    const container = document.getElementById('flights-container');
    container.innerHTML = '';
    flights.forEach(flight => {
        const div = document.createElement('div');
        div.className = 'flight-item';
        div.textContent = flight;
        div.onclick = () => selectFlight(flight);
        container.appendChild(div);
    });
    document.getElementById('flight-list').classList.remove('hidden');
}

function selectFlight(flight) {
    document.getElementById('flight-booking-form').classList.remove('hidden');
}

function calculateFlightFare() {
    const cls = document.getElementById('flight-class').value;
    const passengers = parseInt(document.getElementById('flight-passengers').value);
    const source = document.getElementById('flight-source').value;
    const dest = document.getElementById('flight-destination').value;
    if (!cls || !passengers || !source || !dest) return;
    const km = computeFlightDistance(source, dest);
    const rates = { economy: 5, business: 10, first: 15 };
    const fare = rates[cls] * km * passengers;
    document.getElementById('flight-fare-display').textContent = `Fare: ₹${fare}`;
}

// Train Functions
function showTrains() {
    const source = document.getElementById('train-source').value;
    const dest = document.getElementById('train-destination').value;
    if (!source || !dest) return;
    const trains = [
        'Train 101 - Express', 'Train 102 - Superfast', 'Train 103 - Mail',
        'Train 104 - Passenger', 'Train 105 - Shatabdi', 'Train 106 - Rajdhani',
        'Train 107 - Duronto', 'Train 108 - Garib Rath', 'Train 109 - Jan Shatabdi',
        'Train 110 - Intercity'
    ];
    const container = document.getElementById('trains-container');
    container.innerHTML = '';
    trains.forEach(train => {
        const div = document.createElement('div');
        div.className = 'train-item';
        div.textContent = train;
        div.onclick = () => selectTrain(train);
        container.appendChild(div);
    });
    document.getElementById('train-list').classList.remove('hidden');
}

function selectTrain(train) {
    document.getElementById('train-booking-form').classList.remove('hidden');
}

function calculateTrainFare() {
    const cls = document.getElementById('train-class').value;
    const passengers = parseInt(document.getElementById('train-passengers').value);
    const source = document.getElementById('train-source').value;
    const dest = document.getElementById('train-destination').value;
    if (!cls || !passengers || !source || !dest) return;
    const km = computeTrainDistance(source, dest);
    const rates = { ac1: 8, ac2: 5, sitting: 2 };
    const fare = rates[cls] * km * passengers;
    document.getElementById('train-fare-display').textContent = `Fare: ₹${fare}`;
}

// Payment
function showPayment(service) {
    currentService = service;
    if (service === 'cab') {
        const source = document.getElementById('cab-source').value;
        const dest = document.getElementById('cab-destination').value;
        const type = document.getElementById('cab-type').value;
        if (!source || !dest || !type || !cabKm) {
            alert('Please fill in all cab booking details.');
            return;
        }
    } else if (service === 'parcel') {
        const pickup = document.getElementById('parcel-pickup').value;
        const dest = document.getElementById('parcel-destination').value;
        const size = document.getElementById('parcel-size').value;
        
        if (!pickup || !dest || !size) {
            alert('Please fill in all parcel booking details.');
            return;
        }
    } else if (service === 'hotel') {
        const city = document.getElementById('hotel-city').value;
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const roomType = document.getElementById('room-type').value;
        const adults = document.getElementById('hotel-adults').value;
        const children = document.getElementById('hotel-children').value;
        
        if (!city || !checkin || !checkout || !roomType || !adults || children === "") {
             alert('Please fill in all hotel booking details.');
             return;
        }
    } else if (service === 'flight') {
        const source = document.getElementById('flight-source').value;
        const dest = document.getElementById('flight-destination').value;
        const cls = document.getElementById('flight-class').value;
        const passengers = document.getElementById('flight-passengers').value;
        if (!source || !dest || !cls || !passengers) {
            alert('Please fill in all flight booking details.');
            return;
        }
    } else if (service === 'train') {
        const source = document.getElementById('train-source').value;
        const dest = document.getElementById('train-destination').value;
        const cls = document.getElementById('train-class').value;
        const passengers = document.getElementById('train-passengers').value;
         if (!source || !dest || !cls || !passengers) {
            alert('Please fill in all train booking details.');
            return;
        }
    }
    
    document.getElementById('payment-modal').classList.remove('hidden');
}

function processPayment() {
    const selected = document.querySelector('input[name="payment"]:checked');
    if (!selected) {
        alert('Please select a payment method.');
        return;
    }
    const method = selected.value;
    closeModal();
    
    // Generate Summary
    let summaryHTML = `<h3>Payment Successful via ${method.toUpperCase()}</h3><hr style="margin: 1rem 0; border: 0; border-top: 1px solid var(--border);">`;
    const date = new Date().toLocaleString();
    summaryHTML += `<p><strong>Date:</strong> ${date}</p>`;
    
    if (currentService === 'cab') {
        const source = document.getElementById('cab-source').value;
        const dest = document.getElementById('cab-destination').value;
        const type = document.getElementById('cab-type').value;
        const rates = { sedan: 15, suv: 25, luxury: 35 };
        const fare = rates[type] * cabKm;
        
        summaryHTML += `
            <p><strong>Service:</strong> Cab Booking</p>
            <p><strong>From:</strong> ${source}</p>
            <p><strong>To:</strong> ${dest}</p>
            <p><strong>Car Type:</strong> ${type}</p>
            <p><strong>Distance:</strong> ${cabKm} km</p>
            <p><strong>Amount:</strong> ₹${fare}</p>
        `;
        
        assignDriver(type);
        startCabTimer(30 * 60);
        cabPaid = true;
        
        // Add Driver info to summary if assigned immediately
        setTimeout(() => {
             const driverEl = document.getElementById('assigned-driver');
             if (driverEl && !driverEl.classList.contains('hidden')) {
                 summaryHTML += `<hr style="margin: 1rem 0; border: 0; border-top: 1px solid var(--border);"><p><strong>Driver Details:</strong><br>${driverEl.innerHTML}</p>`;
                 document.getElementById('order-details-content').innerHTML = summaryHTML;
             }
        }, 100);

    } else if (currentService === 'parcel') {
        const pickup = document.getElementById('parcel-pickup').value;
        const dest = document.getElementById('parcel-destination').value;
        const size = document.getElementById('parcel-size').value;
        const sizeRates = { small: 50, medium: 100, large: 200 };
        const amount = sizeRates[size] || 0;
        
        summaryHTML += `
            <p><strong>Service:</strong> Parcel Delivery</p>
            <p><strong>Pickup:</strong> ${pickup}</p>
            <p><strong>Destination:</strong> ${dest}</p>
            <p><strong>Size:</strong> ${size}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
        `;
    } else if (currentService === 'hotel') {
        const city = document.getElementById('hotel-city').value;
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const room = document.getElementById('room-type').value;
        const rates = { single: 1500, double: 2500, suite: 5000 };
        const nights = (() => {
            const inDate = new Date(checkin);
            const outDate = new Date(checkout);
            const diff = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
            return diff > 0 ? diff : 1;
        })();
        const amount = (rates[room] || 0) * nights;
        
        summaryHTML += `
            <p><strong>Service:</strong> Hotel Booking</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>Check-in:</strong> ${checkin}</p>
            <p><strong>Check-out:</strong> ${checkout}</p>
            <p><strong>Room Type:</strong> ${room}</p>
            <p><strong>Nights:</strong> ${nights}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
        `;
    } else if (currentService === 'flight') {
        const source = document.getElementById('flight-source').value;
        const dest = document.getElementById('flight-destination').value;
        const cls = document.getElementById('flight-class').value;
        const passengers = parseInt(document.getElementById('flight-passengers').value);
        const km = computeFlightDistance(source, dest);
        const rates = { economy: 5, business: 10, first: 15 };
        const amount = (rates[cls] || 0) * km * passengers;
        
        summaryHTML += `
            <p><strong>Service:</strong> Flight Booking</p>
            <p><strong>From:</strong> ${source}</p>
            <p><strong>To:</strong> ${dest}</p>
            <p><strong>Class:</strong> ${cls}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
        `;
    } else if (currentService === 'train') {
        const source = document.getElementById('train-source').value;
        const dest = document.getElementById('train-destination').value;
        const cls = document.getElementById('train-class').value;
        const passengers = parseInt(document.getElementById('train-passengers').value);
        const km = computeTrainDistance(source, dest);
        const rates = { ac1: 8, ac2: 5, sitting: 2 };
        const amount = (rates[cls] || 0) * km * passengers;
        
        summaryHTML += `
            <p><strong>Service:</strong> Train Booking</p>
            <p><strong>From:</strong> ${source}</p>
            <p><strong>To:</strong> ${dest}</p>
            <p><strong>Class:</strong> ${cls}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
        `;
    }
    
    document.getElementById('order-details-content').innerHTML = summaryHTML;
    
    // Hide all sections and show summary
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.service-details').forEach(s => s.classList.add('hidden'));
    document.getElementById('order-summary-section').classList.remove('hidden');
}

// Join Us Logic
function showJobForm(role) {
    document.getElementById('job-role-title').textContent = `Application for ${role}`;
    document.getElementById('job-application-form').classList.remove('hidden');
    // Scroll to form
    document.getElementById('job-application-form').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('detailed-join-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Application Submitted Successfully! We will contact you soon.');
    e.target.reset();
    document.getElementById('job-application-form').classList.add('hidden');
});

function closeModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

// Add ESC key and backdrop click to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

function computeCabDistance(source, dest) {
    const cities = JSON.parse(localStorage.getItem('westBengalCities') || '[]');
    const i1 = cities.indexOf(source);
    const i2 = cities.indexOf(dest);
    if (i1 === -1 || i2 === -1) return Math.floor(5 + Math.random() * 10);
    const diff = Math.abs(i1 - i2);
    const base = diff * 10;
    const extra = Math.floor(5 + Math.random() * 20);
    const total = base + extra;
    return Math.max(5, total);
}

function computeFlightDistance(source, dest) {
    const list = JSON.parse(localStorage.getItem('indianAirports') || '[]');
    const i1 = list.indexOf(source);
    const i2 = list.indexOf(dest);
    if (i1 === -1 || i2 === -1) return Math.floor(200 + Math.random() * 300);
    const diff = Math.abs(i1 - i2);
    const base = diff * 150;
    const extra = Math.floor(100 + Math.random() * 200);
    const total = base + extra;
    return Math.max(150, total);
}

function computeTrainDistance(source, dest) {
    const list = JSON.parse(localStorage.getItem('indianStations') || '[]');
    const i1 = list.indexOf(source);
    const i2 = list.indexOf(dest);
    if (i1 === -1 || i2 === -1) return Math.floor(100 + Math.random() * 200);
    const diff = Math.abs(i1 - i2);
    const base = diff * 80;
    const extra = Math.floor(50 + Math.random() * 150);
    const total = base + extra;
    return Math.max(80, total);
}

function initDrivers() {
    const existing = JSON.parse(localStorage.getItem('drivers') || '[]');
    if (existing && existing.length > 0) {
        const upgraded = existing.map(d => ({
            ...d,
            rcNo: d.rcNo || `RC-${Math.floor(100000 + Math.random()*899999)}`,
            pollutionStatus: d.pollutionStatus || 'Valid',
            carDetails: d.carDetails || { color: 'Black', year: 2021 },
            documents: d.documents || { rc: false, license: false, pollution: false }
        }));
        localStorage.setItem('drivers', JSON.stringify(upgraded));
        return;
    }
    const drivers = [
        { name: 'Arjun Das', car: 'Maruti Dzire', number: 'WB04 A1234', type: 'sedan' },
        { name: 'Ravi Sen', car: 'Hyundai Xcent', number: 'WB06 B5678', type: 'sedan' },
        { name: 'Kunal Roy', car: 'Honda Amaze', number: 'WB08 C9012', type: 'sedan' },
        { name: 'Sourav Pal', car: 'Toyota Etios', number: 'WB10 D3456', type: 'sedan' },
        { name: 'Neel Sarkar', car: 'Swift Dzire', number: 'WB12 E7890', type: 'sedan' },
        { name: 'Prakash Saha', car: 'Toyota Innova', number: 'WB02 F1122', type: 'suv' },
        { name: 'Debjit Dey', car: 'Mahindra XUV500', number: 'WB03 G3344', type: 'suv' },
        { name: 'Amit Ghosh', car: 'Hyundai Creta', number: 'WB05 H5566', type: 'suv' },
        { name: 'Sayan Bose', car: 'Tata Hexa', number: 'WB07 I7788', type: 'suv' },
        { name: 'Indranil Sen', car: 'Toyota Fortuner', number: 'WB09 J9900', type: 'suv' },
        { name: 'Rahul Jain', car: 'BMW 5 Series', number: 'WB11 K2244', type: 'luxury' },
        { name: 'Ankit Shah', car: 'Mercedes C-Class', number: 'WB13 L4466', type: 'luxury' }
    ].map(d => ({
        ...d,
        rcNo: `RC-${Math.floor(100000 + Math.random()*899999)}`,
        pollutionStatus: 'Valid',
        carDetails: { color: 'Black', year: 2021 },
        documents: { rc: false, license: false, pollution: false }
    }));
    localStorage.setItem('drivers', JSON.stringify(drivers));
}

function assignDriver(type) {
    const list = JSON.parse(localStorage.getItem('drivers') || '[]').filter(d => d.type === type);
    const driver = list[Math.floor(Math.random() * list.length)];
    const el = document.getElementById('assigned-driver');
    if (!driver || !el) return;
    el.innerHTML = `Driver: ${driver.name} • Car: ${driver.car} • Number: ${driver.number}`;
    el.classList.remove('hidden');
}

function startCabTimer(seconds) {
    const el = document.getElementById('cab-timer');
    if (!el) return;
    if (cabTimerInterval) clearInterval(cabTimerInterval);
    let remaining = seconds;
    el.classList.remove('hidden');
    cabTimerInterval = setInterval(() => {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        el.textContent = `Timer: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        if (remaining <= 1800) el.classList.add('blink');
        remaining--;
        if (remaining < 0) {
            clearInterval(cabTimerInterval);
        }
    }, 1000);
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') {
        document.body.classList.add('dark');
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function goBack() {
    const last = navStack.pop();
    if (!last) {
        showSection('home');
        return;
    }
    if (document.getElementById(last)) {
        if (last.endsWith('-section')) {
            const svc = last.replace('-section', '');
            showService(svc);
        } else {
            showSection(last);
        }
    }
}

// Reviews
function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]').sort((a, b) => (b.time || 0) - (a.time || 0));
    const list = document.getElementById('reviews-list');
    list.innerHTML = '';
    reviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
            <div class="review-header">
                <strong>${review.name}</strong>
                <span>${'★'.repeat(parseInt(review.rating || 0))}</span>
            </div>
            <p>${review.text}</p>
        `;
        list.appendChild(div);
    });
}

document.getElementById('review-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target[0].value.trim();
    const text = e.target[1].value.trim();
    const rating = e.target[2].value;
    if (!name || !text || !rating) return;
    if (!isCleanText(text)) {
        alert('Please write a helpful, clean review without abusive words.');
        return;
    }
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    reviews.unshift({ name, text, rating, time: Date.now() });
    localStorage.setItem('reviews', JSON.stringify(reviews));
    loadReviews();
    e.target.reset();
});

function isCleanText(t) {
    const bad = ['abuse','stupid','idiot','hate','nonsense','harass','spam'];
    const lower = t.toLowerCase();
    return !bad.some(w => lower.includes(w));
}

function seedReviews() {
    const existing = JSON.parse(localStorage.getItem('reviews') || '[]');
    if (existing && existing.length > 0) return;
    const seeds = [
        { name: 'Rahul Sharma', text: 'Previously added by customer: cab pickup was on time in Delhi.', rating: 5 },
        { name: 'Priya Singh', text: 'Previously added by customer: hotel booking was smooth and affordable.', rating: 4 },
        { name: 'Amit Patel', text: 'Previously added by customer: parcel reached Ahmedabad safely.', rating: 5 },
        { name: 'Neha Gupta', text: 'Previously added by customer: flight selection process was quick.', rating: 4 },
        { name: 'Vikram Rao', text: 'Previously added by customer: train options are clear and useful.', rating: 4 },
        { name: 'Sneha Iyer', text: 'Previously added by customer: modern UI and helpful chatbot.', rating: 5 },
        { name: 'Arjun Mehta', text: 'Previously added by customer: cab driver details shown correctly.', rating: 5 },
        { name: 'Kiran Das', text: 'Previously added by customer: Help Center page was informative.', rating: 4 },
        { name: 'Ananya Bose', text: 'Previously added by customer: found services easily, good flow.', rating: 5 },
        { name: 'Rohit Jain', text: 'Previously added by customer: overall experience across services is great.', rating: 5 }
    ].map(r => ({ ...r, time: Date.now() - Math.floor(Math.random()*10000000) }));
    localStorage.setItem('reviews', JSON.stringify(seeds));
}
// Carousel
function initCarousel() {
    const slides = document.querySelectorAll('.feature-slide');
    if (slides.length === 0) return;
    let current = 0;
    
    // Ensure first slide is active
    slides.forEach((s, i) => {
        if (i === 0) s.classList.add('active');
        else s.classList.remove('active');
    });

    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 3500);
}

function initImageHoverSwap() {
    const imgs = document.querySelectorAll('.service-image[data-hover]');
    imgs.forEach(img => {
        const original = img.src;
        const altSrc = img.getAttribute('data-hover');
        if (!altSrc) return;
        const preload = new Image();
        preload.src = altSrc;
        img.style.willChange = 'transform, opacity';
        img.addEventListener('mouseenter', () => {
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = altSrc;
                img.style.opacity = '1';
                img.style.transform = 'scale(1.05)';
                img.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }, 120);
        });
        img.addEventListener('mouseleave', () => {
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = original;
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
                img.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
            }, 120);
        });
    });
}
