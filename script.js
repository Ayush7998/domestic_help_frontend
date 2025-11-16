document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://domestic-help-backend.onrender.com/api';

    // --- Global Selectors ---
    const pages = document.querySelectorAll('.page');
    const preLoginNav = document.getElementById('pre-login-nav');
    const postLoginNav = document.getElementById('post-login-nav');
    const userInitials = document.getElementById('user-initials');
    const navProfilePic = document.getElementById('nav-profile-pic');
    const dashboardProfilePic = document.getElementById('dashboard-profile-pic');
    const dashboardInitials = document.getElementById('dashboard-initials');
    const profilePicUpload = document.getElementById('profile-pic-upload');
    const helperDashboardProfilePic = document.getElementById('helper-dashboard-profile-pic');
    const helperDashboardInitials = document.getElementById('helper-dashboard-initials');
    const helperProfilePicUpload = document.getElementById('helper-profile-pic-upload');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const authResponse = document.getElementById('auth-response');
    const navBookHelper = document.getElementById('nav-book-helper');
    const navMyBookings = document.getElementById('nav-my-bookings');
    const mobileNavBookHelper = document.getElementById('mobile-nav-book-helper');
    const mobileNavMyBookings = document.getElementById('mobile-nav-my-bookings');
    const navRequests = document.getElementById('nav-requests');
    const mobileNavRequests = document.getElementById('mobile-nav-requests');

    // --- State Management ---
    let currentUser = null;
    let allHelpers = [];

    // --- Page Navigation ---
    window.showPage = (pageId) => {
        if ((pageId === 'my-bookings' || pageId === 'dashboard' || pageId === 'requests') && !currentUser) {
            showPage('signin');
            return;
        }
        pages.forEach(page => page.classList.remove('active'));
        const newPage = document.getElementById(`${pageId}-page`);
        if (newPage) newPage.classList.add('active');
        window.scrollTo(0, 0);

        if (pageId === 'booking') fetchAndDisplayHelpers();
        if (pageId === 'my-bookings') fetchAndDisplayMyBookings();
        if (pageId === 'requests') fetchAndDisplayHelperRequests();
    };

    // --- Auth & UI ---
    function handleAuthSuccess(user) {
        currentUser = user;
        currentUser.id = user.user_id || user.helper_id;
        updateUIForLogin();
        showPage('dashboard');
    }

    function updateUIForLogin() {
        const householdLinks = [navBookHelper, navMyBookings, mobileNavBookHelper, mobileNavMyBookings].filter(Boolean); // Filter out nulls
        const helperLinks = [navRequests, mobileNavRequests].filter(Boolean); // Filter out nulls
        const householdDashboard = document.getElementById('household-dashboard');
        const helperDashboard = document.getElementById('helper-dashboard');

        if (currentUser) {
            preLoginNav && preLoginNav.classList.add('hidden');
            postLoginNav && postLoginNav.classList.remove('hidden');
            postLoginNav && postLoginNav.classList.add('flex');
            
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

            // Update navigation bar profile picture
            if (currentUser.profile_picture_url) {
                if (navProfilePic) navProfilePic.src = currentUser.profile_picture_url;
                if (navProfilePic) navProfilePic.classList.remove('hidden');
                if (userInitials) userInitials.classList.add('hidden');
            } else {
                if (navProfilePic) navProfilePic.classList.add('hidden');
                if (userInitials) {
                    userInitials.textContent = initials;
                    userInitials.classList.remove('hidden');
                }
            }

            const isHelper = currentUser.role === 'helper';
            householdLinks.forEach(link => link.classList.toggle('hidden', isHelper));
            helperLinks.forEach(link => link.classList.toggle('hidden', !isHelper));
            if (householdDashboard) householdDashboard.classList.toggle('hidden', isHelper);
            if (helperDashboard) helperDashboard.classList.toggle('hidden', !isHelper);

            if (isHelper) {
                const helperDashboardName = document.getElementById('helper-dashboard-name');
                const helperDashboardEmail = document.getElementById('helper-dashboard-email');
                const helperDashboardSkill = document.getElementById('helper-dashboard-skill');
                const helperAbout = document.getElementById('helper-about');

                if (helperDashboardName) helperDashboardName.textContent = currentUser.name;
                if (helperDashboardEmail) helperDashboardEmail.textContent = currentUser.email;
                if (helperDashboardSkill) helperDashboardSkill.textContent = `Skill: ${currentUser.skill_type}`;
                if (helperAbout) helperAbout.value = currentUser.about || '';

                if (currentUser.profile_picture_url) {
                    if (helperDashboardProfilePic) helperDashboardProfilePic.src = currentUser.profile_picture_url;
                    if (helperDashboardProfilePic) helperDashboardProfilePic.classList.remove('hidden');
                    if (helperDashboardInitials) helperDashboardInitials.classList.add('hidden');
                } else {
                    if (helperDashboardProfilePic) helperDashboardProfilePic.classList.add('hidden');
                    if (helperDashboardInitials) {
                        helperDashboardInitials.textContent = initials;
                        helperDashboardInitials.classList.remove('hidden');
                    }
                }

            } else {
                const dashboardName = document.getElementById('dashboard-name');
                const dashboardEmail = document.getElementById('dashboard-email');
                const dashboardAge = document.getElementById('dashboard-age');
                const dashboardAddress = document.getElementById('dashboard-address');

                if (dashboardName) dashboardName.textContent = currentUser.name;
                if (dashboardEmail) dashboardEmail.textContent = currentUser.email;
                if (dashboardAge) dashboardAge.textContent = currentUser.age;
                if (dashboardAddress) dashboardAddress.textContent = currentUser.address || 'N/A';

                if (currentUser.profile_picture_url) {
                    if (dashboardProfilePic) dashboardProfilePic.src = currentUser.profile_picture_url;
                    if (dashboardProfilePic) dashboardProfilePic.classList.remove('hidden');
                    if (dashboardInitials) dashboardInitials.classList.add('hidden');
                } else {
                    if (dashboardProfilePic) dashboardProfilePic.classList.add('hidden');
                    if (dashboardInitials) {
                        dashboardInitials.textContent = initials;
                        dashboardInitials.classList.remove('hidden');
                    }
                }
            }

        } else {
            preLoginNav && preLoginNav.classList.remove('hidden');
            postLoginNav && postLoginNav.classList.add('hidden');
            postLoginNav && postLoginNav.classList.remove('flex');
            householdLinks.forEach(link => link.classList.remove('hidden'));
            helperLinks.forEach(link => link.classList.add('hidden'));
            householdDashboard && householdDashboard.classList.add('hidden');
            helperDashboard && helperDashboard.classList.add('hidden');
        }
    }

    window.handleLogout = () => {
        currentUser = null;
        updateUIForLogin();
        showPage('home');
    };

    // --- Auth Page Logic ---
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authTabContents = document.querySelectorAll('.auth-tab-content');
    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            authTabBtns.forEach(b => {
                b.classList.remove('active', 'text-indigo-600', 'border-indigo-600');
                b.classList.add('text-gray-500');
            });
            btn.classList.add('active', 'text-indigo-600', 'border-indigo-600');
            authTabContents.forEach(c => c.classList.remove('active'));
            const targetTab = document.getElementById(`${btn.dataset.tab}-tab`);
            if (targetTab) targetTab.classList.add('active');
            authResponse && (authResponse.textContent = '');
        });
    });

    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            authResponse && (authResponse.textContent = '');
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(res => res.json().then(body => ({ ok: res.ok, body })))
            .then(({ ok, body }) => {
                if (ok) handleAuthSuccess(body);
                else throw new Error(body.message);
            })
            .catch(err => {
                if (authResponse) {
                    authResponse.className = 'mt-4 text-center font-medium text-red-600';
                    authResponse.textContent = err.message;
                }
            });
        });
    }

    const signupForm = document.getElementById('signup-form');
    if(signupForm) {
        const signupUserTypeRadios = document.querySelectorAll('input[name="role"]');
        const signupAddressField = document.getElementById('signup-address-field');
        const signupHelperFields = document.getElementById('signup-helper-fields');

        signupUserTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const isHelper = radio.value === 'helper';
                if (signupAddressField) {
                    signupAddressField.classList.toggle('hidden', isHelper);
                    signupAddressField.querySelector('textarea').required = !isHelper;
                }
                if (signupHelperFields) {
                    signupHelperFields.classList.toggle('hidden', !isHelper);
                    if (signupHelperFields.querySelector('input')) {
                        signupHelperFields.querySelector('input').required = isHelper;
                    }
                }
            });
        });

        signupForm.addEventListener('submit', e => {
            e.preventDefault();
            authResponse && (authResponse.textContent = '');
            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());

            fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(res => res.json().then(body => ({ ok: res.ok, body })))
            .then(({ ok, body }) => {
                if (ok) handleAuthSuccess(body);
                else throw new Error(body.message);
            })
            .catch(err => {
                if (authResponse) {
                    authResponse.className = 'mt-4 text-center font-medium text-red-600';
                    authResponse.textContent = err.message;
                }
            });
        });
    }
    
    // --- Helper Profile Form Logic ---
    const helperProfileForm = document.getElementById('helper-profile-form');
    if (helperProfileForm) {
        helperProfileForm.addEventListener('submit', e => {
            e.preventDefault();
            const responseDiv = document.getElementById('helper-profile-response');
            if (responseDiv) responseDiv.textContent = '';
            const aboutText = document.getElementById('helper-about') ? document.getElementById('helper-about').value : '';

            fetch(`${API_URL}/helpers/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ about: aboutText })
            })
            .then(res => res.json().then(body => ({ ok: res.ok, body })))
            .then(({ ok, body }) => {
                if (ok) {
                    currentUser.about = aboutText; // Update local state
                    if (responseDiv) {
                        responseDiv.className = 'mt-3 text-center font-medium text-green-600';
                        responseDiv.textContent = 'Profile updated successfully!';
                    }
                } else {
                    throw new Error(body.message);
                }
            })
            .catch(err => {
                if (responseDiv) {
                    responseDiv.className = 'mt-3 text-center font-medium text-red-600';
                    responseDiv.textContent = `Error: ${err.message}`;
                }
            });
        });
    }

    // --- Helper & Booking Logic ---
    const helpersList = document.getElementById('helpers-list');
    const bookingForm = document.getElementById('booking-form');
    const helperIdInput = document.getElementById('helper-id-input');
    const helperNameDisplay = document.getElementById('helper-name-display');
    const timeSlotButtons = document.querySelectorAll('.time-slot-btn');
    const finalStartTimeInput = document.getElementById('final-start-time');
    const finalEndTimeInput = document.getElementById('final-end-time');
    const bookingResponse = document.getElementById('booking-response');
    const helperModal = document.getElementById('helper-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalSpecialty = document.getElementById('modal-specialty');
    const modalDescription = document.getElementById('modal-description');
    const modalBookBtn = document.getElementById('modal-book-btn');

    function fetchAndDisplayHelpers() {
        fetch(`${API_URL}/helpers`).then(res => res.json()).then(data => {
            allHelpers = data;
            if (helpersList) helpersList.innerHTML = '';
            if(data.length === 0) {
                if (helpersList) helpersList.innerHTML = `<p class="text-gray-500 col-span-full">No helpers available.</p>`;
                return;
            }
            data.forEach(helper => {
                const initials = helper.name.split(' ').map(n => n[0]).join('').toUpperCase();
                const profilePicSrc = helper.profile_picture_url || `https://placehold.co/150x150/E2E8F0/4A5568?text=${initials}`;
                const profilePicDisplay = helper.profile_picture_url ? '' : 'hidden';
                const initialsDisplay = helper.profile_picture_url ? 'hidden' : '';

                if (helpersList) helpersList.innerHTML += `
                <div class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group">
                    <div class="p-6">
                        <div class="flex items-center space-x-4">
                            <div class="relative h-16 w-16 rounded-full object-cover bg-gray-200">
                                <img class="h-full w-full rounded-full object-cover ${profilePicDisplay}" src="${profilePicSrc}" alt="${helper.name}">
                                <div class="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold text-lg ${initialsDisplay}">${initials}</div>
                            </div>
                            <div>
                                <h4 class="text-xl font-bold text-gray-900">${helper.name}</h4>
                                <p class="text-sm text-indigo-600 font-semibold">${helper.skill_type}</p>
                            </div>
                        </div>
                        <p class="mt-4 text-gray-600 text-sm h-10 overflow-hidden text-ellipsis">${helper.about || `Experienced ${helper.skill_type} with ${helper.experience}+ years of service.`}</p>
                        <div class="mt-4 flex space-x-2">
                            <button onclick="selectHelper(${helper.helper_id}, '${helper.name}')" class="flex-1 bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700">Select & Book</button>
                            <button onclick="viewHelperDetails(${helper.helper_id})" class="flex-none bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300">View Details</button>
                        </div>
                    </div>
                </div>`;
            });
        }).catch(err => {
            console.error("Failed to fetch helpers:", err);
            if (helpersList) helpersList.innerHTML = `<p class="text-red-500 col-span-full">Could not load helpers.</p>`;
        });
    }

    window.viewHelperDetails = (helperId) => {
        const helper = allHelpers.find(h => h.helper_id === helperId);
        if (!helper) return;
        const initials = helper.name.split(' ').map(n => n[0]).join('').toUpperCase();
        if (modalImg) modalImg.src = helper.profile_picture_url || `https://placehold.co/150x150/E2E8F0/4A5568?text=${initials}`;
        if (modalName) modalName.textContent = helper.name;
        if (modalSpecialty) modalSpecialty.textContent = helper.skill_type;
        if (modalDescription) modalDescription.textContent = helper.about || `A dedicated ${helper.skill_type} with over ${helper.experience} years of experience. Verified and trusted by the community.`;
        if (modalBookBtn) modalBookBtn.onclick = () => {
            selectHelper(helper.helper_id, helper.name);
            closeModal();
            document.getElementById('booking-form') && document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' });
        };
        if (helperModal) helperModal.classList.add('active');
    }

    window.closeModal = () => helperModal && helperModal.classList.remove('active');

    window.selectHelper = (helperId, name) => {
        if (!currentUser) { showPage('signin'); return; }
        if (helperNameDisplay) helperNameDisplay.textContent = `Booking for: ${name}`;
        if (helperIdInput) helperIdInput.value = helperId;
        if (helperNameDisplay) helperNameDisplay.classList.add('font-bold', 'text-indigo-700');
    }

    mobileMenuButton && mobileMenuButton.addEventListener('click', () => mobileMenu && mobileMenu.classList.toggle('hidden'));

    timeSlotButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            timeSlotButtons.forEach(btn => btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600'));
            e.currentTarget.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
            const customTimeInputs = document.getElementById('custom-time-inputs');
            if (e.currentTarget.id === 'custom-time-btn') {
                customTimeInputs && customTimeInputs.classList.remove('hidden');
            } else {
                customTimeInputs && customTimeInputs.classList.add('hidden');
                if (finalStartTimeInput) finalStartTimeInput.value = e.currentTarget.dataset.start;
                if (finalEndTimeInput) finalEndTimeInput.value = e.currentTarget.dataset.end;
            }
        });
    });

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (!currentUser) { alert("Please sign in to book."); showPage('signin'); return; }

            const customTimeInputsElement = document.getElementById('custom-time-inputs');
            if (customTimeInputsElement && !customTimeInputsElement.classList.contains('hidden')) {
                if (finalStartTimeInput) finalStartTimeInput.value = document.getElementById('start-time').value;
                if (finalEndTimeInput) finalEndTimeInput.value = document.getElementById('end-time').value;
            }

            const bookingData = {
                user_id: currentUser.id,
                helper_id: helperIdInput ? helperIdInput.value : null,
                booking_date: document.getElementById('booking-date') ? document.getElementById('booking-date').value : null,
                start_time: finalStartTimeInput ? finalStartTimeInput.value : null,
                end_time: finalEndTimeInput ? finalEndTimeInput.value : null
            };

            if (!bookingData.helper_id || !bookingData.booking_date || !bookingData.start_time || !bookingData.end_time) {
                if (bookingResponse) {
                    bookingResponse.textContent = 'Please select a helper, date, and time.';
                    bookingResponse.className = 'mt-4 text-center font-medium text-red-600';
                }
                return;
            }

            fetch(`${API_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingData) })
            .then(res => res.json().then(body => ({ ok: res.ok, body })))
            .then(({ ok, body }) => {
                if (ok) {
                    if (bookingResponse) {
                        bookingResponse.textContent = 'Booking confirmed successfully!';
                        bookingResponse.className = 'mt-4 text-center font-medium text-green-600';
                    }
                    setTimeout(() => showPage('my-bookings'), 2000);
                } else {
                    throw new Error(body.message);
                }
            })
            .catch(err => {
                if (bookingResponse) {
                    bookingResponse.textContent = `Error: ${err.message}`;
                    bookingResponse.className = 'mt-4 text-center font-medium text-red-600';
                }
            });
        });
    }

    // --- Fetch and Display My Bookings (Household) ---
    const bookingsList = document.getElementById('bookings-list');
    const noBookingsMessage = document.getElementById('no-bookings');

    function fetchAndDisplayMyBookings() {
        if (!currentUser || currentUser.role !== 'household') return;

        if (!bookingsList || !noBookingsMessage) {
            console.error("Error: Bookings list or no bookings message element not found.");
            return;
        }

        fetch(`${API_URL}/bookings/users/${currentUser.id}`)
            .then(res => res.json())
            .then(bookings => {
                bookingsList.innerHTML = '';
                if (bookings.length === 0) {
                    noBookingsMessage.classList.remove('hidden');
                    bookingsList.classList.add('hidden');
                } else {
                    noBookingsMessage.classList.add('hidden');
                    bookingsList.classList.remove('hidden');
                    bookings.forEach(booking => {
                        const statusColor = {
                            'Requested': 'bg-yellow-100 text-yellow-800',
                            'Confirmed': 'bg-green-100 text-green-800',
                            'Declined': 'bg-red-100 text-red-800',
                            'Completed': 'bg-gray-100 text-gray-800',
                        }[booking.status] || 'bg-gray-100 text-gray-800';

                        bookingsList.innerHTML += `
                            <div class="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">${booking.helper_name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                                    <div>
                                        <h4 class="text-xl font-bold text-gray-900">${booking.helper_name} (${booking.skill_type})</h4>
                                        <p class="text-gray-600">${new Date(booking.booking_date).toLocaleDateString()}</p>
                                        <p class="text-sm text-gray-500">${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}</p>
                                    </div>
                                </div>
                                <div>
                                    <span class="${statusColor} font-semibold px-3 py-1.5 rounded-full">${booking.status}</span>
                                </div>
                            </div>
                        `;
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching household bookings:", err);
                if (bookingsList) bookingsList.innerHTML = `<p class="text-red-500">Could not load your bookings.</p>`;
            });
    }

    // --- Fetch and Display Helper Requests ---
    const requestsList = document.getElementById('requests-list');
    const noRequestsMessage = document.getElementById('no-requests');

    function fetchAndDisplayHelperRequests() {
        if (!currentUser || currentUser.role !== 'helper') return;

        if (!requestsList || !noRequestsMessage) {
            console.error("Error: Requests list or no requests message element not found.");
            return;
        }

        fetch(`${API_URL}/bookings/helpers/${currentUser.id}/requests`)
            .then(res => res.json())
            .then(requests => {
                requestsList.innerHTML = '';
                if (requests.length === 0) {
                    noRequestsMessage.classList.remove('hidden');
                    requestsList.classList.add('hidden');
                } else {
                    noBookingsMessage.classList.add('hidden');
                    requestsList.classList.remove('hidden');
                    requests.forEach(request => {
                        requestsList.innerHTML += `
                            <div class="bg-white p-6 rounded-xl shadow-md">
                                <h4 class="text-xl font-bold text-gray-900">Request from ${request.user_name}</h4>
                                <p class="text-gray-600">Address: ${request.address}</p>
                                <p class="text-gray-600">Date: ${new Date(request.booking_date).toLocaleDateString()}</p>
                                <p class="text-gray-600">Time: ${request.start_time.substring(0, 5)} - ${request.end_time.substring(0, 5)}</p>
                                <div class="mt-4 flex space-x-2">
                                    <button onclick="updateBookingStatus(${request.booking_id}, 'Confirmed')" class="flex-1 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700">Accept</button>
                                    <button onclick="updateBookingStatus(${request.booking_id}, 'Declined')" class="flex-1 bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700">Decline</button>
                                </div>
                            </div>
                        `;
                    });
                }
            })
            .catch(err => {
                console.error("Error fetching helper requests:", err);
                if (requestsList) requestsList.innerHTML = `<p class="text-red-500">Could not load requests.</p>`;
            });
    }

    window.updateBookingStatus = (bookingId, status) => {
        fetch(`${API_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        })
        .then(res => res.json().then(body => ({ ok: res.ok, body })))
        .then(({ ok, body }) => {
            if (ok) {
                alert(`Request ${bookingId} ${status.toLowerCase()} successfully!`);
                fetchAndDisplayHelperRequests(); // Refresh requests list
                fetchAndDisplayMyBookings(); // Refresh household bookings (if household is logged in)
            } else {
                throw new Error(body.message);
            }
        })
        .catch(err => {
            console.error("Error updating booking status:", err);
            alert(`Error updating status: ${err.message}`);
        });
    };

    // --- Initial Load ---
    const initialPage = window.location.hash.substring(1) || 'home';
    showPage(initialPage);
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.add('p-3', 'border', 'border-gray-300', 'rounded-lg', 'text-sm', 'font-semibold', 'text-gray-700', 'hover:bg-indigo-50', 'hover:border-indigo-400', 'transition-colors');
    });

    // --- Profile Picture Upload Logic ---
    async function uploadProfilePicture(file) {
        if (!currentUser || !file) return;

        const formData = new FormData();
        formData.append('profile_picture', file);
        formData.append('role', currentUser.role);
        formData.append('id', currentUser.id);

        try {
            const res = await fetch(`${API_URL}/upload-profile-picture`, {
                method: 'POST',
                body: formData
            });
            const body = await res.json();

            if (res.ok) {
                currentUser.profile_picture_url = body.profile_picture_url; // Update local state
                updateUIForLogin(); // Refresh UI
                alert('Profile picture uploaded successfully!');
            } else {
                throw new Error(body.message);
            }
        } catch (err) {
            console.error("Error uploading profile picture:", err);
            alert(`Error uploading profile picture: ${err.message}`);
        }
    }

    if (profilePicUpload) {
        profilePicUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadProfilePicture(e.target.files[0]);
            }
        });
    }

    if (helperProfilePicUpload) {
        helperProfilePicUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadProfilePicture(e.target.files[0]);
            }
        });
    }
});
