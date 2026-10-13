// Global State & Save System
let userEmail = '';
let geminiApiKey = '';

let currentDay = 1;
let maxUnlockedDay = 1;
let dialogueQueue = [];
let masterQueue = [];
let activeRoomId = null; // 'master', 'group', 'heart'
let currentNotificationRoomTarget = null;

let isWaitingForPlayer = false;
let waitingForTap = false;
let speedMode = 1; // 0=Slow, 1=Normal, 2=Fast, 3=Tap
const delays = [2200, 1200, 500, 0];
let currentLang = 'en';

// ลำดับของ Order สำหรับสลับแชตล่าสุดขึ้นบนสุด
let chatOrderCounter = 100;

let playerProfile = {
  name: 'Lin XinYue',
  avatarDataUrl: '',
  age: 23,
  occupation: 'Automation Engineer',
  interests: 'Reading, writing, music, watching',
  idealType: 'Good guy, taller than me, mature',
  datingStyle: 'Slow burn, fall slow but fall harder',
  bestQuality: 'Honestly, friendly'
};

let endingBookRecords = [];

const contactsData = {
  chenxu: { codeName: 'Mr. Horizon', realName: 'Chen Xu (เฉินซวี่)', age: 29, occupation: 'Lead Architect', interests: 'Structure sketches, Coffee', idealType: 'Peace without words', datingStyle: 'More action than words', bestQuality: 'Responsibility', avatarUrl: 'images/chenxu.jpg', bgTone: 'bg-purple-200 text-purple-800' },
  xiyao: { codeName: 'Golden Puppy', realName: 'Xia Xiyao (เซี่ยซีเหยา)', age: 22, occupation: 'Idol Vocalist & Dancer', interests: 'Dance, Cheese milk tea', idealType: 'Sweet older sister', datingStyle: 'Clingy & affectionate 24/7', bestQuality: 'Bright Energy', avatarUrl: 'images/xiyao.jpg', bgTone: 'bg-sky-200 text-sky-800' },
  wenjun: { codeName: 'Velvet Noir', realName: 'Wen Jun (เวินจวิ้น)', age: 28, occupation: 'Art Gallery Owner', interests: 'Vintage wine, Jazz vinyls', idealType: 'Lovely little one', datingStyle: 'Gentle and attentive', bestQuality: 'Deep Eyes', avatarUrl: 'images/wenjun.jpg', bgTone: 'bg-indigo-950 text-purple-200' },
  guyan: { codeName: 'Black Cat', realName: 'Gu Yan (กู้เยี่ยน)', age: 24, occupation: 'Indie Game Developer', interests: 'Midnight coding, Black cats', idealType: 'Quiet person', datingStyle: 'Tsundere with words', bestQuality: 'Quiet Focus', avatarUrl: 'images/guyan.jpg', bgTone: 'bg-slate-700 text-slate-200' },
  yingyin: { codeName: 'Scarlet', realName: 'Song Yingyin (ซ่งอิงอิน)', age: 26, occupation: 'Fashion Editor', interests: 'Haute couture, Espresso', idealType: 'Sophisticated gentleman', datingStyle: 'Elegant romance', avatarUrl: 'images/yingyin.jpg', bgTone: 'bg-pink-200 text-pink-800' },
  jiangyue: { codeName: 'Luna', realName: 'Jiang Yue (เจียงเยว่)', age: 25, occupation: 'Classical Pianist', interests: 'Chopin, Afternoon tea', idealType: 'Romantic soul', datingStyle: 'Soft melodic love', avatarUrl: 'images/jiangyue.jpg', bgTone: 'bg-fuchsia-200 text-fuchsia-800' },
  tangmei: { codeName: 'Mochi (Foco)', realName: 'Tang Mei (ถังเม่ย)', age: 23, occupation: 'Food Vlogger', interests: 'Street food, Baking', idealType: 'Someone who loves eating', datingStyle: 'Cute & energetic', avatarUrl: 'images/tangmei.jpg', bgTone: 'bg-purple-200 text-purple-800' },
  master: { codeName: 'Producer', realName: 'Plan Master', occupation: 'Executive Director of LUMEN', avatarUrl: '', bgTone: 'bg-pink-100 text-fuchsia-700', isSpecial: true },
  consultant: { codeName: 'LUMEN Bot', realName: 'LUMEN Counselor', occupation: 'Relationship Advisor Bot', avatarUrl: '', bgTone: 'bg-emerald-100 text-emerald-800', isSpecial: true }
};

// 1. SYSTEM INIT & LOGIN
window.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('lumen_user_email');
  if (savedEmail) {
    userEmail = savedEmail;
    loadUserData();
    document.getElementById('modal-email-login').classList.add('hidden');
  }
});

function submitEmailLogin() {
  const input = document.getElementById('login-email-input').value.trim();
  if (!input || !input.includes('@')) {
    alert('Please enter a valid email address!');
    return;
  }
  userEmail = input;
  localStorage.setItem('lumen_user_email', userEmail);
  loadUserData();
  document.getElementById('modal-email-login').classList.add('hidden');
}

function saveUserData() {
  if (!userEmail) return;
  const storeObj = { currentDay, maxUnlockedDay, playerProfile, endingBookRecords };
  localStorage.setItem(`lumen_save_${userEmail}`, JSON.stringify(storeObj));
}

function loadUserData() {
  const raw = localStorage.getItem(`lumen_save_${userEmail}`);
  if (raw) {
    const data = JSON.parse(raw);
    currentDay = data.currentDay || 1;
    maxUnlockedDay = data.maxUnlockedDay || 1;
    playerProfile = data.playerProfile || playerProfile;
    endingBookRecords = data.endingBookRecords || [];
  }
  updateUIFromState();
  loadApiKeyFromStorage();
}

function updateUIFromState() {
  document.getElementById('my-player-name').textContent = playerProfile.name;
  document.getElementById('my-player-email').textContent = userEmail;
  document.getElementById('more-user-email-display').textContent = userEmail;
  document.getElementById('people-player-name').textContent = `${playerProfile.name} (You)`;
  document.getElementById('people-player-sub').textContent = `${playerProfile.occupation} · Participant`;
  document.getElementById('my-day-indicator').textContent = `${currentDay} / 30`;

  if (playerProfile.avatarDataUrl) {
    const style = `background-image: url('${playerProfile.avatarDataUrl}'); background-size: cover; background-position: center;`;
    document.getElementById('people-player-avatar').setAttribute('style', style);
    document.getElementById('people-player-avatar').textContent = '';
    document.getElementById('my-player-avatar').setAttribute('style', style);
    document.getElementById('my-player-avatar').textContent = '';
  }
}

// 2. IN-APP POPUP NOTIFICATION & DYNAMIC REORDERING SYSTEM
function triggerInAppNotification(title, msg, avatarText = 'M', targetRoom = 'master', avatarImgUrl = '') {
  // สลับลำดับให้รายการแชตนี้ขึ้นมาอยู่อันดับ 1 บนสุด
  moveChannelToTop(targetRoom);

  // อัปเดตข้อความล่าสุดในรายการแชต
  if (targetRoom === 'master') document.getElementById('master-last-msg').textContent = msg;
  if (targetRoom === 'group') document.getElementById('group-last-msg').textContent = msg;
  if (targetRoom === 'heart') document.getElementById('heart-last-msg').textContent = msg;

  // ถ้าผู้เล่นอยู่ในห้องแชตนั้นอยู่แล้ว ไม่ต้องเด้งป๊อปอัปแจ้งเตือน
  if (activeRoomId === targetRoom) return;

  currentNotificationRoomTarget = targetRoom;
  const notiBox = document.getElementById('in-app-notification');
  const avatarBox = document.getElementById('noti-avatar');
  document.getElementById('noti-title').textContent = title;
  document.getElementById('noti-body').textContent = msg;

  if (avatarImgUrl) {
    avatarBox.style.backgroundImage = `url('${avatarImgUrl}')`;
    avatarBox.textContent = '';
  } else {
    avatarBox.style.backgroundImage = 'none';
    avatarBox.textContent = avatarText;
  }

  notiBox.classList.remove('hidden', 'noti-slide-up');
  notiBox.classList.add('noti-slide-down');

  setTimeout(() => {
    notiBox.classList.remove('noti-slide-down');
    notiBox.classList.add('noti-slide-up');
    setTimeout(() => notiBox.classList.add('hidden'), 300);
  }, 3500);
}

function clickNotificationBanner() {
  if (currentNotificationRoomTarget === 'master') openMasterChat();
  else if (currentNotificationRoomTarget === 'group') openGroupChat();
  else if (currentNotificationRoomTarget === 'heart') openHeartSendingRoom();

  document.getElementById('in-app-notification').classList.add('hidden');
}

// สลับลำดับ DOM ให้ห้องล่าสุดมี order น้อยลงเรื่อยๆ (ขึ้นมาด้านบนสุด)
function moveChannelToTop(channelKey) {
  chatOrderCounter--;
  const channelEl = document.getElementById(`channel-${channelKey}`);
  if (channelEl) channelEl.style.order = chatOrderCounter;
}

// 3. GEMINI API INTEGRATION SYSTEM
function loadApiKeyFromStorage() {
  const savedKey = localStorage.getItem(`lumen_gemini_key_${userEmail}`);
  if (savedKey) {
    geminiApiKey = savedKey;
    document.getElementById('gemini-api-key').value = savedKey;
    updateApiStatus('connected', 'Saved & Ready');
  } else {
    updateApiStatus('disconnected', 'Disconnected');
  }
}

function updateApiStatus(state, text) {
  const badge = document.getElementById('api-status-badge');
  const dot = document.getElementById('api-status-dot');
  const txt = document.getElementById('api-status-text');
  if (!badge || !dot || !txt) return;

  if (state === 'connected') {
    badge.className = "flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-700 font-bold";
    dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
    txt.textContent = text || "Connected";
  } else if (state === 'testing') {
    badge.className = "flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-[10px] text-amber-700 font-bold";
    dot.className = "w-2 h-2 rounded-full bg-amber-500 animate-ping";
    txt.textContent = "Testing...";
  } else {
    badge.className = "flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500 font-bold";
    dot.className = "w-2 h-2 rounded-full bg-slate-400";
    txt.textContent = text || "Disconnected";
  }
}

function saveGeminiApiKey() {
  const keyInput = document.getElementById('gemini-api-key').value.trim();
  if (!keyInput) {
    localStorage.removeItem(`lumen_gemini_key_${userEmail}`);
    geminiApiKey = '';
    updateApiStatus('disconnected', 'Disconnected');
    alert('API Key removed.');
    return;
  }
  geminiApiKey = keyInput;
  localStorage.setItem(`lumen_gemini_key_${userEmail}`, geminiApiKey);
  updateApiStatus('connected', 'Saved');
  alert('Gemini API Key saved successfully!');
}

async function testGeminiConnection() {
  const keyInput = document.getElementById('gemini-api-key').value.trim();
  if (!keyInput) { alert('Please enter a Gemini API Key first!'); return; }
  updateApiStatus('testing', 'Testing...');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyInput}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello, reply with OK if connected." }] }] })
    });

    if (response.ok) {
      updateApiStatus('connected', 'Connected');
      alert('✅ Connection Successful! Gemini API is working properly.');
    } else {
      updateApiStatus('disconnected', 'Invalid Key');
      alert('❌ Connection Failed! Please check your API Key.');
    }
  } catch (err) {
    updateApiStatus('disconnected', 'Error');
    alert('❌ Connection Error: ' + err.message);
  }
}

// 4. MASTER CHAT FLOW
function openMasterChat() {
  activeRoomId = 'master';
  document.getElementById('main-header').classList.add('hidden');
  document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
  document.getElementById('chat-inside-header').classList.remove('hidden');
  document.getElementById('active-chat-title').textContent = 'LUMEN Master';
  document.getElementById('room-master').classList.remove('hidden');

  const stream = document.getElementById('master-stream');
  if (stream.children.length === 0) {
    const dayData = window.day1Data;
    if (dayData && dayData.masterDialogues) {
      masterQueue = [...dayData.masterDialogues];
      processMasterQueue();
    }
  }
}

function processMasterQueue() {
  if (masterQueue.length === 0) return;
  const item = masterQueue.shift();

  if (item.type === 'sys') {
    renderSysMsg(document.getElementById('master-stream'), item.text);
    setTimeout(processMasterQueue, 800);
  } else if (item.type === 'master_msg') {
    addMasterMsg(item.text);
    triggerInAppNotification('LUMEN Master', item.text, 'M', 'master');
    setTimeout(processMasterQueue, 1200);
  } else if (item.type === 'player_turn') {
    renderMasterInputBar(item.prompt, (text) => {
      addUserBubble(document.getElementById('master-stream'), text);
      processMasterQueue();
    });
  } else if (item.type === 'player_avatar_upload') {
    document.getElementById('master-form-box').innerHTML = `
      <div class="space-y-1 text-center p-2 bg-purple-50 rounded-xl border border-purple-100">
        <label class="text-xs font-semibold text-purple-900 block">Select Profile Avatar Image:</label>
        <input type="file" accept="image/*" onchange="handleMasterAvatarUpload(event)" class="text-xs text-purple-900 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-pink-100 file:text-fuchsia-600">
      </div>
    `;
  } else if (item.type === 'player_reg_flow') {
    startMasterRegQuestions(0);
  } else if (item.type === 'card') {
    renderProfileCardInChat('player', 'master-stream');
    setTimeout(processMasterQueue, 1000);
  } else if (item.type === 'master_event') {
    if (item.eventName === 'OPEN_GROUP_CHANNEL') {
      document.getElementById('master-last-msg').textContent = 'TDL All Group Unlocked!';
      document.getElementById('master-unread-dot').classList.add('hidden');
      document.getElementById('channel-group').classList.remove('hidden');
      moveChannelToTop('group');
      
      triggerInAppNotification('TDL : All Group', 'Lounge Activated! Tap to join.', 'G', 'group');

      document.getElementById('master-form-box').innerHTML = `<button onclick="exitActiveChat(); openGroupChat();" class="w-full bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white font-bold py-2.5 rounded-xl text-xs">Enter TDL All Group Lounge →</button>`;
      saveUserData();
    }
  }
}

function handleMasterAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    playerProfile.avatarDataUrl = e.target.result;
    updateUIFromState();
    addUserBubble(document.getElementById('master-stream'), '📷 Avatar photo uploaded!');
    document.getElementById('master-form-box').innerHTML = '';
    processMasterQueue();
  };
  reader.readAsDataURL(file);
}

const regQuestions = [
  { key: 'name', label: 'Name / Nickname:', placeholder: 'e.g. Lin XinYue' },
  { key: 'age', label: 'Age:', placeholder: 'e.g. 23' },
  { key: 'occupation', label: 'Occupation:', placeholder: 'e.g. Automation Engineer' },
  { key: 'interests', label: 'Interests & Hobbies:', placeholder: 'e.g. Reading, writing' },
  { key: 'idealType', label: 'Ideal Type:', placeholder: 'e.g. Good guy, mature' },
  { key: 'datingStyle', label: 'Dating Style:', placeholder: 'e.g. Slow burn' }
];

function startMasterRegQuestions(idx) {
  if (idx >= regQuestions.length) {
    document.getElementById('master-form-box').innerHTML = '';
    processMasterQueue();
    return;
  }
  const q = regQuestions[idx];
  addMasterMsg(`[Profile Detail ${idx+1}/6] ${q.label}`);
  renderMasterInputBar(q.placeholder, (text) => {
    playerProfile[q.key] = text;
    updateUIFromState();
    addUserBubble(document.getElementById('master-stream'), text);
    startMasterRegQuestions(idx + 1);
  });
}

function renderMasterInputBar(placeholder, cb) {
  const box = document.getElementById('master-form-box');
  box.innerHTML = `
    <div class="flex gap-2">
      <input type="text" id="master-input-field" class="flex-1 bg-purple-50/50 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-purple-950 focus:outline-none" placeholder="${placeholder}">
      <button id="master-send-btn" class="bg-gradient-to-r from-fuchsia-400 to-pink-400 px-4 py-2 rounded-xl text-xs font-bold text-white">Send</button>
    </div>
  `;
  const field = document.getElementById('master-input-field');
  const btn = document.getElementById('master-send-btn');
  field.focus();
  btn.onclick = () => {
    const val = field.value.trim();
    if (!val) return;
    box.innerHTML = '';
    cb(val);
  };
}

// 5. POLAROID PROFILE CARD RENDERER
function createPolaroidCardHTML(cardData, isPlayer = false) {
  const nameAge = isPlayer ? `${playerProfile.name}, ${playerProfile.age}` : `${cardData.realName}, ${cardData.age}`;
  const occ = isPlayer ? playerProfile.occupation : cardData.occupation;
  const interests = isPlayer ? playerProfile.interests : cardData.interests;
  const type = isPlayer ? playerProfile.idealType : cardData.idealType;
  const dating = isPlayer ? playerProfile.datingStyle : cardData.datingStyle;
  const best = isPlayer ? playerProfile.bestQuality : cardData.bestQuality;

  let photoStyle = `background-color: #e9d5ff;`;
  if (isPlayer && playerProfile.avatarDataUrl) {
    photoStyle = `background-image: url('${playerProfile.avatarDataUrl}'); background-size: cover; background-position: center;`;
  } else if (!isPlayer && cardData.avatarUrl) {
    photoStyle = `background-image: url('${cardData.avatarUrl}'); background-size: cover; background-position: center;`;
  }

  return `
    <div class="bg-[#f7f5f0] text-purple-950 rounded-xl p-4 shadow-md border border-purple-200/80 max-w-xs mx-auto my-3 font-typewriter">
      <div class="text-[10px] text-purple-400 border-b border-purple-200/60 pb-1.5 mb-2.5 flex justify-between">
        <span>Day ${currentDay}. Profile : ${nameAge.split(',')[0]}</span>
        <span class="tracking-widest font-sans font-bold text-pink-400">30 DAYS TO LOVE</span>
      </div>
      
      <div class="bg-white p-2.5 rounded-lg border border-purple-100 shadow-sm mb-3">
        <div class="aspect-[4/3] w-full rounded overflow-hidden shadow-inner flex flex-col justify-end p-2 ${!playerProfile.avatarDataUrl && isPlayer ? 'bg-purple-200 flex items-center justify-center text-xs font-sans text-purple-700' : ''}" style="${photoStyle}">
          ${!playerProfile.avatarDataUrl && isPlayer ? '📷 Your Photo' : ''}
        </div>
        <div class="mt-2 text-[9px] text-purple-400 font-sans tracking-widest flex justify-between uppercase">
          <span>30 DAYS TO LOVE</span>
          <span>THE AFTERIMAGE PARADOX</span>
        </div>
      </div>

      <div class="space-y-2 text-xs text-purple-950 font-sans">
        <div class="border-b border-purple-200/60 pb-1 flex justify-between"><strong class="font-typewriter text-purple-800">Name/Age:</strong> <span>${nameAge}</span></div>
        <div class="border-b border-purple-200/60 pb-1 flex justify-between"><strong class="font-typewriter text-purple-800">Occupation:</strong> <span>${occ}</span></div>
        <div class="border-b border-purple-200/60 pb-1"><strong class="font-typewriter text-purple-800 block mb-0.5">Interests:</strong> <div class="bg-purple-100/70 p-1.5 rounded text-[11px]">${interests}</div></div>
        <div class="border-b border-purple-200/60 pb-1"><strong class="font-typewriter text-purple-800 block mb-0.5">Type:</strong> <div class="bg-purple-100/70 p-1.5 rounded text-[11px]">${type}</div></div>
        <div class="border-b border-purple-200/60 pb-1"><strong class="font-typewriter text-purple-800 block mb-0.5">Dating Style:</strong> <div class="bg-purple-100/70 p-1.5 rounded text-[11px]">${dating}</div></div>
        <div><strong class="font-typewriter text-purple-800 block mb-0.5">Best Quality:</strong> <div class="bg-purple-100/70 p-1.5 rounded text-[11px]">${best}</div></div>
      </div>
    </div>
  `;
}

function renderProfileCardInChat(key, targetStreamId = 'group-stream') {
  const b = document.createElement('div');
  b.className = "chat-bubble my-2";
  b.innerHTML = (key === 'player') ? createPolaroidCardHTML(null, true) : createPolaroidCardHTML(contactsData[key], false);
  const stream = document.getElementById(targetStreamId);
  stream.appendChild(b);
  stream.scrollTop = stream.scrollHeight;
}

// 6. GROUP CHAT ENGINE
function openGroupChat() {
  activeRoomId = 'group';
  document.getElementById('main-header').classList.add('hidden');
  document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
  document.getElementById('chat-inside-header').classList.remove('hidden');
  document.getElementById('active-chat-title').textContent = 'TDL : All Group';
  document.getElementById('room-group').classList.remove('hidden');
  document.getElementById('group-unread-dot').classList.add('hidden');

  if (dialogueQueue.length === 0) {
    const dayData = window[`day${currentDay}Data`];
    if (dayData) {
      dialogueQueue = [...dayData.dialogues];
      processGroupQueue();
    }
  }
}

function processGroupQueue() {
  if (dialogueQueue.length === 0) return;
  const item = dialogueQueue.shift();

  if (item.type === 'sys') {
    renderGroupSysMsg(item.text);
    scheduleGroupNext();
  } else if (item.type === 'msg') {
    showTypingIndicator(item.sender, () => {
      renderGroupMsgBubble(item.sender, item.tone, item.text);
      triggerInAppNotification('TDL : All Group', `${item.sender}: ${item.text}`, item.sender[0], 'group');
      scheduleGroupNext();
    });
  } else if (item.type === 'img') {
    showTypingIndicator(item.sender, () => {
      renderGroupImgBubble(item.sender, item.tone, item.src);
      triggerInAppNotification('TDL : All Group', `${item.sender} sent a photo 📷`, item.sender[0], 'group');
      scheduleGroupNext();
    });
  } else if (item.type === 'card') {
    renderProfileCardInChat(item.key, 'group-stream');
    scheduleGroupNext();
  } else if (item.type === 'player_turn') {
    isWaitingForPlayer = true;
    const inputBar = document.getElementById('group-player-input-bar');
    inputBar.classList.remove('hidden');
    document.getElementById('player-free-text').placeholder = item.prompt || 'Type response...';
    document.getElementById('player-free-text').focus();
  } else if (item.type === 'master_event') {
    if (item.eventName === 'TRIGGER_HEART_SIGNAL') {
      document.getElementById('channel-heart').classList.remove('hidden');
      moveChannelToTop('heart');
      triggerInAppNotification('<Heart Sending>', 'Midnight Heart Signal Activated! 💌', '💌', 'heart');
      saveUserData();
    }
  }
}

function scheduleGroupNext() {
  if (speedMode === 3) {
    waitingForTap = true;
    document.getElementById('next-tap-bar').classList.remove('hidden');
  } else {
    setTimeout(processGroupQueue, delays[speedMode]);
  }
}

function advanceDialogue() {
  if (waitingForTap) { waitingForTap = false; processGroupQueue(); }
}

function showTypingIndicator(sender, cb) {
  if (speedMode === 3) { cb(); return; }
  const indicator = document.getElementById('typing-indicator');
  indicator.classList.remove('hidden');
  document.getElementById('typing-name').textContent = `${sender} is typing...`;
  setTimeout(() => { indicator.classList.add('hidden'); cb(); }, Math.min(650, delays[speedMode]));
}

function renderGroupSysMsg(txt) {
  renderSysMsg(document.getElementById('group-stream'), txt);
}

function renderSysMsg(container, txt) {
  const b = document.createElement('div');
  b.className = "flex justify-center my-2 chat-bubble";
  b.innerHTML = `<div class="bg-purple-100/60 text-purple-600 border border-purple-200/50 px-3.5 py-1.5 rounded-full text-[11px] max-w-[90%] text-center">${txt}</div>`;
  container.appendChild(b);
  container.scrollTop = container.scrollHeight;
}

function renderGroupMsgBubble(sender, tone, text) {
  const stream = document.getElementById('group-stream');
  const b = document.createElement('div');
  b.className = "chat-bubble flex items-start space-x-2.5";
  b.innerHTML = `
    <div class="w-9 h-9 rounded-full ${tone} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-purple-100 shadow-sm">${sender[0]}</div>
    <div class="space-y-0.5 max-w-[80%]">
      <span class="text-[11px] font-semibold text-purple-400 ml-1">${sender}</span>
      <div class="bg-white border border-purple-100 text-purple-950 px-3.5 py-2 rounded-2xl rounded-tl-none text-xs leading-relaxed shadow-sm">${text}</div>
    </div>
  `;
  stream.appendChild(b);
  stream.scrollTop = stream.scrollHeight;
  document.getElementById('group-last-msg').textContent = `${sender}: ${text}`;
}

function renderGroupImgBubble(sender, tone, imgSrc) {
  const stream = document.getElementById('group-stream');
  const b = document.createElement('div');
  b.className = "chat-bubble flex items-start space-x-2.5";
  b.innerHTML = `
    <div class="w-9 h-9 rounded-full ${tone} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-purple-100 shadow-sm">${sender[0]}</div>
    <div class="space-y-0.5 max-w-[75%]">
      <span class="text-[11px] font-semibold text-purple-400 ml-1">${sender}</span>
      <div class="bg-white border border-purple-100 p-1.5 rounded-2xl rounded-tl-none shadow-sm overflow-hidden">
        <img src="${imgSrc}" class="rounded-xl w-full h-auto object-cover max-h-60" alt="Chat attachment" onclick="window.open('${imgSrc}', '_blank')">
      </div>
    </div>
  `;
  stream.appendChild(b);
  stream.scrollTop = stream.scrollHeight;
  document.getElementById('group-last-msg').textContent = `${sender}: [Photo 📷]`;
}

function sendPlayerFreeMessage() {
  const field = document.getElementById('player-free-text');
  const text = field.value.trim();
  if (!text) return;
  field.value = '';
  document.getElementById('group-player-input-bar').classList.add('hidden');
  isWaitingForPlayer = false;

  addUserBubble(document.getElementById('group-stream'), text);
  processGroupQueue();
}

function addMasterMsg(txt) {
  const stream = document.getElementById('master-stream');
  const b = document.createElement('div');
  b.className = "chat-bubble flex items-start space-x-2";
  b.innerHTML = `<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-fuchsia-400 to-pink-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">M</div><div class="bg-white border border-purple-100 text-purple-900 px-3.5 py-2 rounded-2xl rounded-tl-none text-xs max-w-[85%] shadow-sm">${txt}</div>`;
  stream.appendChild(b);
  stream.scrollTop = stream.scrollHeight;
}

function addUserBubble(container, txt) {
  const b = document.createElement('div');
  b.className = "chat-bubble flex justify-end";
  b.innerHTML = `<div class="bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white px-3.5 py-2 rounded-2xl rounded-tr-none text-xs max-w-[80%] shadow-sm">${txt}</div>`;
  container.appendChild(b);
  container.scrollTop = container.scrollHeight;
}

// 7. OTHER TABS & UTILS
function switchTab(tabKey) {
  exitActiveChat();
  document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('text-fuchsia-500');
    b.classList.add('text-purple-300');
  });

  const targetPage = document.getElementById(`tab-${tabKey}`);
  const targetBtn = document.getElementById(`nav-${tabKey}`);
  if (targetPage) targetPage.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('text-fuchsia-500');
    targetBtn.classList.remove('text-purple-300');
  }

  const titles = { chats: 'Chats', people: 'People', story: 'Story', my: 'MY', more: 'More' };
  document.getElementById('header-page-title').textContent = titles[tabKey] || 'Chats';

  if (tabKey === 'people') renderPeopleTab();
}

function exitActiveChat() {
  activeRoomId = null;
  document.getElementById('chat-inside-header').classList.add('hidden');
  document.getElementById('room-master').classList.add('hidden');
  document.getElementById('room-group').classList.add('hidden');
  document.getElementById('room-heart').classList.add('hidden');
  document.getElementById('main-header').classList.remove('hidden');
  document.getElementById('tab-chats').classList.remove('hidden');
}

function switchMySubTab(subKey) {
  document.getElementById('subtab-mystory').classList.add('hidden');
  document.getElementById('subtab-ending').classList.add('hidden');
  document.getElementById('subtab-history').classList.add('hidden');

  document.querySelectorAll('#tab-my button').forEach(b => {
    b.classList.remove('text-fuchsia-600', 'border-b-2', 'border-fuchsia-500');
    b.classList.add('text-purple-300');
  });

  document.getElementById(`subtab-${subKey}`).classList.remove('hidden');
  const btn = document.getElementById(`subtab-btn-${subKey}`);
  btn.classList.add('text-fuchsia-600', 'border-b-2', 'border-fuchsia-500');
  btn.classList.remove('text-purple-300');

  if (subKey === 'history') renderHistoryTab();
  if (subKey === 'ending') renderEndingBookTab();
}

function renderHistoryTab() {
  const container = document.getElementById('history-days-list');
  container.innerHTML = '';
  for (let d = 1; d <= maxUnlockedDay; d++) {
    const isCurrent = (d === currentDay);
    const item = document.createElement('div');
    item.className = `p-3 rounded-2xl border ${isCurrent ? 'bg-fuchsia-50 border-fuchsia-300' : 'bg-white border-purple-100'} flex justify-between items-center cursor-pointer hover:border-fuchsia-300 transition shadow-sm`;
    item.onclick = () => jumpToHistoryDay(d);
    item.innerHTML = `<div><span class="text-xs font-bold text-purple-950">Day ${d}</span><p class="text-[10px] text-purple-400">Episode ${d}</p></div><span class="text-xs ${isCurrent ? 'text-fuchsia-600 font-bold' : 'text-purple-300'}">${isCurrent ? 'Playing' : 'Jump ⏱️'}</span>`;
    container.appendChild(item);
  }
}

function jumpToHistoryDay(dayNum) {
  currentDay = dayNum;
  document.getElementById('my-day-indicator').textContent = `${currentDay} / 30`;
  saveUserData();
  alert(`Jumped back to Day ${dayNum}!`);
  switchTab('chats');
  openGroupChat();
}

function renderEndingBookTab() {
  const container = document.getElementById('ending-records-list');
  if (endingBookRecords.length === 0) {
    container.innerHTML = `<div class="p-4 bg-white rounded-2xl border border-purple-100 shadow-sm text-center py-8"><p class="text-xs text-purple-400">No saved ending records yet.</p><p class="text-[10px] text-purple-300 mt-1">Complete 30 days to save your story!</p></div>`;
    return;
  }
  container.innerHTML = '';
  endingBookRecords.forEach((rec, idx) => {
    const item = document.createElement('div');
    item.className = "p-3.5 bg-white rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between";
    item.innerHTML = `<div><h4 class="text-xs font-bold text-purple-950">${rec.title}</h4><p class="text-[10px] text-purple-400">Partner: ${rec.partner} · ${rec.date}</p></div><button onclick="viewEndingDetail(${idx})" class="text-xs bg-pink-100 text-fuchsia-600 px-3 py-1 rounded-xl font-bold hover:bg-pink-200">View</button>`;
    container.appendChild(item);
  });
}

function saveCurrentEndingRecord() {
  const newRecord = {
    title: `Season Loop #${endingBookRecords.length + 1} Ending`,
    partner: 'Chen Xu (เฉินซวี่)',
    date: new Date().toLocaleDateString(),
    storySummary: 'After 30 days in Shanghai, you walked along the Bund with Chen Xu under the quiet night stars.'
  };
  endingBookRecords.push(newRecord);
  saveUserData();
  renderEndingBookTab();
  alert('Ending story saved to Ending Book!');
}

function viewEndingDetail(idx) {
  const rec = endingBookRecords[idx];
  alert(`📖 [${rec.title}]\n\nPartner: ${rec.partner}\nDate: ${rec.date}\n\n"${rec.storySummary}"`);
}

function restartGameNewLoop() {
  if (confirm('Are you sure you want to restart the game from Day 1? Saved Ending Records will be kept.')) {
    currentDay = 1;
    maxUnlockedDay = 1;
    saveUserData();
    updateUIFromState();
    alert('Game reset to Day 1!');
    switchTab('chats');
  }
}

function renderPeopleTab() {
  const list = document.getElementById('people-friends-list');
  list.innerHTML = '';
  document.getElementById('people-day-status').textContent = currentDay === 1 ? 'Day 1: Anonymous Code Names' : 'Day 2+: Profile Unlocked';

  Object.entries(contactsData).forEach(([key, person]) => {
    const displayName = (currentDay === 1 && !person.isSpecial) ? person.codeName : person.realName;
    const subTitle = (currentDay === 1 && !person.isSpecial) ? 'Anonymous Participant' : (person.codeName || person.occupation);

    const item = document.createElement('div');
    item.className = "p-3.5 px-4 flex items-center space-x-3.5 hover:bg-purple-50/50 transition cursor-pointer";
    item.onclick = () => openContactProfileModal(key);

    let avatarHTML = `<div class="w-11 h-11 rounded-full ${person.bgTone} flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100 shadow-sm">${displayName[0]}</div>`;
    if (currentDay >= 2 && person.avatarUrl) {
      avatarHTML = `<div class="w-11 h-11 rounded-full border border-purple-100 shadow-sm shrink-0 bg-cover bg-center overflow-hidden" style="background-image: url('${person.avatarUrl}')"></div>`;
    }

    item.innerHTML = `
      ${avatarHTML}
      <div class="flex-1 min-w-0"><h4 class="text-xs font-bold text-purple-950 truncate">${displayName}</h4><p class="text-[10px] text-purple-400 mt-0.5 truncate">${subTitle}</p></div>
      <span class="text-[10px] text-purple-300">View &gt;</span>
    `;
    list.appendChild(item);
  });
}

function openContactProfileModal(key) {
  const person = contactsData[key];
  if (!person) return;
  const modal = document.getElementById('modal-contact-view');
  const avatarBox = document.getElementById('modal-profile-avatar');
  const displayName = (currentDay === 1 && !person.isSpecial) ? person.codeName : person.realName;

  document.getElementById('modal-profile-name').textContent = displayName;
  document.getElementById('modal-profile-sub').textContent = `${person.codeName} · ${person.occupation || 'Participant'}`;

  if (currentDay >= 2 && person.avatarUrl) {
    avatarBox.style.backgroundImage = `url('${person.avatarUrl}')`;
    avatarBox.textContent = '';
  } else {
    avatarBox.style.backgroundImage = 'none';
    avatarBox.className = `w-32 h-32 rounded-full border-2 border-white/80 shadow-2xl overflow-hidden ${person.bgTone} flex items-center justify-center text-4xl font-bold`;
    avatarBox.textContent = displayName[0];
  }

  document.getElementById('modal-profile-details').innerHTML = `
    <div><strong class="text-purple-300">Occupation:</strong> ${person.occupation || 'N/A'}</div>
    ${person.interests ? `<div><strong class="text-purple-300">Interests:</strong> ${person.interests}</div>` : ''}
    ${person.idealType ? `<div><strong class="text-purple-300">Ideal Type:</strong> ${person.idealType}</div>` : ''}
  `;
  modal.classList.remove('hidden');
}

function closeContactProfileModal() {
  document.getElementById('modal-contact-view').classList.add('hidden');
}

function openEditMyProfileModal() {
  document.getElementById('edit-name').value = playerProfile.name;
  document.getElementById('edit-occ').value = playerProfile.occupation;
  document.getElementById('edit-interests').value = playerProfile.interests;
  document.getElementById('edit-type').value = playerProfile.idealType;
  document.getElementById('edit-style').value = playerProfile.datingStyle;
  document.getElementById('modal-edit-profile').classList.remove('hidden');
}

function closeEditMyProfileModal() {
  document.getElementById('modal-edit-profile').classList.add('hidden');
}

let tempAvatarDataUrl = '';
function handleAvatarFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) { tempAvatarDataUrl = e.target.result; };
  reader.readAsDataURL(file);
}

function saveMyProfileChanges() {
  if (tempAvatarDataUrl) playerProfile.avatarDataUrl = tempAvatarDataUrl;
  playerProfile.name = document.getElementById('edit-name').value.trim() || 'Lin XinYue';
  playerProfile.occupation = document.getElementById('edit-occ').value.trim();
  playerProfile.interests = document.getElementById('edit-interests').value.trim();
  playerProfile.idealType = document.getElementById('edit-type').value.trim();
  playerProfile.datingStyle = document.getElementById('edit-style').value.trim();

  updateUIFromState();
  saveUserData();
  closeEditMyProfileModal();
}

function toggleChatSettingsModal() {
  document.getElementById('modal-chat-settings').classList.toggle('hidden');
}

function changeSpeedModeFromSettings(val) {
  speedMode = parseInt(val);
  document.getElementById('next-tap-bar').classList.toggle('hidden', speedMode !== 3);
}

function applyChatTheme(theme) {
  const bg = document.getElementById('chat-viewport-bg');
  if (theme === 'purple') bg.className = 'flex-1 overflow-hidden relative flex flex-col bg-[#faf5ff] pb-14';
  if (theme === 'pink') bg.className = 'flex-1 overflow-hidden relative flex flex-col bg-[#fff5f7] pb-14';
  if (theme === 'blue') bg.className = 'flex-1 overflow-hidden relative flex flex-col bg-[#f0f9ff] pb-14';
  if (theme === 'dark') bg.className = 'flex-1 overflow-hidden relative flex flex-col bg-slate-900 text-white pb-14';
}

function changeLanguage(lang) {
  currentLang = lang;
  if (lang === 'th') {
    document.getElementById('label-tap-next').textContent = 'แตะหน้าจอเพื่ออ่านข้อความถัดไป';
    document.getElementById('btn-send-msg').textContent = 'ส่ง';
  } else if (lang === 'zh') {
    document.getElementById('label-tap-next').textContent = '点击屏幕阅读下一条消息';
    document.getElementById('btn-send-msg').textContent = '发送';
  } else {
    document.getElementById('label-tap-next').textContent = 'Tap to read next message';
    document.getElementById('btn-send-msg').textContent = 'Send';
  }
}

function openSwitchAccountModal() {
  document.getElementById('login-email-input').value = '';
  document.getElementById('modal-email-login').classList.remove('hidden');
}

function openHeartSendingRoom() {
  activeRoomId = 'heart';
  document.getElementById('main-header').classList.add('hidden');
  document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
  document.getElementById('chat-inside-header').classList.remove('hidden');
  document.getElementById('active-chat-title').textContent = '<Heart Sending>';
  document.getElementById('room-heart').classList.remove('hidden');

  const targetList = document.getElementById('heart-target-list');
  targetList.innerHTML = '';
  ['chenxu', 'xiyao', 'wenjun', 'guyan'].forEach(k => {
    const guy = contactsData[k];
    const item = document.createElement('div');
    item.className = "p-3 rounded-2xl bg-white border border-purple-100 flex items-center justify-between cursor-pointer transition shadow-sm";
    item.onclick = () => selectHeartTarget(k, item);
    item.innerHTML = `<div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full ${guy.bgTone} flex items-center justify-center font-bold text-xs">${guy.realName[0]}</div><div><span class="text-xs font-bold text-purple-950">${guy.realName}</span><p class="text-[10px] text-purple-400">${guy.occupation}</p></div></div><span class="text-xs text-fuchsia-500 font-bold">Select ❤️</span>`;
    targetList.appendChild(item);
  });
}

let targetGuyKey = null;
function selectHeartTarget(key, el) {
  targetGuyKey = key;
  document.querySelectorAll('#heart-target-list > div').forEach(d => d.classList.remove('border-fuchsia-400', 'bg-pink-50/50'));
  el.classList.add('border-fuchsia-400', 'bg-pink-50/50');
  document.getElementById('heart-msg-box').classList.remove('hidden');
}

function submitMidnightHeart() {
  const msg = document.getElementById('heart-input-text').value.trim();
  if (!msg) return;

  document.getElementById('heart-msg-box').classList.add('hidden');
  document.getElementById('heart-target-list').classList.add('hidden');

  const guy = contactsData[targetGuyKey];
  const reactions = {
    chenxu: `Chen Xu (เฉินซวี่): "Mmh, I received your secret note. Get some rest, let's talk tomorrow."`,
    xiyao: `Xia Xiyao (เซี่ยซีเหยา): "Did jiejie really pick me!? I'm smiling so hard right now!"`,
    wenjun: `Wen Jun (เวินจวิ้น): "Mmh... sending this kind of message, little one? Sleep well tonight."`,
    guyan: `Gu Yan (กู้เยี่ยน): "...Who said I was waiting for your note? Good night."`
  };

  document.getElementById('heart-result-box').classList.remove('hidden');
  document.getElementById('heart-reply-view').innerHTML = `<span class="text-[10px] text-purple-400 block mb-1">Delivered to ${guy.realName}:</span>"${msg}"<div class="mt-2 pt-2 border-t border-purple-100 text-fuchsia-600 font-semibold">${reactions[targetGuyKey]}</div>`;
  saveUserData();
}
