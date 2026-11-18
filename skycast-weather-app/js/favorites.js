(() => {
  const KEY="skycast-favorites";
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}};
  const save=list=>localStorage.setItem(KEY,JSON.stringify(list));
  const add=place=>{const list=read();if(!list.some(p=>p.latitude===place.latitude&&p.longitude===place.longitude)){list.unshift(place);save(list.slice(0,8));return true}return false};
  const remove=index=>{const list=read();list.splice(index,1);save(list)};
  window.Favorites={read,add,remove};
})();
