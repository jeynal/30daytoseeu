// Global State & Database
let currentDay = 1;
let dialogueQueue = [];
let isWaitingForPlayer = false;
let waitingForTap = false;
let speedMode = 0; // 0=Slow, 1=Normal, 2=Tap
const delays = [1700, 950, 0];

let playerProfile = {
  name: 'Lin XinYue', age: 23, occupation: 'Automation Engineer',
  interests: 'Reading, writing, listening, watching',
  idealType: 'Good guy, taller than me, mature',
  datingStyle: 'Slow burn, fall slow but fall harder', bestQuality: 'Honestly, funny, friendly'
};

const boys = {
  chenxu: { codeName: 'Mr. Horizon', realName: 'Chen Xu (เฉินซวี่)', age: 29, occupation: 'Lead Architect', interests: 'Structure sketches, Coffee', idealType: 'Someone who feels like peace', datingStyle: 'More action than words', bestQuality: 'Steadiness', photoDesc: 'Aesthetic candid: Blue sweater neck, sharp jawline.', bgTone: 'bg-purple-200 text-purple-800', score: 0 },
  xiyao: { codeName: 'Golden Puppy', realName: 'Xia Xiyao (เซี่ยซีเหยา)', age: 22, occupation: 'Idol Vocalist', interests: 'Dance, Cheese milk tea', idealType: 'Sweet older sister', datingStyle: 'Clingy & affectionate 24/7', bestQuality: 'Pure heart', photoDesc: 'Aesthetic candid: Soft pastel blue knit.', bgTone: 'bg-sky-200 text-sky-800', score: 0 },
  wenjun: { codeName: 'Velvet Noir', realName: 'Wen Jun (เวินจวิ้น)', age: 28, occupation: 'Gallery Owner', interests: 'Vintage wine, Jazz', idealType: 'Lovely little one', datingStyle: 'Gentle and attentive', bestQuality: 'Heart-racing gaze', photoDesc: 'Aesthetic candid: Dark collared shirt, collarbone.', bgTone: 'bg-indigo-950 text-purple-200', score: 0 },
  guyan: { codeName: 'Black Cat', realName: 'Gu Yan (กู้เยี่ยน)', age: 24, occupation: 'Game Developer', interests: 'Midnight coding, Black cats', idealType: 'Quiet person', datingStyle: 'Tsundere with words', bestQuality: 'Quiet attentiveness', photoDesc: 'Aesthetic candid: Dark cap, sharp side profile.', bgTone: 'bg-slate-700 text-slate-200', score: 0 }
};

// UI Navigation
function switchTab(tabKey) {
  exitActiveChat();
  document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('text-fuchsia-500'); b.classList.add('text-purple-300'); });

  const targetPage = document.getElementById(`tab-${tabKey}`);
  const targetBtn = document.getElementById(`nav-${tabKey}`);
  if (targetPage) targetPage.classList.remove('hidden');
  if (targetBtn) { targetBtn.classList.add('text-fuchsia-500'); targetBtn.classList.remove('text-purple-300'); }

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

function toggleSpeed() {
  speedMode = (speedMode + 1) % 3;
  document.getElementById('speed-label').textContent = ['Slow', 'Normal', 'Tap Mode'][speedMode];
  document.getElementById('next-tap-bar').classList.toggle('hidden', speedMode !== 2);
}

// Master Registration
const regQuestions = [
  { key: 'name', label: 'Name / Nickname:', placeholder: 'e.g. Lin XinYue', type: 'text' },
  { key: 'age', label: 'Age:', placeholder: 'e.g. 23', type: 'number' },
  { key: 'occupation', label: 'Occupation:', placeholder: 'e.g. Automation Engineer', type: 'text' },
  { key: 'interests', label: 'Interests & Hobbies:', placeholder: 'e.g. Reading, writing', type: 'text' },
  { key: 'idealType', label: 'Ideal Type:', placeholder: 'e.g. Good guy, mature', type: 'text' },
  { key: 'datingStyle', label: 'Dating Style:', placeholder: 'e.g. Slow burn', type: 'text' },
  { key: 'bestQuality', label: 'Best Quality:', placeholder: 'e.g. Friendly', type: 'text' }
];

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

// Group Chat Engine (ดึงข้อมูลแยกวันจาก window[`day${currentDay}Data`])
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
  if (speedMode === 2) {
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
  if (speedMode === 2) { cb(); return; }
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

// Profile Card Renderer
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
  b.innerHTML = (key === 'player') ? createPolaroidCardHTML(null, true) : createPolaroidCardHTML(boys[key], false);
  document.getElementById('group-stream').appendChild(b);
  document.getElementById('group-stream').scrollTop = document.getElementById('group-stream').scrollHeight;
}

// Heart Signal System
let targetGuyKey = null;

function openHeartSendingRoom() {
  document.getElementById('main-header').classList.add('hidden');
  document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
  document.getElementById('chat-inside-header').classList.remove('hidden');
  document.getElementById('active-chat-title').textContent = '<Heart Sending>';
  document.getElementById('room-heart').classList.remove('hidden');

  const targetList = document.getElementById('heart-target-list');
  targetList.innerHTML = '';
  Object.entries(boys).forEach(([k, guy]) => {
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

  const guy = boys[targetGuyKey];
  const reactions = {
    chenxu: `Chen Xu (เฉินซวี่): "Mmh, I received your secret note. Get some rest, let's talk tomorrow."`,
    xiyao: `Xia Xiyao (เซี่ยซีเหยา): "Did jiejie really pick me!? I'm smiling so hard right now!"`,
    wenjun: `Wen Jun (เวินจวิ้น): "Mmh... sending this kind of message, little one? Sleep well tonight."`,
    guyan: `Gu Yan (กู้เยี่ยน): "...Who said I was waiting for your note? Good night."`
  };

  document.getElementById('heart-result-box').classList.remove('hidden');
  document.getElementById('heart-reply-view').innerHTML = `<span class="text-[10px] text-purple-400 block mb-1">Delivered to ${guy.realName}:</span>"${msg}"<div class="mt-2 pt-2 border-t border-purple-100 text-fuchsia-600 font-semibold">${reactions[targetGuyKey]}</div>`;
}

function renderPeopleTab() {
  const list = document.getElementById('people-friends-list');
  list.innerHTML = '';
  const friends = [
    { name: boys.chenxu.realName, code: 'Mr. Horizon', tone: boys.chenxu.bgTone },
    { name: boys.xiyao.realName, code: 'Golden Puppy', tone: boys.xiyao.bgTone },
    { name: boys.wenjun.realName, code: 'Velvet Noir', tone: boys.wenjun.bgTone },
    { name: boys.guyan.realName, code: 'Black Cat', tone: boys.guyan.bgTone },
    { name: 'Plan Master', code: 'Producer', tone: 'bg-pink-100 text-fuchsia-700' }
  ];
  friends.forEach(f => {
    const item = document.createElement('div');
    item.className = "p-3.5 px-4 flex items-center space-x-3.5 hover:bg-purple-50/50 transition";
    item.innerHTML = `<div class="w-11 h-11 rounded-full ${f.tone} flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100 shadow-sm">${f.code[0]}</div><div><h4 class="text-xs font-bold text-purple-950">${f.name}</h4><p class="text-[10px] text-purple-400">${f.code}</p></div>`;
    list.appendChild(item);
  });
}
