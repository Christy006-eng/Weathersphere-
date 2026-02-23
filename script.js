const API_KEY = "da287b27ab2c62083846949656a915d4";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const weatherContainer = document.getElementById("weatherContainer");
const themeToggle = document.getElementById("themeToggle");
const locationButtons = document.querySelectorAll(".location-btn");

const weatherSettings = {
  Clear: { icon:"☀️" }, Clouds:{icon:"☁️"}, Rain:{icon:"🌧️"},
  Snow:{icon:"❄️"}, Thunderstorm:{icon:"⚡"}, Mist:{icon:"🌫️"}
};

async function getWeather(location){
  try{
    weatherContainer.innerHTML=`<p class="loading">Loading...</p>`;
    const currentResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`);
    const currentData = await currentResp.json();
    if(currentData.cod!==200){ weatherContainer.innerHTML=`<p class="error-message">⚠️ Location not found!</p>`; return; }

    const forecastResp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`);
    const forecastData = await forecastResp.json();

    displayWeather(currentData,forecastData);
  }catch{ weatherContainer.innerHTML=`<p class="error-message">❌ Error fetching weather data</p>`; }
}

function displayWeather(currentData,forecastData){
  const condition=currentData.weather[0].main;
  const weatherIcon=weatherSettings[condition]?.icon||"🌡️";

  let html=`
  <div class="current-weather">
    <h2>${currentData.name}, ${currentData.sys.country}</h2>
    <p><strong>🌡 Temp:</strong> ${currentData.main.temp}°C</p>
    <p><strong>${condition}:</strong> ${currentData.weather[0].description}</p>
    <p><strong>💧 Humidity:</strong> ${currentData.main.humidity}%</p>
    <p><strong>💨 Wind:</strong> ${currentData.wind.speed} m/s</p>
    <p class="forecast-icon">${weatherIcon}</p>
  </div>
  <h3>5-Day Forecast</h3>
  <div class="forecast-container-vertical">
  `;

  const forecastByDate={};
  forecastData.list.forEach(item=>{
    const date=item.dt_txt.split(" ")[0];
    if(!forecastByDate[date]) forecastByDate[date]=[];
    forecastByDate[date].push(item);
  });

  Object.keys(forecastByDate).slice(0,5).forEach(date=>{
    const dayData=forecastByDate[date];
    const tempAvg=(dayData.reduce((sum,d)=>sum+d.main.temp,0)/dayData.length).toFixed(1);
    const weatherMain=dayData[0].weather[0].main;
    const icon=weatherSettings[weatherMain]?.icon||"🌡️";
    const dateStr=new Date(date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
    html+=`
    <div class="forecast-card-vertical">
      <p class="forecast-date">${dateStr}</p>
      <p class="forecast-temp">🌡 ${tempAvg}°C</p>
      <p class="forecast-condition">${weatherMain}</p>
      <p class="forecast-icon">${icon}</p>
    </div>
    `;
  });

  html+=`</div>`;
  weatherContainer.innerHTML=html;
}

// Search
searchBtn.addEventListener("click",()=>{ const loc=searchInput.value.trim(); if(loc)getWeather(loc); });

// Default city buttons
locationButtons.forEach(btn=>{ btn.addEventListener("click",()=>{ getWeather(btn.getAttribute("data-location")); }); });

// Dark mode toggle
themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent=document.body.classList.contains("dark-mode")?"Day Theme":"Night Theme";
});

// Default location load
window.addEventListener("load",()=>{
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude,longitude}=pos.coords;
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`)
      .then(res=>res.json())
      .then(data=>getWeather(data.name))
      .catch(()=>getWeather("Delhi"));
    },()=>getWeather("Delhi"));
  } else getWeather("Delhi");
});
