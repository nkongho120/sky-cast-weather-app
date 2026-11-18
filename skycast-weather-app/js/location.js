(() => {
  const reverseLabel = p => [p.name,p.admin1,p.country].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(", ");
  const requestCurrentPosition = () => new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error("Geolocation is not supported by this browser."));return;}
    navigator.geolocation.getCurrentPosition(pos=>resolve({name:"My location",latitude:pos.coords.latitude,longitude:pos.coords.longitude,country:"GPS"}),err=>{
      const message=err.code===1?"Location permission was denied. You can search for a city instead.":err.code===2?"Your location could not be determined. Try searching for a city.":"Location request timed out. Please try again.";
      reject(new Error(message));
    },{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
  });
  window.LocationTools={reverseLabel,requestCurrentPosition};
})();
