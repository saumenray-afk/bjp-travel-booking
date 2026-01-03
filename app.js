// Hotel Database
const hotelDatabase = {
    'Kolkata': [
        { name: 'Taj Kutir', rating: 5, price: 8500 },
        { name: 'Westin', rating: 5, price: 7500 },
        { name: 'Holiday Inn', rating: 4, price: 5500 },
        { name: 'Ibis', rating: 4, price: 4500 },
        { name: 'Lemon Tree', rating: 4, price: 4000 },
        { name: 'Altair', rating: 3, price: 3500 },
        { name: 'Taj Bengal', rating: 5, price: 9000 },
        { name: 'Senses', rating: 4, price: 4500 },
        { name: 'Signature Vista', rating: 4, price: 5000 },
        { name: 'Chaudhari Guesthouse', rating: 3, price: 2500 }
    ],
    'Siliguri': [
        { name: 'Hotel Sinclairs', rating: 4, price: 4000 },
        { name: 'Summit Grace', rating: 3, price: 3000 },
        { name: 'Ramada', rating: 4, price: 4500 }
    ],
    'Bardhaman': [
        { name: 'Hotel RJ', rating: 3, price: 2500 },
        { name: 'Burdwan Inn', rating: 3, price: 2800 }
    ],
    'Durgapur': [
        { name: 'Woodland Park', rating: 3, price: 3000 },
        { name: 'City Centre', rating: 3, price: 2800 }
    ],
    'Asansol': [
        { name: 'The Centrum', rating: 3, price: 3000 },
        { name: 'Plaza Hotel', rating: 3, price: 2500 }
    ],
    'Malda': [{ name: 'Hotel Golden Park', rating: 3, price: 2500 }],
    'Purulia': [{ name: 'Purulia Inn', rating: 2, price: 2000 }],
    'Alipurduar': [
        { name: 'Hotel Bangalaxmi', rating: 3, price: 2500 },
        { name: 'Hotel Sinclairs', rating: 4, price: 3500 }
    ],
    'Coochbehar': [{ name: 'Hotel Gulmohar', rating: 3, price: 2800 }]
};

const serviceConfig = {
    'hotel': {
        icon: '🏨',
        title: 'Hotel Reservation',
        fields: ['city', 'hotel', 'rooms', 'checkin', 'checkout']
    },
    'seminar': {
        icon: '🎤',
        title: 'Seminar Requirement',
        fields: ['venue', 'attendees', 'travelDate']
    },
    'train': {
        icon: '🚂',
        title: 'Train Seat Reservation',
        fields: ['from', 'to', 'travelDate', 'class', 'passengers']
    },
    'flight': {
        icon: '✈️',
        title: 'Flight Reservation',
        fields: ['from', 'to', 'travelDate', 'class', 'passengers']
    },
    'vehicle': {
        icon: '🚗',
        title: 'Vehicle Requirement',
        fields: ['vehicleType', 'vehiclesCount', 'travelDate', 'duration']
    },
    'charter': {
        icon: '🚁',
        title: 'Chartered Aviation',
        fields: ['from', 'to', 'travelDate', 'passengers']
    },
    'rally': {
        icon: '🚄',
        title: 'Full Train for Rallies',
        fields: ['from', 'to', 'rallyLocation', 'participants', 'travelDate']
    }
};

let bookings = JSON.parse(localStorage.getItem('bjpBookings')) || [];
let userProfile = JSON.parse(localStorage.getItem('bjpUserProfile')) || null;

document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    setupCityChange();
    setMinDates();
    loadProfile();
    prefillUserData();
});

function setupCityChange() {
    const citySelect = document.querySelector('select[name="city"]');
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            updateHotelList(this.value);
        });
    }
}

function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => input.min = today);
}

function updateHotelList(city) {
    const hotelSelect = document.getElementById('hotelSelect');
    hotelSelect.innerHTML = '<option value="">Select Hotel</option>';
    
    if (city && hotelDatabase[city]) {
        hotelDatabase[city].forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.name;
            option.textContent = `${hotel.name} - ₹${hotel.price}/night (${hotel.rating}⭐)`;
            option.dataset.price = hotel.price;
            option.dataset.rating = hotel.rating;
            hotelSelect.appendChild(option);
        });
    }
}

function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(page + 'Page').classList.add('active');
    event.currentTarget.classList.add('active');
    
    if (page === 'bookings') {
        loadBookings();
    } else if (page === 'profile') {
        loadProfile();
    }
    
    document.getElementById('backBtn').classList.remove('show');
    updateHeader(page);
}

function updateHeader(page) {
    const titles = {
        'services': 'BJP Travel Booking',
        'booking': 'Book Service',
        'voucher': 'Booking Voucher',
        'bookings': 'My Bookings',
        'profile': 'My Profile'
    };
    document.getElementById('headerTitle').textContent = titles[page] || 'BJP Travel Booking';
}

function openBooking(type) {
    const config = serviceConfig[type];
    document.getElementById('bookingIcon').textContent = config.icon;
    document.getElementById('bookingTitle').textContent = config.title;
    document.getElementById('serviceType').value = config.title;
    
    const allFields = ['city', 'hotel', 'rooms', 'checkin', 'checkout', 'venue', 'attendees', 
                      'from', 'to', 'travelDate', 'class', 'passengers', 'vehicleType', 
                      'vehiclesCount', 'duration', 'rallyLocation', 'participants'];
    
    allFields.forEach(field => {
        const group = document.getElementById(field + 'Group');
        if (group) {
            group.style.display = 'none';
            const input = group.querySelector('input, select');
            if (input) input.removeAttribute('required');
        }
    });
    
    config.fields.forEach(field => {
        const group = document.getElementById(field + 'Group');
        if (group) {
            group.style.display = 'block';
            const input = group.querySelector('input, select');
            if (input && input.name !== 'requirements') {
                if (['from', 'to', 'travelDate', 'checkin', 'checkout'].includes(field)) {
                    input.setAttribute('required', 'required');
                }
            }
        }
    });
    
    // Prefill user data
    prefillUserData();
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('bookingPage').classList.add('active');
    document.getElementById('backBtn').classList.add('show');
    updateHeader('booking');
    
    document.getElementById('bookingForm').reset();
    prefillUserData(); // Call again after reset
}

function goBack() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('servicesPage').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[0].classList.add('active');
    document.getElementById('backBtn').classList.remove('show');
    updateHeader('services');
}

async function submitBooking(event) {
    event.preventDefault();
    
    document.getElementById('loadingOverlay').classList.add('active');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const formData = new FormData(event.target);
    const bookingData = {
        id: 'BJP' + Date.now(),
        date: new Date().toISOString(),
        serviceType: formData.get('serviceType'),
        category: formData.get('category'),
        fullName: formData.get('fullName'),
        mobile: formData.get('mobile'),
        status: 'Confirmed'
    };
    
    const fieldMap = {
        city: 'city', hotel: 'hotel', rooms: 'rooms', checkin: 'checkin', checkout: 'checkout',
        venue: 'venue', attendees: 'attendees', from: 'from', to: 'to', travelDate: 'travelDate',
        class: 'class', passengers: 'passengers', vehicleType: 'vehicleType',
        vehiclesCount: 'vehiclesCount', duration: 'duration', rallyLocation: 'rallyLocation',
        participants: 'participants', requirements: 'requirements'
    };
    
    for (let [key, field] of Object.entries(fieldMap)) {
        const value = formData.get(field);
        if (value) bookingData[key] = value;
    }
    
    if (bookingData.checkin && bookingData.checkout) {
        const checkin = new Date(bookingData.checkin);
        const checkout = new Date(bookingData.checkout);
        bookingData.nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        
        const hotelSelect = document.getElementById('hotelSelect');
        const selectedOption = hotelSelect.selectedOptions[0];
        if (selectedOption && selectedOption.dataset.price) {
            bookingData.pricePerNight = parseInt(selectedOption.dataset.price);
            bookingData.totalAmount = bookingData.pricePerNight * bookingData.nights * (parseInt(bookingData.rooms) || 1);
        }
    }
    
    bookings.push(bookingData);
    localStorage.setItem('bjpBookings', JSON.stringify(bookings));
    
    document.getElementById('loadingOverlay').classList.remove('active');
    
    generateVoucher(bookingData);
    event.target.reset();
}

function generateVoucher(booking) {
    let detailsHTML = '';
    
    if (booking.serviceType.includes('Hotel')) {
        detailsHTML = `
            <div class="detail-row"><span class="detail-label">City</span><span class="detail-value">${booking.city}</span></div>
            <div class="detail-row"><span class="detail-label">Hotel</span><span class="detail-value">${booking.hotel}</span></div>
            <div class="detail-row"><span class="detail-label">Rooms</span><span class="detail-value">${booking.rooms}</span></div>
            <div class="detail-row"><span class="detail-label">Check-in</span><span class="detail-value">${formatDate(booking.checkin)}</span></div>
            <div class="detail-row"><span class="detail-label">Check-out</span><span class="detail-value">${formatDate(booking.checkout)}</span></div>
            <div class="detail-row"><span class="detail-label">Nights</span><span class="detail-value">${booking.nights} night${booking.nights > 1 ? 's' : ''}</span></div>
        `;
    } else if (booking.serviceType.includes('Seminar')) {
        detailsHTML = `
            <div class="detail-row"><span class="detail-label">Venue</span><span class="detail-value">${booking.venue || 'TBD'}</span></div>
            <div class="detail-row"><span class="detail-label">Attendees</span><span class="detail-value">${booking.attendees || 'N/A'}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.travelDate)}</span></div>
        `;
    } else if (booking.serviceType.includes('Train') || booking.serviceType.includes('Flight')) {
        detailsHTML = `
            <div class="detail-row"><span class="detail-label">From</span><span class="detail-value">${booking.from}</span></div>
            <div class="detail-row"><span class="detail-label">To</span><span class="detail-value">${booking.to}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.travelDate)}</span></div>
            ${booking.class ? `<div class="detail-row"><span class="detail-label">Class</span><span class="detail-value">${booking.class}</span></div>` : ''}
            ${booking.passengers ? `<div class="detail-row"><span class="detail-label">Passengers</span><span class="detail-value">${booking.passengers}</span></div>` : ''}
        `;
    } else if (booking.serviceType.includes('Vehicle')) {
        detailsHTML = `
            <div class="detail-row"><span class="detail-label">Vehicle Type</span><span class="detail-value">${booking.vehicleType}</span></div>
            <div class="detail-row"><span class="detail-label">Vehicles</span><span class="detail-value">${booking.vehiclesCount}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.travelDate)}</span></div>
            <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${booking.duration}</span></div>
        `;
    } else if (booking.serviceType.includes('Charter')) {
        detailsHTML = `
            <div class="detail-row"><span class="detail-label">From</span><span class="detail-value">${booking.from}</span></div>
            <div class="detail-row"><span class="detail-label">To</span><span class="detail-value">${booking.to}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.travelDate)}</span></div>
            <div class="detail-row"><span class="detail-label">Passengers</span><span class="detail-value">${booking.passengers}</span></div>
        `;
    } else if (booking.serviceType.includes('Rally')) {
        detailsHTML = `
            <div class="detail-row"><span class="detail-label">From</span><span class="detail-value">${booking.from}</span></div>
            <div class="detail-row"><span class="detail-label">To</span><span class="detail-value">${booking.to}</span></div>
            <div class="detail-row"><span class="detail-label">Rally Location</span><span class="detail-value">${booking.rallyLocation}</span></div>
            <div class="detail-row"><span class="detail-label">Participants</span><span class="detail-value">${booking.participants}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(booking.travelDate)}</span></div>
        `;
    }
    
    const icon = serviceConfig[Object.keys(serviceConfig).find(k => serviceConfig[k].title === booking.serviceType)]?.icon || '📋';
    
    const voucherHTML = `
        <div class="voucher-header">
            <img src="bjp-logo-circular.png" alt="BJP" class="voucher-logo">
            <div class="voucher-title">Booking Voucher</div>
            <div class="voucher-subtitle">Bengal BJP Travel & Accommodation</div>
        </div>
        
        <div class="booking-ref">
            <div class="booking-ref-label">Booking Reference</div>
            <div class="booking-ref-code">${booking.id}</div>
        </div>
        
        <div class="voucher-section">
            <h3>👤 Passenger Details</h3>
            <div class="voucher-details">
                <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${booking.fullName}</span></div>
                <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${booking.category}</span></div>
                <div class="detail-row"><span class="detail-label">Mobile</span><span class="detail-value">${booking.mobile}</span></div>
            </div>
        </div>
        
        <div class="voucher-section">
            <h3>${icon} Booking Details</h3>
            <div class="voucher-details">
                <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.serviceType}</span></div>
                ${detailsHTML}
            </div>
        </div>
        
        ${booking.totalAmount ? `
        <div class="voucher-section">
            <h3>💰 Payment Summary</h3>
            <div class="voucher-details">
                <div class="detail-row"><span class="detail-label">Rate per Night</span><span class="detail-value">₹${booking.pricePerNight}</span></div>
                <div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value" style="color: #FF9933; font-size: 18px;">₹${booking.totalAmount}</span></div>
            </div>
        </div>
        ` : ''}
        
        <div class="voucher-section">
            <h3>📝 Additional Information</h3>
            <div class="voucher-details">
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value" style="color: #2E7D32;">✓ ${booking.status}</span></div>
                <div class="detail-row"><span class="detail-label">Booking Date</span><span class="detail-value">${formatDateTime(booking.date)}</span></div>
                ${booking.requirements ? `<div class="detail-row"><span class="detail-label">Special Requests</span><span class="detail-value">${booking.requirements}</span></div>` : ''}
            </div>
        </div>
        
        <div class="action-buttons">
            <button class="submit-btn" onclick="downloadVoucher()">📥 Download</button>
            <button class="submit-btn btn-secondary" onclick="shareVoucher('${booking.id}')">📤 Share</button>
        </div>
        
        <button class="submit-btn" onclick="navigate('services')" style="margin-top: 10px;">✓ Done</button>
        
        <div class="voucher-footer">
            <p><strong>Bengal BJP Travel & Accommodation Department</strong></p>
            <p>BJP State Office, 27 GN Block, Sector V, Salt Lake, Kolkata 700091</p>
            <p>📱 WhatsApp: 8250708123 | Available 24/7</p>
            <p style="margin-top: 10px; color: #FF9933;">🙏 Jai Hind | जय हिन्द | জয় হিন্দ</p>
        </div>
    `;
    
    document.getElementById('voucherContent').innerHTML = voucherHTML;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('voucherPage').classList.add('active');
    document.getElementById('backBtn').classList.remove('show');
    updateHeader('voucher');
}

function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    const emptyState = document.getElementById('emptyState');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    bookingsList.innerHTML = bookings.map(booking => {
        const icon = serviceConfig[Object.keys(serviceConfig).find(k => serviceConfig[k].title === booking.serviceType)]?.icon || '📋';
        let subtitle = '';
        if (booking.city) subtitle = booking.city + (booking.hotel ? ' • ' + booking.hotel : '');
        else if (booking.from && booking.to) subtitle = `${booking.from} → ${booking.to}`;
        else if (booking.venue) subtitle = booking.venue;
        
        let dateRange = '';
        if (booking.checkin && booking.checkout) {
            dateRange = `${formatDate(booking.checkin)} - ${formatDate(booking.checkout)}`;
        } else if (booking.travelDate) {
            dateRange = formatDate(booking.travelDate);
        }
        
        return `
            <div class="booking-item" onclick="viewVoucher('${booking.id}')">
                <div class="booking-header">
                    <span class="booking-icon">${icon}</span>
                    <span class="booking-ref-small">${booking.id}</span>
                </div>
                <div class="booking-info">
                    <h3>${booking.serviceType}</h3>
                    ${subtitle ? `<p>${subtitle}</p>` : ''}
                    ${dateRange ? `<p>${dateRange}</p>` : ''}
                    <span class="status-badge status-confirmed">✓ ${booking.status}</span>
                </div>
            </div>
        `;
    }).join('');
}

function viewVoucher(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) generateVoucher(booking);
}

function downloadVoucher() {
    window.print();
}

function shareVoucher(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        let details = `🎫 BJP Travel Booking Voucher\n\nBooking Reference: ${booking.id}\nService: ${booking.serviceType}\nName: ${booking.fullName}\nCategory: ${booking.category}\nMobile: ${booking.mobile}\nStatus: ✓ ${booking.status}`;
        
        if (booking.city) details += `\nCity: ${booking.city}`;
        if (booking.hotel) details += `\nHotel: ${booking.hotel}`;
        if (booking.from && booking.to) details += `\nRoute: ${booking.from} → ${booking.to}`;
        if (booking.travelDate) details += `\nDate: ${formatDate(booking.travelDate)}`;
        if (booking.checkin) details += `\nCheck-in: ${formatDate(booking.checkin)}`;
        if (booking.checkout) details += `\nCheck-out: ${formatDate(booking.checkout)}`;
        
        details += '\n\nBengal BJP Travel & Accommodation\nBJP State Office, 27 GN Block, Sector V, Salt Lake, Kolkata 700091\n📱 8250708123';
        
        window.open(`https://wa.me/?text=${encodeURIComponent(details)}`, '_blank');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function openWhatsApp() {
    window.open('https://wa.me/918250708123?text=नमस्कार! I need travel assistance.', '_blank');
}

// Profile Management
function loadProfile() {
    const profileContent = document.getElementById('profileContent');
    
    if (userProfile) {
        profileContent.innerHTML = `
            <div class="profile-info">
                <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">${userProfile.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mobile</span>
                    <span class="info-value">${userProfile.mobile}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">${userProfile.email || 'Not provided'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category</span>
                    <span class="info-value">${userProfile.category || 'Not set'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Bookings</span>
                    <span class="info-value">${bookings.length}</span>
                </div>
            </div>
            <button class="edit-profile-btn" onclick="editProfile()">✏️ Edit Profile</button>
            <button class="submit-btn" style="margin-top: 10px; background: white; color: #FF9933; border: 2px solid #FF9933;" onclick="clearProfile()">🗑️ Clear Profile</button>
        `;
    } else {
        profileContent.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 60px; margin-bottom: 20px; opacity: 0.3;">👤</div>
                <h3 style="color: #666; margin-bottom: 10px;">No Profile Set</h3>
                <p style="color: #999; margin-bottom: 25px;">Create your profile to auto-fill booking forms</p>
                <button class="submit-btn" onclick="editProfile()">➕ Create Profile</button>
            </div>
        `;
    }
}

function editProfile() {
    const name = prompt('Enter your full name:', userProfile?.name || '');
    if (!name) return;
    
    const mobile = prompt('Enter your mobile number (10 digits):', userProfile?.mobile || '');
    if (!mobile || mobile.length !== 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    const email = prompt('Enter your email (optional):', userProfile?.email || '');
    const category = prompt('Enter category (Karyakarta/Guest/Passenger):', userProfile?.category || '');
    
    userProfile = { name, mobile, email, category };
    localStorage.setItem('bjpUserProfile', JSON.stringify(userProfile));
    loadProfile();
    alert('✅ Profile saved successfully!');
}

function clearProfile() {
    if (confirm('Are you sure you want to clear your profile?')) {
        userProfile = null;
        localStorage.removeItem('bjpUserProfile');
        loadProfile();
        alert('Profile cleared');
    }
}

function prefillUserData() {
    if (userProfile) {
        const nameInput = document.getElementById('fullNameInput');
        const mobileInput = document.getElementById('mobileInput');
        
        if (nameInput && !nameInput.value) {
            nameInput.value = userProfile.name;
        }
        if (mobileInput && !mobileInput.value) {
            mobileInput.value = userProfile.mobile;
        }
    }
}
