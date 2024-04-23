function toggleMenu() {
    var menu = document.querySelector('.menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }


 // Function to handle page loading
 function loadPage(event) {
  // Prevent default link behavior
  event.preventDefault();

  // Show loading line
  const loadingLine = document.querySelector('.loading-line');
  loadingLine.style.display = 'block';

  // Show loading line for at least 2 seconds before navigating
  setTimeout(() => {
    // Get the URL of the clicked link
    const pageUrl = event.target.getAttribute('href');

    // Navigate to the next page
    window.location.href = pageUrl;
  }, 2000); // 2000 milliseconds = 2 seconds
}


// document.addEventListener("DOMContentLoaded", function() {
//   const container = document.querySelector('.feedback-container');
//   const slides = document.querySelectorAll('.feedback-slide');
//   let index = 0;

//   function showSlide(index) {
//     const offset = index * -100 + '%';
//     document.querySelector('.feedback-slides').style.transform = 'translateX(' + offset + ')';
//   }

//   setInterval(function() {
//     index = (index + 1) % slides.length;
//     showSlide(index);
//   }, 5000); // Change slide every 5 seconds (adjust as needed)
// });

// script.js
function openMenu() {
  document.getElementById("menuBar").style.width = "80%";
}

function closeMenu() {
  document.getElementById("menuBar").style.width = "0";
}


var swiper = new Swiper('.swiper-container', {
  // Optional parameters
  loop: true,
  // If you want to enable pagination
  pagination: {
    el: '.swiper-pagination',
  },
  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});









// Get the container element
const container = document.querySelector('.menu-container');

// Variables to store initial touch position
let initialX = null;

// Event listener for touch start
container.addEventListener('touchstart', (e) => {
  initialX = e.touches[0].clientX;
});

// Event listener for touch move
container.addEventListener('touchmove', (e) => {
  if (!initialX) {
    return;
  }

  const currentX = e.touches[0].clientX;
  const diffX = initialX - currentX;

  // Scroll horizontally
  container.scrollLeft += diffX;

  // Update initial touch position
  initialX = currentX;
});

// Event listener for touch end
container.addEventListener('touchend', () => {
  initialX = null; // Reset initial touch position
});





function startLoading(buttonId) {
  // Get the button element
  const button = document.getElementById(buttonId);
  
  // Add loading class to the button to trigger animation
  button.classList.add('loading');

  // Simulate loading delay (remove this line in real implementation)
  setTimeout(() => {
    // Remove loading class after delay (simulate loading completion)
    button.classList.remove('loading');

    // Redirect to the next page or perform other actions here
    window.location.href = 'another-page.html'; // Example: redirect to the next page
  }, 2000); // Adjust delay time as needed (in milliseconds)
}







 // Function to validate the form before submission
 function validateForm() {
  var username = document.getElementById('username').value;
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  // Simple validation: check if any field is empty
  if (username.trim() === '' || email.trim() === '' || password.trim() === '') {
      alert('Please fill in all fields');
      return false; // Prevent form submission
  }
  return true; // Allow form submission
}



document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(this);
  const username = formData.get('username');
  const password = formData.get('password');

  try {
      const response = await fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
      });

      if (response.ok) {
          window.location.href = '/profile'; // Redirect to profile page on successful login
      } else {
          const errorMessage = await response.text();
          // Display error message
          alert(errorMessage);
      }
  } catch (error) {
      console.error('Error submitting login form:', error);
      // Display error message
      alert('An error occurred. Please try again later.');
  }
});


// Function to generate a unique user ID
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Check if the user has a stored identifier
let userId = localStorage.getItem('userId');

if (!userId) {
  // If the identifier doesn't exist, generate a new one
  userId = generateUserId();
  // Store the new identifier
  localStorage.setItem('userId', userId);
}

// Now you can use the userId variable for further operations
console.log('User ID:', userId);
