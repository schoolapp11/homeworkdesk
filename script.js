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


document.addEventListener("DOMContentLoaded", function() {
  const container = document.querySelector('.feedback-container');
  const slides = document.querySelectorAll('.feedback-slide');
  let index = 0;

  function showSlide(index) {
    const offset = index * -100 + '%';
    document.querySelector('.feedback-slides').style.transform = 'translateX(' + offset + ')';
  }

  setInterval(function() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }, 5000); // Change slide every 5 seconds (adjust as needed)
});


// script.js
document.addEventListener("DOMContentLoaded", function() {
  var skeletonScreen = document.getElementById("skeleton-screen");
  var content = document.getElementById("content");

  // Show skeleton screen initially
  skeletonScreen.classList.remove("hidden");

  // Delay showing actual content
  setTimeout(function() {
    // Hide skeleton screen and show content after 2 seconds
    skeletonScreen.classList.add("hidden");
    content.classList.remove("hidden");
  }, 2000); // 2000 milliseconds = 2 seconds
});


function toggleMenu() {
  var menu = document.getElementById('menu');
  menu.classList.toggle('open');
  }
  