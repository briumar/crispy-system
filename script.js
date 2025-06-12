const weatherApiKey='39253e8520b381571362fd69643fe1bf';
const pexelsApiKey='tWyISYzE0Yo6HfKKGdedpC8H5XqedHUW8JAV9qcyu37eUwOvZWLvt9rm';
let latest_Keyword='';

function open_Login() {
  document.getElementById('loginModal').classList.remove('hidden');
}
function open_Register() {
  document.getElementById('registerModal').classList.remove('hidden');
}
function close(id) {
  document.getElementById(id).classList.add('hidden');
}
function get_User() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function save_User(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function user_Register() {
  const username=document.getElementById('registerUsername').value.trim();
  const password=document.getElementById('registerPassword').value.trim();
  const users=get_User();
  if (users[username]) {
    alert('Username already exists.');
  } else if (username==='' || password==='') {
    alert('Please enter a valid username and password.');
  } else {
    users[username]=password;
    save_User(users);
    alert('Registration successful! You can now log in.');
    close('registerModal');
  }
}
function loginUser() {
  const username=document.getElementById('loginUsername').value.trim();
  const password=document.getElementById('loginPassword').value.trim();
  const users=get_User();
  if (users[username]&&users[username]===password) {
    localStorage.setItem('username', username);
    close('loginModal');
    update_user_status();
  } else {
    alert('Invalid username or password.');
  }
}
function update_user_status() {
  const user_Status=document.getElementById('userStatus');
  const username=localStorage.getItem('username');
  if (username) {
    user_Status.innerHTML=`<span class='text-gray-700 mr-2'>Welcome, <b>${username}</b></span><button onclick='logoutUser()' class='bg-red-500 text-white px-3 py-1 rounded'>Log Out</button>`;
  } else {
    user_Status.innerHTML=`
      <button onclick='openLoginModal()' class='bg-indigo-600 text-white px-4 py-2 rounded'>Log In</button>
      <button onclick='openRegisterModal()' class='bg-green-600 text-white px-4 py-2 rounded ml-2'>Register</button>`;
  }
}
function user_logout() {
  localStorage.removeItem('username');
  update_user_status();
}

async function get_Weather_and_Outfit() {
  const city=document.getElementById('cityInput').value;
  const weather_Output=document.getElementById('weatherOutput');
  const weather_Icon=document.getElementById('weatherIcon');
  const image_Output=document.getElementById('imageOutput');
  const input_Keyword=document.getElementById('searchInput').value.trim();
  weather_Output.innerHTML='Fetching weather data...';
  image_Output.innerHTML='';
  weather_Icon.innerHTML='';
  try {
  //构造API URL
  const weatherURL=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;
  //发起请求
  const weather_Response=await axios.get(weatherURL);
  //提取响应数据
  const weather_Data=weather_Response.data;
  const temperature=weather_Data.main.temp;
  const description_Condition=weather_Data.weather[0].description;
  const weather_IconCode=weather_Data.weather[0].icon;
  //更新天气信息
  const weather_Info=`City: <b>${city}</b><br>Temperature: ${temperature}℃<br>Condition: ${description_Condition}`;
  weather_Output.innerHTML=weather_Info;
  const iconURL=`https://openweathermap.org/img/wn/${weather_IconCode}@2x.png`;
  weather_Icon.innerHTML=`<div class="bg-yellow-100 inline-block p-4 rounded-lg shadow border border-yellow-400">
    <img src="${iconURL}" alt="weather icon">
  </div>`;
  //关键字判断
  if (!input_Keyword) {
    if (temperature>=30) {
      latest_Keyword='summer outfit';
    } else if (temperature>=20) {
      latest_Keyword='spring fashion';
    } else if (temperature>=10) {
      latest_Keyword='jacket outfit';
    } else {
      latest_Keyword='winter coat outfit';
    }
    add_History(`City: ${city}, Auto Keyword: ${latest_Keyword}`);
  } else {
    latest_Keyword= input_Keyword;
    add_History(`City: ${city}, Keyword: ${latest_Keyword}`);
  }
  //根据关键词找图片
  search_Pexels_Images();
} catch (error) {
  console.error("Weather fetch failed:", error);
  weather_Output.textContent="Failed to retrieve weather data. Please check the city name or try again.";
}
}
async function search_Pexels_Images(forceFromInput = false) {
  const input_Keyword=document.getElementById('searchInput').value.trim();
  if (forceFromInput && input_Keyword) {
    latest_Keyword=input_Keyword;
    add_History(`Keyword search: ${latest_Keyword}`);
  }
  const image_Output=document.getElementById('imageOutput');
  if (!latest_Keyword) {
    image_Output.innerHTML='Please enter a keyword or get weather suggestions first.';
    return;
  }
  image_Output.innerHTML='Searching images...';
  try {
    const randomPage=Math.floor(Math.random() * 10) + 1;
    const pexels_Res=await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(latest_Keyword)}&per_page=6&page=${randomPage}`, {
      headers: {
        Authorization: pexelsApiKey
      }
    });
    const photos=pexels_Res.data.photos;
    const number_Of_Photo=photos.length;//检查返回的照片数据
    const no_Photos_has_found=(number_Of_Photo === 0);
    if (no_Photos_has_found) {
      const message = 'No images found. Try another keyword.';
      image_Output.innerHTML = message;
      return;
    }
    image_Output.innerHTML='';
    photos.forEach(photo => {
      const wrapper=document.createElement('div');
      const img=document.createElement('img');
      const btn=document.createElement('button');
      img.src=photo.src.medium;
      img.alt=photo.photographer;
      img.className='rounded shadow w-72';
      btn.textContent='📤 Share';
      btn.className='mt-2 text-sm text-blue-500 underline';
      btn.onclick=() => navigator.clipboard.writeText(photo.url).then(() => alert('Image link copied to clipboard!'));
      wrapper.className='flex flex-col items-center';
      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      image_Output.appendChild(wrapper);
    });
  } catch (err) {
    image_Output.innerHTML='Search failed. Please try again later.';
    console.error('Image search error:', err.response ? err.response.data : err.message);
  }
}
function add_History(text) {
  const historyList=document.getElementById('historyList');
  const li=document.createElement('li');
  li.textContent=text;
  historyList.appendChild(li);
}
window.onload=() => {
  update_user_status();
};
