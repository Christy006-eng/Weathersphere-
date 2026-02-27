const API_KEY = "da287b27ab2c62083846949656a915d4"; // Replace with your key

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const homeSection = document.getElementById("homeSection");

const weatherSettings = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
  Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️"
};

async function getWeather(city){
  try{
    homeSection.innerHTML = `<p class="loading">Loading...</p>`;

    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const current = await currentRes.json();
    if(current.cod !== 200){ homeSection.innerHTML = `<p>City not found</p>`; return; }

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const forecast = await forecastRes.json();

    const aqiRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`
    );
    const aqiData = await aqiRes.json();

    renderData(current, forecast, aqiData);

  } catch{
    homeSection.innerHTML = `<p>API Error</p>`;
  }
}

function renderData(current, forecast, aqiData){
  const icon = weatherSettings[current.weather[0].main] || "🌡️";
  const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString();
  const feelsLike = current.main.feels_like;

  const hourlyData = forecast.list.slice(0,8);
  const tomorrowData = forecast.list.slice(8,16);
  let tomorrowAvg = (tomorrowData.reduce((s,d)=>s+d.main.temp,0)/tomorrowData.length).toFixed(1);
  let tomorrowMain = tomorrowData[0].weather[0].main;

  /* AQI */
  const aqiIndex = aqiData.list[0].main.aqi;
  const aqiLevels = {
    1: { text:"Good", color:"#4CAF50", remedy:"Air is clean. Enjoy outdoor activities 🌿" },
    2: { text:"Fair", color:"#8BC34A", remedy:"Sensitive people avoid long exposure." },
    3: { text:"Moderate", color:"#FFC107", remedy:"Wear mask if outside for long time." },
    4: { text:"Poor", color:"#FF5722", remedy:"Avoid outdoor exercise." },
    5: { text:"Very Poor", color:"#F44336", remedy:"Stay indoors. Use N95 mask." }
  };
  const aqiInfo = aqiLevels[aqiIndex];

  /* 5-Day Forecast */
  let fiveDayHTML = "";
  for(let i=0; i<forecast.list.length; i+=8){
    const day = forecast.list[i];
    const date = new Date(day.dt_txt).toDateString();
    const temp = day.main.temp;
    const main = day.weather[0].main;
    const icon = weatherSettings[main] || "🌡️";
    fiveDayHTML += `<div class="day-card"><p>${date}</p><p>${icon}</p><p>${temp}°C</p></div>`;
  }

  homeSection.innerHTML = `
  <div class="swipe-container">
    <div class="swipe-slider" id="swipeSlider">

      <!-- TODAY -->
      <div class="swipe-slide">
        <div class="current-weather">
          <h2>${current.name}, ${current.sys.country}</h2>
          <h1>${current.main.temp}°C</h1>
          <p>${icon} ${current.weather[0].description}</p>
          <p>🔥 Feels Like: ${feelsLike}°C</p>
          <p>💧 ${current.main.humidity}% | 💨 ${current.wind.speed} m/s</p>
          <p>🌅 Sunrise: ${sunrise}</p>
          <p>🌇 Sunset: ${sunset}</p>
        </div>

        <div class="aqi-card" style="background:${aqiInfo.color};">
          <h3>AQI: ${aqiIndex} - ${aqiInfo.text}</h3>
        </div>

        <div class="remedy-card">
          <p>${aqiInfo.remedy}</p>
        </div>

        <h3>Hourly Forecast</h3>
        <div class="hourly-slider">
          ${hourlyData.map(hour=>{
            const time = new Date(hour.dt_txt).getHours();
            const temp = hour.main.temp;
            const main = hour.weather[0].main;
            const icon = weatherSettings[main] || "🌡️";
            return `<div class="hour-card"><p>${time}:00</p><p>${icon}</p><p>${temp}°C</p></div>`;
          }).join("")}
        </div>
      </div>

      <!-- TOMORROW -->
      <div class="swipe-slide">
        <div class="current-weather">
          <h2>Tomorrow</h2>
          <h1>${tomorrowAvg}°C</h1>
          <p>${weatherSettings[tomorrowMain]} ${tomorrowMain}</p>
        </div>
      </div>

      <!-- 5 DAYS -->
      <div class="swipe-slide">
        <h2>5-Day Forecast</h2>
        <div class="five-day-container">${fiveDayHTML}</div>
      </div>

    </div>
  </div>
  `;

  initSwipe();
}

/* Swipe */
function initSwipe(){
  const slider = document.getElementById("swipeSlider");
  let startX = 0, currentIndex = 0;
  slider.addEventListener("touchstart", e=>{ startX = e.touches[0].clientX; });
  slider.addEventListener("touchend", e=>{
    let endX = e.changedTouches[0].clientX;
    if(startX - endX > 50 && currentIndex < 2) currentIndex++;
    if(endX - startX > 50 && currentIndex > 0) currentIndex--;
    slider.style.transform = `translateX(-${currentIndex*100}%)`;
  });
}

/* Search & Theme Toggle */
searchBtn.addEventListener("click", ()=>{ if(searchInput.value.trim()) getWeather(searchInput.value.trim()); });
themeToggle.addEventListener("click", ()=>{ document.body.classList.toggle("dark-mode"); });

window.addEventListener("load", ()=>{ getWeather("Delhi"); });
