window.day1Data = {
  day: 1,
  title: "Shanghai First Night",
  dialogues: [
    { type: 'sys', text: 'Now, feel free to begin the conversation.' },
    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'Hey everyone!! Finally the room opened 🎉' },
    { type: 'msg', sender: 'Mochi', tone: 'bg-purple-200 text-purple-800', text: 'hiiii everyone!! OMG there are so many of us here 😮' },
    { type: 'msg', sender: 'Scarlet', tone: 'bg-pink-200 text-pink-800', text: 'Hello. Nice to meet everyone on this first night.' },
    { type: 'msg', sender: 'Black Cat', tone: 'bg-slate-700 text-slate-200', text: '...so many notification dings already. It’s loud.' },
    { type: 'msg', sender: 'Mr. Horizon', tone: 'bg-purple-200 text-purple-800', text: 'Good evening. It is quite late, hope nobody had a rough arrival in Shanghai.' },
    { type: 'msg', sender: 'Velvet Noir', tone: 'bg-indigo-950 text-purple-200', text: 'Evening all. The weather tonight in the city is quite pleasant.' },
    { type: 'msg', sender: 'Luna', tone: 'bg-fuchsia-200 text-fuchsia-800', text: 'Hello! I was so nervous waiting for the room to activate haha ☺️' },
    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'Me too Luna! My hands were literally shaking while holding my phone!' },
    { type: 'msg', sender: 'Mr. Horizon', tone: 'bg-purple-200 text-purple-800', text: 'Take it easy. We have 30 days ahead of us. No need to rush.' },

    // พักให้ผู้เล่นพิมพ์อิสระ
    { type: 'player_turn', prompt: 'Say hello to everyone in the group...' },

    { type: 'msg', sender: 'Mochi', tone: 'bg-purple-200 text-purple-800', text: 'Wait wait, since we are all using code names, let\'s guess something funny first!' },
    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'Ooh what is it Mochi? Tell us!' },
    { type: 'msg', sender: 'Mochi', tone: 'bg-purple-200 text-purple-800', text: 'Which of the two is the fact then... Handsome or responsible?' },
    { type: 'msg', sender: 'Scarlet', tone: 'bg-pink-200 text-pink-800', text: 'Hoping for the former ☺️' },
    { type: 'msg', sender: 'Luna', tone: 'bg-fuchsia-200 text-fuchsia-800', text: 'It\'s definitely the former right?! Haha' },
    { type: 'msg', sender: 'Velvet Noir', tone: 'bg-indigo-950 text-purple-200', text: 'Probably the former. But responsibility carries more weight long term.' },
    { type: 'msg', sender: 'Mr. Horizon', tone: 'bg-purple-200 text-purple-800', text: 'Not quite... why can\'t someone strive to be both?' },
    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'Hahaha Mr. Horizon is definitely trying to be both!' },
    { type: 'msg', sender: 'Black Cat', tone: 'bg-slate-700 text-slate-200', text: '...pointless debate.' },

    // พักให้ผู้เล่นพิมพ์ตอบคำถาม
    { type: 'player_turn', prompt: 'Share your thoughts on handsome vs responsible...' },

    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'Anyone hungry right now? I\'m craving cheese milk tea so badly 🧋' },
    { type: 'msg', sender: 'Mr. Horizon', tone: 'bg-purple-200 text-purple-800', text: 'Drinking sweet tea this late will keep you awake. Warm water is safer.' },

    // อีเวนต์เริ่มเผยการ์ดโปรไฟล์
    { type: 'master_event', eventName: 'TRIGGER_ICEBREAKER' }
  ],
  
  // บทรอบเผยการ์ดโปรไฟล์
  icebreakerDialogues: [
    { type: 'sys', text: '📢 [LUMEN MASTER]: It is 21:00. Time for the Icebreaker: Profile Cards Reveal.' },
    { type: 'card', key: 'chenxu' },
    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'WHOA! Look at that jawline and blue knit sweater! So aesthetic!' },
    { type: 'msg', sender: 'Mr. Horizon', tone: 'bg-purple-200 text-purple-800', text: 'Yes, it is mine. My real name is Chen Xu (เฉินซวี่). Nice to meet you all.' },

    { type: 'card', key: 'xiyao' },
    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'Eeeek! Busted!! Yes, I am Xia Xiyao (เซี่ยซีเหยา)!' },

    { type: 'card', key: 'guyan' },
    { type: 'msg', sender: 'Black Cat', tone: 'bg-slate-700 text-slate-200', text: '...Yeah. Gu Yan (กู้เยี่ยน). Game programmer.' },

    { type: 'card', key: 'wenjun' },
    { type: 'msg', sender: 'Velvet Noir', tone: 'bg-indigo-950 text-purple-200', text: 'Guessed right. I am Wen Jun (เวินจวิ้น). Glad to meet you all.' },

    { type: 'card', key: 'player' },
    { type: 'msg', sender: 'Mr. Horizon', tone: 'bg-purple-200 text-purple-800', text: 'Automation Engineer... It feels grounded, sincere, and very rare.' },
    { type: 'msg', sender: 'Golden Puppy', tone: 'bg-sky-200 text-sky-800', text: 'Waaah such a pretty candid photo!! "Slow burn, fall slow but fall harder"!!' },

    { type: 'player_turn', prompt: 'Everyone is complimenting your card! Reply back to them...' },

    { type: 'sys', text: '🔒 23:55 PM: TDL All Group lounge is now officially closing for Day 1.' },
    { type: 'master_event', eventName: 'TRIGGER_HEART_SIGNAL' }
  ]
};
