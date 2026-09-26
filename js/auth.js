function users(){return JSON.parse(localStorage.getItem('perfectHomeUsers')||'[]')}
function showAuth(type){document.getElementById('loginTab').classList.toggle('active',type==='login');document.getElementById('signupTab').classList.toggle('active',type==='signup');document.getElementById('loginForm').classList.toggle('hidden',type!=='login');document.getElementById('signupForm').classList.toggle('hidden',type!=='signup');document.getElementById('authMessage').innerHTML=''}
function msg(text,good=false){document.getElementById('authMessage').innerHTML=`<div class="auth-message ${good?'good':''}">${text}</div>`}
function signup(e){e.preventDefault();const name=document.getElementById('signupName').value.trim(),email=document.getElementById('signupEmail').value.trim().toLowerCase(),phone=document.getElementById('signupPhone').value.trim(),pass=document.getElementById('signupPassword').value,confirm=document.getElementById('signupConfirm').value;let u=users();if(u.some(x=>x.email===email)){msg('An account with this email already exists. Please sign in.');return}if(pass!==confirm){msg('Passwords do not match.');return}u.push({name,email,phone,password:pass});localStorage.setItem('perfectHomeUsers',JSON.stringify(u));localStorage.setItem('perfectHomeCurrentUser',JSON.stringify({name,email,phone}));showAccount();toast('Account created successfully ✓')}
function login(e){e.preventDefault();const email=document.getElementById('loginEmail').value.trim().toLowerCase(),pass=document.getElementById('loginPassword').value;const u=users().find(x=>x.email===email&&x.password===pass);if(!u){msg('Incorrect email or password. Please try again.');return}localStorage.setItem('perfectHomeCurrentUser',JSON.stringify({name:u.name,email:u.email,phone:u.phone}));showAccount();toast('Welcome back, '+u.name.split(' ')[0]+' ✓')}

function getAddresses(){return JSON.parse(localStorage.getItem('perfectHomeAddresses')||'{}')}
function saveAddresses(all){localStorage.setItem('perfectHomeAddresses',JSON.stringify(all))}
function currentAddresses(){const user=JSON.parse(localStorage.getItem('perfectHomeCurrentUser')||'null');if(!user)return{};const all=getAddresses();return all[user.email]||{}}
function addressLabel(type){return type==='home'?'Home Address':'Office Address'}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

const locationData={
  India:{
    Maharashtra:['Mumbai','Pune','Ahilyanagar','Nashik','Nagpur','Kolhapur','Aurangabad'],
    Karnataka:['Bengaluru','Mysuru','Mangaluru','Hubballi'],
    Gujarat:['Ahmedabad','Surat','Vadodara','Rajkot'],
    Delhi:['New Delhi'],
    Telangana:['Hyderabad'],
    TamilNadu:['Chennai','Coimbatore','Madurai'],
    Kerala:['Kochi','Thiruvananthapuram','Kozhikode'],
    Rajasthan:['Jaipur','Jodhpur','Udaipur'],
    UttarPradesh:['Lucknow','Kanpur','Agra','Noida']
  },
  'United Arab Emirates':{Dubai:['Dubai'],AbuDhabi:['Abu Dhabi'],Sharjah:['Sharjah']},
  'United States':{'New York':['New York'],California:['Los Angeles','San Francisco'],Texas:['Houston','Dallas']},
  'United Kingdom':{England:['London','Manchester'],Scotland:['Edinburgh','Glasgow']}
};

function populateStates(selectedCountry='India',selectedState=''){
  const state=document.getElementById('addressState');if(!state)return;
  const data=locationData[selectedCountry]||{};
  state.innerHTML='<option value="">Select state</option>'+Object.keys(data).map(s=>`<option value="${escapeHtml(s)}" ${s===selectedState?'selected':''}>${escapeHtml(s.replace(/([a-z])([A-Z])/g,'$1 $2'))}</option>`).join('');
  populateCities(selectedCountry,selectedState,'');
}
function populateCities(country,stateName,selectedCity=''){
  const city=document.getElementById('addressCity');if(!city)return;
  const cities=(locationData[country]||{})[stateName]||[];
  city.innerHTML='<option value="">Select city</option>'+cities.map(c=>`<option value="${escapeHtml(c)}" ${c===selectedCity?'selected':''}>${escapeHtml(c)}</option>`).join('');
}
function addressForm(type='',address={}){
  const existing=type?currentAddresses()[type]:{};
  const a={...existing,...address};
  return `<div class="address-form-wrap" id="addressFormWrap">
    <div class="address-form-head"><div><p class="eyebrow">${type?'EDIT ADDRESS':'NEW ADDRESS'}</p><h3>${type?addressLabel(type):'Save an address'}</h3></div><button type="button" class="address-close" onclick="closeAddressForm()">×</button></div>
    <form class="address-form" onsubmit="saveAddress(event)">
      <input type="hidden" id="addressType" value="${escapeHtml(type)}">
      <label>Address type<select id="addressTypeSelect" onchange="changeAddressType()" ${type?'disabled':''}><option value="home" ${type==='home'?'selected':''}>Home Address</option><option value="office" ${type==='office'?'selected':''}>Office Address</option></select></label>
      <div class="address-grid">
        <label>Name<input id="addressName" value="${escapeHtml(a.name||'')}" required placeholder="Full name"></label>
        <label>Mobile number<input id="addressMobile" value="${escapeHtml(a.mobile||'')}" required pattern="[0-9]{10}" maxlength="10" placeholder="10-digit mobile number"></label>
        <label>Email ID<input id="addressEmail" type="email" value="${escapeHtml(a.email||'')}" required placeholder="you@example.com"></label>
        <label>Street name<input id="addressStreet" value="${escapeHtml(a.street||'')}" required placeholder="House / street name"></label>
        <label>Village name<input id="addressVillage" value="${escapeHtml(a.village||'')}" required placeholder="Village / locality"></label>
        <label>Pincode<input id="addressPincode" value="${escapeHtml(a.pincode||'')}" required pattern="[0-9]{6}" maxlength="6" placeholder="6-digit pincode"></label>
        <label>Country<select id="addressCountry" required onchange="populateStates(this.value)">${Object.keys(locationData).map(c=>`<option value="${escapeHtml(c)}" ${c===(a.country||'India')?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></label>
        <label>State<select id="addressState" required onchange="populateCities(document.getElementById('addressCountry').value,this.value)"><option value="">Select state</option></select></label>
        <label>City<select id="addressCity" required><option value="">Select city</option></select></label>
      </div>
      <div class="address-actions"><button type="button" class="btn address-cancel" onclick="closeAddressForm()">Cancel</button><button class="btn primary">Save ${type?addressLabel(type):'Address'}</button></div>
    </form>
  </div>`;
}
function openAddressForm(type=''){const panel=document.getElementById('addressFormPanel');panel.innerHTML=addressForm(type);panel.classList.remove('hidden');const a=type?currentAddresses()[type]||{}:{};const country=a.country||'India';populateStates(country,a.state||'');if(a.city)populateCities(country,a.state||'',a.city);panel.scrollIntoView({behavior:'smooth',block:'nearest'})}
function changeAddressType(){const type=document.getElementById('addressTypeSelect').value;openAddressForm(type)}
function closeAddressForm(){const panel=document.getElementById('addressFormPanel');panel.innerHTML='';panel.classList.add('hidden')}
function saveAddress(e){e.preventDefault();const type=document.getElementById('addressType').value||document.getElementById('addressTypeSelect').value;const user=JSON.parse(localStorage.getItem('perfectHomeCurrentUser')||'null');if(!user)return;const all=getAddresses();all[user.email]=all[user.email]||{};all[user.email][type]={name:document.getElementById('addressName').value.trim(),mobile:document.getElementById('addressMobile').value.trim(),email:document.getElementById('addressEmail').value.trim().toLowerCase(),street:document.getElementById('addressStreet').value.trim(),village:document.getElementById('addressVillage').value.trim(),pincode:document.getElementById('addressPincode').value.trim(),city:document.getElementById('addressCity').value,state:document.getElementById('addressState').value,country:document.getElementById('addressCountry').value};saveAddresses(all);closeAddressForm();renderAddresses();toast(addressLabel(type)+' saved ✓')}
function deleteAddress(type){if(!confirm(`Delete your ${addressLabel(type).toLowerCase()}?`))return;const user=JSON.parse(localStorage.getItem('perfectHomeCurrentUser')||'null');if(!user)return;const all=getAddresses();if(all[user.email]){delete all[user.email][type];saveAddresses(all)}renderAddresses();toast(addressLabel(type)+' deleted')}
function renderAddresses(){const panel=document.getElementById('addressList');if(!panel)return;const addresses=currentAddresses();panel.innerHTML=['home','office'].map(type=>{const a=addresses[type];if(!a)return `<div class="address-empty"><div><span>${type==='home'?'⌂':'▣'}</span><b>${addressLabel(type)}</b><small>No address saved yet</small></div><button class="btn address-add" onclick="openAddressForm('${type}')">+ Add address</button></div>`;return `<div class="saved-address"><div class="saved-address-top"><div><span class="address-icon">${type==='home'?'⌂':'▣'}</span><div><b>${addressLabel(type)}</b><small>${escapeHtml(a.name)}</small></div></div><div class="address-buttons"><button onclick="openAddressForm('${type}')">Edit</button><button onclick="deleteAddress('${type}')">Delete</button></div></div><div class="saved-address-body"><p>${escapeHtml(a.street)}, ${escapeHtml(a.village)}</p><p>${escapeHtml(a.city)}, ${escapeHtml(a.state)} - ${escapeHtml(a.pincode)}</p><p>${escapeHtml(a.country)}</p><p>📱 ${escapeHtml(a.mobile)} &nbsp; • &nbsp; ✉ ${escapeHtml(a.email)}</p></div></div>`}).join('')}

function showAccount(){const user=JSON.parse(localStorage.getItem('perfectHomeCurrentUser')||'null');if(!user)return;document.querySelector('.auth-card').innerHTML=`<div class="profile"><div class="avatar">${user.name.charAt(0).toUpperCase()}</div><p class="eyebrow">MY ACCOUNT</p><h1>Welcome, ${escapeHtml(user.name.split(' ')[0])}!</h1><p class="muted">${escapeHtml(user.email)}</p><div class="profile-box"><div><b>Personal details</b><span>${escapeHtml(user.name)}</span><span>${escapeHtml(user.phone)}</span><span>${escapeHtml(user.email)}</span></div><div><b>Latest order</b>${JSON.parse(localStorage.getItem('perfectHomeLastOrder')||'null')?'<span>Order #'+JSON.parse(localStorage.getItem('perfectHomeLastOrder')).order+'</span><span>Placed '+JSON.parse(localStorage.getItem('perfectHomeLastOrder')).date+'</span>':'<span>No orders yet</span>'}</div></div><section class="address-section"><div class="address-section-head"><div><p class="eyebrow">DELIVERY ADDRESSES</p><h2>Saved addresses</h2><p>Save separate Home and Office addresses for faster checkout.</p></div><button class="btn primary" onclick="openAddressForm()">+ Add address</button></div><div id="addressFormPanel" class="hidden"></div><div id="addressList" class="address-list"></div></section><a class="btn dark full" href="products.html">Continue shopping</a><button class="logout" onclick="logout()">Sign out</button></div>`;renderAddresses()}
function logout(){localStorage.removeItem('perfectHomeCurrentUser');location.reload()}
document.addEventListener('DOMContentLoaded',()=>{if(localStorage.getItem('perfectHomeCurrentUser'))showAccount()})
