document.getElementById("searchBtn").addEventListener("click", getData);
document.getElementById("textBox").addEventListener("keypress", (e) => {
  if (e.key === "Enter") getData(e);
});

async function getData(e) {
  const textBox = document.getElementById("textBox");
  const city = textBox.value.trim();

  if (city === "") {
    alert("please enter valid city Name");
    return;
  }

  const btn = document.getElementById("searchBtn");
  btn.innerText = "Loading...";
  btn.disabled = true;

  const API = `http://api.weatherapi.com/v1/forecast.json?key=4857f013486a4a04aef45829263101&q=${city}&days=7`;

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("City not found or API issue");

    const data = await res.json();

    // Clear old content
    document.getElementById("currentDetailsRef").innerHTML = "";
    document.getElementById("hourlyContainer").innerHTML = "";

    // Remove old fixed 7-day panel if exists
    const oldPanel = document.querySelector('div[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
    if (oldPanel) oldPanel.remove();

    currentDetails(data);
    hourlyDetails(data);
    sevenDayTopRight(data);

  } catch (err) {
    alert("enter proper city Name\n" + err.message);
    console.error(err);
  } finally {
    btn.innerText = "Search";
    btn.disabled = false;
    textBox.value = "";
  }
}

function currentDetails(data) {
  const html = `
    <div class="col-6">
      <h1>${data.location.name}</h1>
      <h5>${data.current.condition.text}</h5>
      <h1>${Math.round(data.current.temp_c)}<sup>°C</sup></h1>
    </div>
    <div class="col-6">
      <img src="${data.current.condition.icon}" alt="">
    </div>
  `;
  document.getElementById("currentDetailsRef").innerHTML = html;
}

function hourlyDetails(data) {
  let html = `
    <h4>Hourly Forecast</h4>
    <div class="hourly-scroll">
  `;

  const now = new Date();
  const hours = data.forecast.forecastday[0].hour;

  hours.forEach(h => {
    const hourTime = new Date(h.time);
    if (hourTime < now) return;

    const timeStr = hourTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    html += `
      <div class="hour-card">
        <div>${timeStr}</div>
        <img src="${h.condition.icon}" alt="">
        <strong>${Math.round(h.temp_c)}°</strong>
        <small>${h.chance_of_rain}% rain</small>
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById("hourlyContainer").innerHTML = html;
}

function sevenDayTopRight(data) {
  let html = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      background: rgba(30,41,59,0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 16px;
      color: white;
      z-index: 1000;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      border: 1px solid #334155;
    ">
      <h5 style="margin:0 0 12px; text-align:center; color:#93c5fd;">7-DAY FORECAST</h5>
  `;

  data.forecast.forecastday.forEach(day => {
    const d = new Date(day.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    html += `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #334155;
      ">
        <div style="flex:1;">
          <strong>${dayName}</strong><br>
          <small style="color:#94a3b8;">${d.getDate()} ${d.toLocaleString('en-US',{month:'short'})}</small>
        </div>
        <img src="${day.day.condition.icon}" alt="" style="width:44px; height:44px;">
        <div style="text-align:right; min-width:90px;">
          <span style="color:#fbbf24; font-weight:bold;">${Math.round(day.day.maxtemp_c)}°</span> /
          <span style="color:#93c5fd;">${Math.round(day.day.mintemp_c)}°</span>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  document.body.insertAdjacentHTML('beforeend', html);
}