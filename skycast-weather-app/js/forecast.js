(() => {
  const byId = id => document.getElementById(id);
  const fmtTemp = (value, unit) => `${Math.round(unit==="fahrenheit" ? value*9/5+32 : value)}°`;
  const fmtWind = (value, unit) => `${Math.round(unit==="mph" ? value*0.621371 : value)} ${unit==="mph"?"mph":"km/h"}`;
  const renderForecast = (data, prefs) => {
    const h=data.hourly, d=data.daily, now=data.current.time;
    const start=Math.max(0,h.time.findIndex(t=>t>=now));
    byId("hourlyTrack").innerHTML="";
    for(let i=start;i<Math.min(start+24,h.time.length);i++){
      const [desc,icon]=WeatherAPI.describeCode(h.weather_code[i]);
      const date=new Date(h.time[i]);
      const card=document.createElement("article");card.className="hour-card"+(i===start?" current":"");
      card.innerHTML=`<span>${i===start?"Now":date.toLocaleTimeString([],{hour:"numeric"})}</span><div class="hour-icon" aria-hidden="true">${icon}</div><strong>${fmtTemp(h.temperature_2m[i],prefs.temp)}</strong><small>☂ ${h.precipitation_probability?.[i]??"—"}%</small><small>➤ ${fmtWind(h.wind_speed_10m[i],prefs.wind)}</small>`;
      card.title=desc;byId("hourlyTrack").append(card);
    }
    byId("dailyGrid").innerHTML="";
    for(let i=0;i<Math.min(7,d.time.length);i++){
      const [desc,icon]=WeatherAPI.describeCode(d.weather_code[i]);
      const date=new Date(`${d.time[i]}T12:00:00`);
      const card=document.createElement("article");card.className="day-card"+(i===0?" today":"");
      card.innerHTML=`<div class="day-name">${i===0?"Today":date.toLocaleDateString([],{weekday:"short"})}</div><span class="day-date">${date.toLocaleDateString([],{month:"short",day:"numeric"})}</span><div class="day-icon" aria-hidden="true">${icon}</div><div class="day-desc">${desc}</div><strong>${fmtTemp(d.temperature_2m_max[i],prefs.temp)} <span class="muted">${fmtTemp(d.temperature_2m_min[i],prefs.temp)}</span></strong><small>☂ ${d.precipitation_probability_max?.[i]??"—"}% rain</small>`;
      byId("dailyGrid").append(card);
    }
  };
  window.ForecastUI={renderForecast,fmtTemp,fmtWind};
})();
