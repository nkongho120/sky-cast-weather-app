(() => {
  const $=id=>document.getElementById(id);
  const state={place:null,data:null,air:null,prefs:{temp:localStorage.getItem("skycast-temp")||"celsius",wind:localStorage.getItem("skycast-wind")||"kmh"},recent:[]};
  const setStatus=(msg,error=false)=>{$("statusLine").textContent=msg;$("statusLine").classList.toggle("error-text",error)};
  const formatTemp=(v)=>ForecastUI.fmtTemp(v,state.prefs.temp);
  const formatWind=(v)=>ForecastUI.fmtWind(v,state.prefs.wind);
  const direction=deg=>{const dirs=["N","NE","E","SE","S","SW","W","NW"];return dirs[Math.round(deg/45)%8]};
  const uvText=v=>v<3?"Low":v<6?"Moderate":v<8?"High":v<11?"Very high":"Extreme";
  function renderAir(air){
    const c=air?.current;if(!c){$("aqiCategory").textContent="Unavailable";$("aqiAdvice").textContent="Air-quality data is unavailable for this location.";return}
    const a=c.european_aqi,levels=[[20,"Good","good"],[40,"Moderate","moderate"],[60,"Unhealthy for sensitive groups","poor"],[80,"Unhealthy","bad"],[100,"Very unhealthy","verybad"],[Infinity,"Hazardous","extreme"]];
    const level=levels.find(x=>a<=x[0])||levels[5];$("aqiValue").textContent=Number.isFinite(a)?Math.round(a):"—";$("aqiCategory").textContent=level[1];$("aqiCategory").dataset.level=level[2];
    $("aqiAdvice").textContent=a<=20?"Air quality is good. Enjoy outdoor activities.":a<=40?"Air quality is acceptable. Sensitive people may wish to take care.":a<=60?"Sensitive groups should reduce prolonged outdoor exertion.":a<=80?"Consider limiting outdoor activity, especially if sensitive.":"Reduce outdoor exertion and follow local health guidance.";
    [["pm25","pm2_5"],["pm10","pm10"],["co","carbon_monoxide"],["no2","nitrogen_dioxide"],["ozone","ozone"]].forEach(([id,key])=>$(id).textContent=c[key]==null?"—":Math.round(c[key]));
  }
  function render(data){
    const c=data.current,d=data.daily,code=WeatherAPI.describeCode(c.weather_code),p=state.place;
    $("placeName").textContent=p.name||"Selected location";$("placeMeta").textContent=[p.admin1,p.country].filter(Boolean).join(" · ")||p.country||"GPS location";
    $("currentIcon").textContent=code[1];$("currentTemp").textContent=formatTemp(c.temperature_2m);$("currentCondition").textContent=code[0];
    $("feelsLike").textContent=formatTemp(c.apparent_temperature);$("highLow").textContent=`${formatTemp(d.temperature_2m_max[0])} / ${formatTemp(d.temperature_2m_min[0])}`;
    $("sunrise").textContent=new Date(d.sunrise[0]).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});$("sunset").textContent=new Date(d.sunset[0]).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
    $("humidity").textContent=`${c.relative_humidity_2m}%`;$("wind").textContent=formatWind(c.wind_speed_10m);$("windDirection").textContent=`${direction(c.wind_direction_10m)} · ${Math.round(c.wind_direction_10m)}°`;
    $("pressure").textContent=`${Math.round(c.pressure_msl)} hPa`;
    const h=data.hourly,idx=Math.max(0,h.time.findIndex(t=>t>=c.time));$("visibility").textContent=h.visibility?.[idx]!=null?`${(h.visibility[idx]/1000).toFixed(1)} km`:"—";
    $("uv").textContent=h.uv_index?.[idx]?.toFixed(1)??"—";$("uvHint").textContent=h.uv_index?.[idx]!=null?uvText(h.uv_index[idx]):"Unavailable";
    $("clouds").textContent=`${c.cloud_cover}%`;$("dewPoint").textContent=h.dew_point_2m?.[idx]!=null?formatTemp(h.dew_point_2m[idx]):"—";
    $("localClock").textContent=`Local time ${new Date(c.time).toLocaleString([],{weekday:"short",hour:"numeric",minute:"2-digit"})}`;
    $("updatedAt").textContent=`Updated ${new Date(c.time).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}`;
    $("weatherSurface").dataset.weather=code[2];ForecastUI.renderForecast(data,state.prefs);
  }
  async function loadPlace(place){
    state.place=place;setStatus(`Loading weather for ${place.name||"selected location"}…`);$("weatherSurface").classList.add("loading");
    try{
      const data=await WeatherAPI.getWeather(place);
      if(!data.current||!data.hourly||!data.daily)throw new Error("The weather response was incomplete. Please try again.");
      state.data=data;render(data);
      try{state.air=await WeatherAPI.getAirQuality(place);renderAir(state.air)}catch{$("aqiCategory").textContent="Unavailable";$("aqiAdvice").textContent="Air-quality service is temporarily unavailable for this location.";["aqiValue","pm25","pm10","co","no2","ozone"].forEach(id=>$(id).textContent="—")}
      setStatus(`Weather loaded for ${place.name||"your location"}.`);
      const recent=JSON.parse(localStorage.getItem("skycast-recent")||"[]").filter(x=>x.latitude!==place.latitude||x.longitude!==place.longitude);recent.unshift(place);localStorage.setItem("skycast-recent",JSON.stringify(recent.slice(0,5)));
      renderFavorites();
    }catch(e){setStatus(e.message||"Unable to load weather. Check your connection and try again.",true)}
    finally{$("weatherSurface").classList.remove("loading")}
  }
  async function search(query){
    if(!query.trim())return;setStatus("Searching locations…");
    try{const results=await WeatherAPI.geocode(query);showSuggestions(results)}catch(e){setStatus(e.message,true);$("suggestions").hidden=true}
  }
  function showSuggestions(results){
    const box=$("suggestions");box.innerHTML="";
    results.forEach(place=>{const b=document.createElement("button");b.type="button";b.textContent=LocationTools.reverseLabel(place);b.addEventListener("click",()=>{box.hidden=true;$("cityInput").value="";loadPlace(place)});box.append(b)});
    box.hidden=false;
  }
  function renderFavorites(){
    const list=Favorites.read(),box=$("favoritesList");box.innerHTML="";
    if(!list.length){box.innerHTML='<p class="muted small">Your saved places will appear here.</p>';return}
    list.forEach((p,i)=>{const row=document.createElement("div");row.className="favorite-item";const open=document.createElement("button");open.textContent=`${p.name} · ${p.country||""}`;open.addEventListener("click",()=>loadPlace(p));const remove=document.createElement("button");remove.className="remove";remove.textContent="×";remove.setAttribute("aria-label",`Remove ${p.name}`);remove.addEventListener("click",()=>{Favorites.remove(i);renderFavorites()});row.append(open,remove);box.append(row)});
  }
  function applyPrefs(){
    $("tempUnit").value=state.prefs.temp;$("windUnit").value=state.prefs.wind;
    const theme=localStorage.getItem("skycast-theme")||"dark";document.documentElement.dataset.theme=theme;$("themeSelect").value=theme;
    if(state.data)render(state.data);
  }
  $("searchForm").addEventListener("submit",e=>{e.preventDefault();search($("cityInput").value)});
  $("cityInput").addEventListener("input",()=>{clearTimeout(window.skycastSearchTimer);const q=$("cityInput").value.trim();if(q.length>=3)window.skycastSearchTimer=setTimeout(()=>search(q),350);else $("suggestions").hidden=true});
  document.addEventListener("click",e=>{if(!e.target.closest(".search-panel"))$("suggestions").hidden=true});
  $("useLocation").addEventListener("click",async()=>{setStatus("Requesting location permission…");try{const p=await LocationTools.requestCurrentPosition();await loadPlace(p)}catch(e){setStatus(e.message,true)}});
  $("saveFavorite").addEventListener("click",()=>{if(!state.place){setStatus("Search for a city before saving it.",true);return}setStatus(Favorites.add(state.place)?"Location saved to your favourites.":"This location is already saved.");renderFavorites()});
  document.querySelectorAll("[data-city]").forEach(b=>b.addEventListener("click",()=>{search(b.dataset.city)}));
  $("tempUnit").addEventListener("change",e=>{state.prefs.temp=e.target.value;localStorage.setItem("skycast-temp",state.prefs.temp);if(state.data)render(state.data)});
  $("windUnit").addEventListener("change",e=>{state.prefs.wind=e.target.value;localStorage.setItem("skycast-wind",state.prefs.wind);if(state.data)render(state.data)});
  function setTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem("skycast-theme",t);$("themeSelect").value=t}
  $("themeToggle").addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
  $("themeSelect").addEventListener("change",e=>setTheme(e.target.value));
  $("locationMode").addEventListener("change",e=>{if(e.target.value==="auto")$("useLocation").click()});
  $("menuToggle").addEventListener("click",()=>{const open=$("navLinks").classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",String(open));$("menuToggle").setAttribute("aria-label",open?"Close navigation":"Open navigation")});
  document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>{$("navLinks").classList.remove("open");$("menuToggle").setAttribute("aria-expanded","false")}));
  const sections=[...document.querySelectorAll("main section[id]")];if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll(".nav-links a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${entry.target.id}`))}}),{rootMargin:"-25% 0px -65% 0px"});sections.forEach(s=>observer.observe(s))}
  $("year").textContent=new Date().getFullYear();applyPrefs();renderFavorites();
  // Start with a known, public city; this does not access or infer the visitor's location.
  loadPlace({name:"Buea",country:"Cameroon",latitude:4.1534,longitude:9.241});
})();
