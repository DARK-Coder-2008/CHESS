  let isMuted = false;
  let isLogin = true;
  

  function playSound() {
    const sound = document.getElementById("welcomeSound");
    if (!isMuted) {
      sound.play().catch((e) => console.log("Autoplay blocked:", e));
    }
  }
// Get guest data
const isGuest = localStorage.getItem("guest");
const guestName = localStorage.getItem("guestName");

if (isGuest === "true" && guestName) {
  document.getElementById("welcomeMessage").innerText = `Welcome, ${guestName}!`;
}

// Get volume elements
const volumeBtn = document.getElementById('volumeBtn');
const bgMusic = document.getElementById('bgMusic');

// Fade-in audio function
function fadeInAudio(audio, targetVolume = 0.5, duration = 2000) {
  let step = targetVolume / (duration / 100);
  audio.volume = 0;
  let interval = setInterval(() => {
    if (audio.volume < targetVolume) {
      audio.volume = Math.min(audio.volume + step, targetVolume);
    } else {
      clearInterval(interval);
    }
  }, 100);
}

  window.addEventListener('load', function () {
    const music = document.getElementById('bgMusic');
    music.volume = 0.2; // Optional: Volume control
    music.play().catch((err) => {
      console.log('Autoplay blocked. Waiting for user interaction...');
    });
  });


// Start music with fade-in on first click
window.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play().catch(err => console.log('Autoplay error:', err));
    fadeInAudio(bgMusic);
  }
}, { once: true });

// Mute/Unmute toggle
volumeBtn.addEventListener('click', () => {
  bgMusic.muted = !bgMusic.muted;
  volumeBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
});


  function toggleSound() {
    const sound = document.getElementById("welcomeSound");
    const btn = document.getElementById("volumeToggle");
    isMuted = !isMuted;
    btn.textContent = isMuted ? "🔇" : "🔊";
    isMuted ? sound.pause() : sound.play().catch((e) => console.log("Autoplay blocked:", e));
  }

  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    document.getElementById("darkModeToggle").textContent =
      document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
  }

  function toggleForms() {
    isLogin = !isLogin;

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    loginForm.classList.toggle("hide", !isLogin);
    signupForm.classList.toggle("hide", isLogin);

    document.getElementById("formTitle").textContent = isLogin ? "Login" : "Sign Up";
    document.querySelector(".switch-form").textContent = isLogin
      ? "Don’t have an account? Sign up"
      : "Already have an account? Login";
  }

  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    if (username && password) {
      alert("Login successful!");
      window.location.href = "/Html/chess.html";
    } else {
      alert("Please enter valid login details.");
    }
  });

  document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    let hasError = false;

    // Name validation
    if (!name) {
      hasError = true;
      alert("Name is required.");
    }

    // Phone validation
    if (!/^\d{10}$/.test(phone)) {
      hasError = true;
      document.getElementById("phoneError").style.display = "block";
    } else {
      document.getElementById("phoneError").style.display = "none";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      hasError = true;
      document.getElementById("emailError").style.display = "block";
    } else {
      document.getElementById("emailError").style.display = "none";
    }

    // Password validation
    if (password.length < 6) {
      hasError = true;
      document.getElementById("passError").style.display = "block";
    } else {
      document.getElementById("passError").style.display = "none";
    }

    if (!hasError) {
      const userData = { name, phone, email, password };
      localStorage.setItem("chessUser", JSON.stringify(userData));
      alert("Signup successful!");
      toggleForms(); // switch to login
    }
  });

  // Social login placeholder alerts
  document.getElementById("googleBtn").onclick = () => alert("Google login clicked!");
  document.getElementById("facebookBtn").onclick = () => alert("Facebook login clicked!");
  document.getElementById("instaBtn").onclick = () => alert("Instagram login clicked!");

function toggleForms() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const formTitle = document.getElementById("formTitle");
    const switchText = document.querySelector(".switch-form");

    if (loginForm.style.display !== "none") {
        // Switch to Sign Up
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        formTitle.textContent = "Sign Up";
        switchText.textContent = "Already have an account? Login";
    } else {
        // Switch to Login
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        formTitle.textContent = "Login";
        switchText.textContent = "Don’t have an account? Sign up";
    }
}
function toggleForms() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const formTitle = document.getElementById("formTitle");
    const switchText = document.querySelector(".switch-form");

    if (loginForm.style.display !== "none") {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        formTitle.textContent = "Sign Up";
        switchText.textContent = "Already have an account? Login";
    } else {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        formTitle.textContent = "Login";
        switchText.textContent = "Don’t have an account? Sign up";
    }
}
