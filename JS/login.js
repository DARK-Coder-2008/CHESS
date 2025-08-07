function toggleForms() { 
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const guestSection = document.getElementById('guestSection');
  const formTitle = document.getElementById('formTitle');
  const switchText = document.querySelector('.switch-form');

  const isLogin = loginForm.style.display !== "none";

  if (isLogin) {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    guestSection.style.display = "none";
    formTitle.innerText = "Sign Up";
    switchText.innerText = "Already have an account? Login";
  } else {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    guestSection.style.display = "block";
    formTitle.innerText = "Login";
    switchText.innerText = "Don’t have an account? Sign up";
  }
}

function continueAsGuest() {
  const guestName = document.getElementById("guestName").value.trim();
  if (guestName === "") {
    alert("Please enter your name to continue as Guest.");
    return;
  }
  localStorage.setItem("guest", "true");
  localStorage.setItem("playerName", guestName);
  window.open("loading.html");
}

function loginUser(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (username && password) {
    localStorage.setItem("guest", "false");
    localStorage.setItem("playerName", username);
    window.open("Loading.html", "_blank");
  } else {
    alert("Please enter both username and password.");
  }

  return false;
}

function signUpUser(event) {
  event.preventDefault();
  const fullName = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  if (!emailPattern.test(email)) {
    document.getElementById("emailError").style.display = "block";
    return false;
  } else {
    document.getElementById("emailError").style.display = "none";
  }

  if (fullName && email && password) {
    localStorage.setItem("guest", "false");
    localStorage.setItem("playerName", fullName);
    window.open("Loading.html", "_blank");
  } else {
    alert("Please fill all signup fields.");
  }

  return false;
}

function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈";
  } else {
    input.type = "password";
    icon.textContent = "👁️";
  }
}

document.getElementById("email").addEventListener("input", function () {
  const email = this.value.trim();
  const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  const error = document.getElementById("emailError");

  if (!pattern.test(email)) {
    error.style.display = "block";
  } else {
    error.style.display = "none";
  }
});

let volumeOn = true;

const bgMusic = document.getElementById('bgMusic');
const volumeBtn = document.querySelector('.volumeToggle');
let isMuted = false;

// Auto-play background music after user interaction
window.addEventListener('click', () => {
  if (!bgMusic.paused) return;
  bgMusic.play().catch(() => {}); // catch required for autoplay restrictions
}, { once: true });

function toggleVolume() {
  isMuted = !isMuted;
  if (isMuted) {
    bgMusic.pause();
    volumeBtn.textContent = '🔇';
  } else {
    bgMusic.play();
    volumeBtn.textContent = '🔊';
  }
}
