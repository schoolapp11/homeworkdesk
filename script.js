
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

var colors = ['rgb(18, 21, 34)', 'rgb(16, 24, 60)', 'rgb(18, 21, 34)', 'rgb(8, 24, 93)', 'rgb(18, 21, 34)', 'rgb(6, 34, 159)'];
var currentIndex = 0;

function changeColor() {
var container = document.getElementById("myContainer");
// Get the color from the current index
var currentColor = colors[currentIndex];
// Set the background color of the container
container.style.backgroundColor = currentColor;
// Increment the index, and reset it to 0 if it exceeds the length of the array
currentIndex = (currentIndex + 1) % colors.length;
}

// Change the color every second
setInterval(changeColor, 1500);

var revealedTabs = {};

function revealTabContent(tabId, contentId) {
var tab = document.getElementById(tabId);
var tabContent = document.getElementById(contentId);

// Check if the tab content is already fully revealed
if (revealedTabs[contentId]) {
return; // If already revealed, do nothing
}

// Check if the tab content is in the viewport
var tabRect = tabContent.getBoundingClientRect();
var tabInView = tabRect.top < window.innerHeight && tabRect.bottom >= 0;

if (tabInView) {
// Reveal tab content gradually when it comes into view
var text = tabContent.innerText;
var index = 0;

// Use setInterval to mimic typing effect
var interval = setInterval(function() {
  tabContent.textContent = text.slice(0, index);
  index++;
  
  // Clear the interval when the text is fully revealed
  if (index > text.length) {
    clearInterval(interval);
    // Set the flag to indicate that the tab content has been fully revealed
    revealedTabs[contentId] = true;
  }
}, 100); // Adjust typing speed (milliseconds per character)

// Ensure the tab content is fully visible when typing effect starts
tabContent.style.opacity = '1';
}
}

window.addEventListener('scroll', function() {
// Call revealTabContent for each tab
revealTabContent('myTab1', 'tabContent1');
revealTabContent('myTab2', 'tabContent2');
});

function toggleMenu() {
var menu = document.getElementById('menu');
menu.classList.toggle('open');
}

function loadSignUpPage() {
// Fetch the sign up page content
fetch('signup.html')
.then(response => response.text())
.then(html => {
  // Replace the content of the 'content' div with the sign up page content
  document.getElementById('content').innerHTML = html;
})
.catch(error => {
  console.error('Error fetching sign up page:', error);
});
}
