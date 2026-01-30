 document.addEventListener("DOMContentLoaded", function () {

  const menuToggle = document.getElementById("menuToggle");
  const navList = document.getElementById("navList");

  menuToggle.addEventListener("click", () => {
    navList.classList.toggle("active");
    menuToggle.innerHTML = navList.classList.contains("active") ? "✖" : "☰";
  });

  document.querySelectorAll(".dropdown-toggle").forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      item.parentElement.classList.toggle("active");
    });
  });

});

// ===== LIVE NEWS FEED (Demo Placeholder) =====
async function loadLiveNews() {
  const feed = document.getElementById("liveFeed");
  if (!feed) return;
  feed.innerHTML = "<li>Fetching latest news...</li>";

  try {
    const res = await fetch("https://gnews.io");
    const data = await res.json();

    feed.innerHTML = "";
    data.articles.forEach(article => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
      feed.appendChild(li);
    });
  } catch (error) {
    feed.innerHTML = "<li>⚠️ Could not load live news. Please try again later.</li>";
  }
}
loadLiveNews();
setInterval(loadLiveNews, 60000);

// 🔢 Counter Animation (💡 Fixed)
const counters = document.querySelectorAll(".counter");
const speed = 150;

let counterStarted = false; // prevent re-run

function startCounter() {
  if (counterStarted) return;
  counterStarted = true;

  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute("data-target");
      const count = +counter.innerText;
      const increment = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 20);
      } else {
        counter.innerText = target.toLocaleString();
      }
    };
    updateCount();
  });
}

// Start counter only once when visible
const counterSection = document.querySelector(".stats-counter");
if (counterSection) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      startCounter();
      observer.unobserve(counterSection);
    }
  }, { threshold: 0.3 });
  observer.observe(counterSection);
}

// 🌟 Developer Contact Popup Script
const contactLink = document.getElementById("contactDevLink");
const popup = document.getElementById("devPopup");
const closePopup = document.getElementById("closePopup");

if (contactLink && popup && closePopup) {
  contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "flex";
  });

  closePopup.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === popup) popup.style.display = "none";
  });
}

// 🪧 Ads Scroll Behavior
document.addEventListener("DOMContentLoaded", function () {
  const adTrack = document.querySelector(".ad-track");
  if (!adTrack) return;

  let pauseTimeout;
  const pauseScroll = () => {
    adTrack.style.animationPlayState = "paused";
    clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => {
      adTrack.style.animationPlayState = "running";
    }, 2000);
  };

  adTrack.addEventListener("touchstart", pauseScroll);
  adTrack.addEventListener("mousedown", pauseScroll);

  adTrack.querySelectorAll("a").forEach(link => {
    link.addEventListener("touchend", (e) => {
      e.stopPropagation();
      window.open(link.href, "_blank");
    });
  });
});
const menu = document.querySelector('.nav-list');
  const btn = document.getElementById('menu-btn');

  btn.addEventListener('click', () => {
    menu.classList.toggle('active');
  });
  ////NAV JS ////
  // ✅ Mobile Dropdown Toggle
  document.getElementById("menuToggle").addEventListener("click", function (e) {
    e.stopPropagation();
    document.getElementById("navList").classList.toggle("active");
  });

  document.addEventListener("click", function (e) {
    const nav = document.getElementById("navList");
    const toggle = document.getElementById("menuToggle");

    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("active");
    }
  });
  
  //////toggle navbar////

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault();

  emailjs.sendForm(
    "SERVICE_ID",
    "TEMPLATE_ID",
    this
  ).then(
    function() {
      alert("Email sent successfully ✅");
    },
    function(error) {
      alert("Failed ❌ " + error.text);
    }
  );
});

/////dots/////
document.addEventListener("DOMContentLoaded", () => {

  const slides = document.querySelectorAll(".testimonial-slide");
  const dots = document.querySelectorAll(".dot");
  let index = 0;

  function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    slides[i].classList.add("active");
    dots[i].classList.add("active");
  }

  function autoSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  // First slide show
  showSlide(index);

  // Change slide every 4 seconds
  setInterval(autoSlide, 4000);

});

