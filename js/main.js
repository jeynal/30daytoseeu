// Global Game State
let currentDay = 1;
let maxUnlockedDay = 1;
let dialogueQueue = [];
let isWaitingForPlayer = false;
let waitingForTap = false;
let speedMode = 1; // 0=Slow, 1=Normal, 2=Fast, 3=Tap Mode
const delays = [2200, 1200, 500, 0];
let currentLang = 'en';

let playerProfile = {
  name: 'Lin XinYue',
  avatarDataUrl: '',
  age: 23,
  occupation: 'Automation Engineer',
  interests: 'Reading, writing, music, watching',
  idealType: 'Good guy, taller than me, mature',
  datingStyle: 'Slow burn, fall slow but fall harder',
  bestQuality: 'Honestly, funny, friendly'
};

let endingBookRecords = [];

const contactsData = {
  chenxu: { codeName: 'Mr. Horizon', realName: 'Chen Xu (เฉินซวี่)', age: 29, occupation: 'Lead Architect', interests: 'Structure sketches, Coffee', idealType: 'Peace without words', datingStyle: 'More action than words', avatarUrl: 'images/chenxu.jpg', bgTone: 'bg-purple-200 text-purple-800' },
  xiyao: { codeName: 'Golden Puppy', realName: 'Xia Xiyao (เซี่ยซีเหยา)', age: 22, occupation: 'Idol Vocalist & Dancer', interests: 'Dance, Cheese milk tea', idealType: 'Sweet older sister', datingStyle: 'Clingy & affectionate 24/7', avatarUrl: 'images/xiyao.jpg', bgTone: 'bg-sky-200 text-sky-800' },
  wenjun: { codeName: 'Velvet Noir', realName: 'Wen Jun (เวินจวิ้น)', age: 28, occupation: 'Art Gallery Owner', interests: 'Vintage wine, Jazz vinyls', idealType: 'Lovely little one', datingStyle: 'Gentle and attentive', avatarUrl: 'images/wenjun.jpg', bgTone: 'bg-indigo-950 text-purple-200' },
  guyan: { codeName: 'Black Cat', realName: 'Gu Yan (กู้เยี่ยน)', age: 24, occupation: 'Indie Game Developer', interests: 'Midnight coding, Black cats', idealType: 'Quiet person', datingStyle: 'Tsundere with words', avatarUrl: 'images/guyan.jpg', bgTone: 'bg-slate-700 text-slate-200' },
  yingyin: { codeName: 'Scarlet', realName: 'Song Yingyin (ซ่งอิงอิน)', age: 26, occupation: 'Fashion Editor', interests: 'Haute couture, Espresso', idealType: 'Sophisticated gentleman', datingStyle: 'Elegant romance', avatarUrl: 'images/yingyin.jpg', bgTone: 'bg-pink-200 text-pink-800' },
  jiangyue: { codeName: 'Luna', realName: 'Jiang Yue (เจียงเยว่)', age: 25, occupation: 'Classical Pianist', interests: 'Chopin, Afternoon tea', idealType: 'Romantic soul', datingStyle: 'Soft melodic love', avatarUrl: 'images/jiangyue.jpg', bgTone: 'bg-fuchsia-200 text-fuchsia-800' },
  tangmei: { codeName: 'Mochi (Foco)', realName: 'Tang Mei (ถังเม่ย)', age: 23, occupation: 'Food Vlogger', interests: 'Street food, Baking', idealType: 'Someone who loves eating', datingStyle: 'Cute & energetic', avatarUrl: 'images/tangmei.jpg', bgTone: 'bg-purple-200 text-purple-800' },
  master: { codeName: 'Producer', realName: 'Plan Master', occupation: 'Executive Director of LUMEN', avatarUrl: '', bgTone: 'bg-pink-100 text-fuchsia-700', isSpecial: true },
  consultant: { codeName: 'LUMEN Bot', realName: 'LUMEN Counselor', occupation: 'Relationship Advisor Bot', avatarUrl: '', bgTone: 'bg-emerald-100 text-emerald-800', isSpecial: true }
};

// SubTab Switcher inside MY Tab
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

// Render Unlocked Days History
function renderHistoryTab() {
  const container = document.getElementById('history-days-list');
  container.innerHTML = '';

  for (let d = 1; d <= maxUnlockedDay; d++) {
    const isCurrent = (d === currentDay);
    const item = document.createElement('div');
    item.className = `p-3 rounded-2xl border ${isCurrent ? 'bg-fuchsia-50 border-fuchsia-300' : 'bg-white border-purple-100'} flex justify-between items-center cursor-pointer hover:border-fuchsia-300 transition shadow-sm`;
    item.onclick = () => jumpToHistoryDay(d);
    item.innerHTML = `
      <div>
        <span class="text-xs font-bold text-purple-950">Day ${d}</span>
        <p class="text-[10px] text-purple-400">Episode ${d}</p>
      </div>
      <span class="text-xs ${isCurrent ? 'text-fuchsia-600 font-bold' : 'text-purple-300'}">${isCurrent ? 'Playing' : 'Jump ⏱️'}</span>
    `;
    container.appendChild(item);
  }
}

function jumpToHistoryDay(dayNum) {
  currentDay = dayNum;
  document.getElementById('my-day-indicator').textContent = `${currentDay} / 30`;
  alert(`Jumped back to Day ${dayNum}!`);
  switchTab('chats');
  openGroupChat();
}

// Ending Book Manager
function renderEndingBookTab() {
  const container = document.getElementById('ending-records-list');
  if (endingBookRecords.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-white rounded-2xl border border-purple-100 shadow-sm text-center py-8">
        <p class="text-xs text-purple-400">No saved ending records yet.</p>
        <p class="text-[10px] text-purple-300 mt-1">Complete 30 days to unlock and save your ending story!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  endingBookRecords.forEach((rec, idx) => {
    const item = document.createElement('div');
    item.className = "p-3.5 bg-white rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between";
    item.innerHTML = `
      <div>
        <h4 class="text-xs font-bold text-purple-950">${rec.title}</h4>
        <p class="text-[10px] text-purple-400">Partner: ${rec.partner} · ${rec.date}</p>
      </div>
      <button onclick="viewEndingDetail(${idx})" class="text-xs bg-pink-100 text-fuchsia-600 px-3 py-1 rounded-xl font-bold hover:bg-pink-200">View</button>
    `;
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
  renderEndingBookTab();
  alert('Ending story saved to Ending Book!');
}

function viewEndingDetail(idx) {
  const rec = endingBookRecords[idx];
  alert(`📖 [${rec.title}]\n\nPartner: ${rec.partner}\nDate: ${rec.date}\n\n"${rec.storySummary}"`);
}

function restartGameNewLoop() {
  if (confirm('Are you sure you want to restart the game from Day 1? Your Ending Book records will be saved.')) {
    currentDay = 1;
    maxUnlockedDay = 1;
    document.getElementById('my-day-indicator').textContent = '1 / 30';
    alert('Game reset to Day 1!');
    switchTab('chats');
  }
}

// File Picker Avatar Selector
let tempAvatarDataUrl = '';
function handleAvatarFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    tempAvatarDataUrl = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveMyProfileChanges() {
  if (tempAvatarDataUrl) {
    playerProfile.avatarDataUrl = tempAvatarDataUrl;
  }
  playerProfile.name = document.getElementById('edit-name').value.trim() || 'Lin XinYue';
  playerProfile.occupation = document.getElementById('edit-occ').value.trim();
  playerProfile.interests = document.getElementById('edit-interests').value.trim();
  playerProfile.idealType = document.getElementById('edit-type').value.trim();
  playerProfile.datingStyle = document.getElementById('edit-style').value.trim();

  document.getElementById('people-player-name').textContent = `${playerProfile.name} (You)`;
  document.getElementById('people-player-sub').textContent = `${playerProfile.occupation} · Participant`;
  document.getElementById('my-player-name').textContent = playerProfile.name;

  if (playerProfile.avatarDataUrl) {
    const avatarStyle = `background-image: url('${playerProfile.avatarDataUrl}'); background-size: cover; background-position: center;`;
    document.getElementById('people-player-avatar').setAttribute('style', avatarStyle);
    document.getElementById('people-player-avatar').textContent = '';
    document.getElementById('my-player-avatar').setAttribute('style', avatarStyle);
    document.getElementById('my-player-avatar').textContent = '';
  }

  closeEditMyProfileModal();
}

// Existing Core Logic
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
  document.getElementById('chat-inside-header').classList.add('hidden');
  document.getElementById('room-master').classList.add('hidden');
  document.getElementById('room-group').classList.add('hidden');
  document.getElementById('room-heart').classList.add('hidden');
  document.getElementById('main-header').classList.remove('hidden');
  document.getElementById('tab-chats').classList.remove('hidden');
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
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-bold text-purple-950 truncate">${displayName}</h4>
        <p class="text-[10px] text-purple-400 mt-0.5 truncate">${subTitle}</p>
      </div>
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
  const nameLabel = document.getElementById('modal-profile-name');
  const subLabel = document.getElementById('modal-profile-sub');
  const detailsBox = document.getElementById('modal-profile-details');

  const displayName = (currentDay === 1 && !person.isSpecial) ? person.codeName : person.realName;

  nameLabel.textContent = displayName;
  subLabel.textContent = `${person.codeName} · ${person.occupation || 'Participant'}`;

  if (currentDay >= 2 && person.avatarUrl) {
    avatarBox.style.backgroundImage = `url('${person.avatarUrl}')`;
    avatarBox.textContent = '';
  } else {
    avatarBox.style.backgroundImage = 'none';
    avatarBox.className = `w-32 h-32 rounded-full border-2 border-white/80 shadow-2xl overflow-hidden ${person.bgTone} flex items-center justify-center text-4xl font-bold`;
    avatarBox.textContent = displayName[0];
  }

  detailsBox.innerHTML = `
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

function openMasterChat() {
  document.getElementById('main-header').classList.add('hidden');
  document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
  document.getElementById('chat-inside-header').classList.remove('hidden');
  document.getElementById('active-chat-title').textContent = 'LUMEN Master';
  document.getElementById('room-master').classList.remove('hidden');

  const stream = document.getElementById('master-stream');
  if (stream.children.length === 0) {
    addMasterMsg("Welcome, Participant #8. Submit your Profile Card details.");
    setTimeout(() => renderMasterRegInput(0), 800);
  }
}

const regQuestions = [
  { key: 'name', label: 'Name / Nickname:', placeholder: 'e.g. Lin XinYue', type: 'text' },
  { key: 'age', label: 'Age:', placeholder: 'e.g. 23', type: 'number' },
  { key: 'occupation', label: 'Occupation:', placeholder: 'e.g. Automation Engineer', type: 'text' },
  { key: 'interests', label: 'Interests & Hobbies:', placeholder: 'e.g. Reading, writing', type: 'text' },
  { key: 'idealType', label: 'Ideal Type:', placeholder: 'e.g. Good guy, mature', type: 'text' },
  { key: 'datingStyle', label: 'Dating Style:', placeholder: 'e.g. Slow burn', type: 'text' },
  { key: 'bestQuality', label: 'Best Quality:', placeholder: 'e.g. Friendly', type: 'text' }
];

function renderMasterRegInput(idx) {
  if (idx >= regQuestions.length) {
    addMasterMsg("Registration complete! Profile Card minted.");
    setTimeout(() => {
      addMasterMsg("🔔 NOTICE: TDL All Group lounge has opened! Tap '←' to exit and enter All Group.");
      document.getElementById('master-last-msg').textContent = 'Profile confirmed. Join All Group!';
      document.getElementById('master-unread-dot').classList.add('hidden');
      document.getElementById('channel-group').classList.remove('hidden');
      document.getElementById('master-form-box').innerHTML = `<button onclick="exitActiveChat();" class="w-full bg-gradient-to-r from-fuchsia-400 to-pink-400 text-white font-bold py-2.5 rounded-xl text-xs">Tap ← to Exit</button>`;
    }, 900);
    return;
  }
  const q = regQuestions[idx];
  addMasterMsg(`[Question ${idx+1}/7] ${q.label}`);
  document.getElementById('master-form-box').innerHTML = `
    <div class="flex gap-2">
      <input type="${q.type}" id="reg-input-field" class="flex-1 bg-purple-50/50 border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-purple-950 focus:outline-none" placeholder="${q.placeholder}">
      <button onclick="submitMasterRegInput(${idx})" class="bg-gradient-to-r from-fuchsia-400 to-pink-400 px-4 py-2 rounded-xl text-xs font-bold text-white">Send</button>
    </div>
  `;
  document.getElementById('reg-input-field').focus();
}

function submitMasterRegInput(idx) {
  const val = document.getElementById('reg-input-field').value.trim();
  if (!val) return;
  playerProfile[regQuestions[idx].key] = val;
  addUserBubble(document.getElementById('master-stream'), val);
  document.getElementById('people-player-name').textContent = `${playerProfile.name} (You)`;
  document.getElementById('my-player-name').textContent = playerProfile.name;
  setTimeout(() => renderMasterRegInput(idx + 1), 400);
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

function openGroupChat() {
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
      scheduleGroupNext();
    });
  } else if (item.type === 'card') {
    renderProfileCardInChat(item.key);
    scheduleGroupNext();
  } else if (item.type === 'player_turn') {
    isWaitingForPlayer = true;
    const inputBar = document.getElementById('group-player-input-bar');
    inputBar.classList.remove('hidden');
    document.getElementById('player-free-text').placeholder = item.prompt || 'Type response...';
    document.getElementById('player-free-text').focus();
  } else if (item.type === 'master_event') {
    if (item.eventName === 'TRIGGER_ICEBREAKER') {
      const dayData = window[`day${currentDay}Data`];
      if (dayData && dayData.icebreakerDialogues) {
        dialogueQueue = [...dayData.icebreakerDialogues];
        processGroupQueue();
      }
    } else if (item.eventName === 'TRIGGER_HEART_SIGNAL') {
      document.getElementById('channel-heart').classList.remove('hidden');
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
  const stream = document.getElementById('group-stream');
  const b = document.createElement('div');
  b.className = "flex justify-center my-2 chat-bubble";
  b.innerHTML = `<div class="bg-purple-100/60 text-purple-600 border border-purple-200/50 px-3.5 py-1.5 rounded-full text-[11px] max-w-[90%] text-center">${txt}</div>`;
  stream.appendChild(b);
  stream.scrollTop = stream.scrollHeight;
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

function createPolaroidCardHTML(cardData, isPlayer = false) {
  const nameAge = isPlayer ? `${playerProfile.name}, ${playerProfile.age}` : `${cardData.realName}, ${cardData.age}`;
  const occ = isPlayer ? playerProfile.occupation : cardData.occupation;
  const interests = isPlayer ? playerProfile.interests : cardData.interests;
  const type = isPlayer ? playerProfile.idealType : cardData.idealType;
  const dating = isPlayer ? playerProfile.datingStyle : cardData.datingStyle;
  const best = isPlayer ? playerProfile.bestQuality : cardData.bestQuality;
  const desc = isPlayer ? 'Aesthetic candid: Soft shoulder sweater, side profile.' : cardData.photoDesc;

  return `
    <div class="bg-white text-purple-950 rounded-xl p-4 shadow-sm border border-purple-100 max-w-sm mx-auto my-2 font-typewriter">
      <div class="flex justify-between items-center text-[10px] text-purple-300 border-b border-purple-100 pb-1.5 mb-2.5">
        <span>Day ${currentDay}. Profile : ${nameAge.split(',')[0]}</span>
        <span class="tracking-wider text-pink-400">30 DAYS TO LOVE</span>
      </div>
      <div class="bg-purple-50/60 rounded-lg aspect-[4/3] w-full overflow-hidden border border-purple-100 mb-3 p-3 flex flex-col justify-end relative shadow-inner">
        <div class="bg-purple-950/70 backdrop-blur-xs p-2.5 rounded text-[10px] text-purple-100 leading-relaxed font-sans">📷 <em>${desc}</em></div>
      </div>
      <div class="space-y-1.5 text-xs text-purple-900">
        <div class="border-b border-purple-100 pb-1 flex justify-between"><span class="font-bold underline text-purple-400">Name/Age:</span><span class="font-semibold text-purple-950">${nameAge}</span></div>
        <div class="border-b border-purple-100 pb-1 flex justify-between"><span class="font-bold underline text-purple-400">Occupation:</span><span>${occ}</span></div>
        <div class="border-b border-purple-100 pb-1"><span class="font-bold underline text-purple-400 block mb-0.5">Interests:</span><span class="inline-block bg-purple-100/60 text-purple-900 px-2 py-0.5 rounded text-[11px]">${interests}</span></div>
        <div class="border-b border-purple-100 pb-1"><span class="font-bold underline text-purple-400 block mb-0.5">Type:</span><div class="bg-purple-100/60 text-purple-900 p-1.5 rounded text-[11px]">${type}</div></div>
        <div class="border-b border-purple-100 pb-1"><span class="font-bold underline text-purple-400 block mb-0.5">Dating Style:</span><div class="bg-purple-100/60 text-purple-900 p-1.5 rounded text-[11px]">${dating}</div></div>
        <div><span class="font-bold underline text-purple-400 block mb-0.5">Best Quality:</span><div class="bg-purple-100/60 text-purple-900 px-2 py-0.5 rounded text-[11px]">${best}</div></div>
      </div>
    </div>
  `;
}

function renderProfileCardInChat(key) {
  const b = document.createElement('div');
  b.className = "chat-bubble my-2";
  b.innerHTML = (key === 'player') ? createPolaroidCardHTML(null, true) : createPolaroidCardHTML(contactsData[key], false);
  document.getElementById('group-stream').appendChild(b);
  document.getElementById('group-stream').scrollTop = document.getElementById('group-stream').scrollHeight;
}

function openHeartSendingRoom() {
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
}
