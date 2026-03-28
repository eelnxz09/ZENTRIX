import html2canvas from 'html2canvas';
import zkLogoUrl from '../assets/zk-logo.png';

/**
 * Pre-loads the ZK logo and converts it to a base64 data URL.
 * This completely eliminates CORS / 404 issues with html2canvas.
 */
let cachedLogoDataUrl = null;

async function getLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        cachedLogoDataUrl = canvas.toDataURL('image/png');
        resolve(cachedLogoDataUrl);
      } catch (e) {
        // If canvas is tainted, fall back to the CSS logo
        console.warn('Logo canvas tainted, using CSS fallback');
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn('Logo failed to load, using CSS fallback');
      resolve(null);
    };
    img.src = zkLogoUrl;
  });
}

/**
 * Returns either an <img> tag with the base64 logo, or a CSS fallback badge.
 */
function logoHtml(logoDataUrl, size = 150) {
  if (logoDataUrl) {
    return `<img src="${logoDataUrl}" style="width:${size}px;height:${size}px;object-fit:contain;" />`;
  }
  // Pure CSS fallback
  return `
    <div style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #FF2D78, #FF4655);box-shadow:0 0 30px rgba(255,45,120,0.6);border-radius:24px;transform:rotate(-10deg);border:4px solid #FFF;">
        <span style="font-family:'Orbitron',monospace;color:#FFF;font-size:${Math.round(size*0.43)}px;font-weight:900;letter-spacing:-6px;font-style:italic;">ZK</span>
    </div>`;
}

// Template generators - each receives data + the pre-loaded logo HTML string
function makeTemplates(logo) {
  return {
    winner: (data) => `
      <div style="width:1920px;height:1080px;background:#05050A;color:white;display:flex;flex-direction:column;justify-content:center;align-items:center;border:15px solid #E63946;font-family:'Space Grotesk',sans-serif;box-sizing:border-box;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at top right, rgba(230,57,70,0.15), transparent 50%);pointer-events:none;"></div>
          ${logo(180)}
          <h1 style="font-family:'Orbitron',monospace;color:#E63946;font-size:60px;letter-spacing:10px;margin-bottom:10px;text-align:center;">ZENTRIX ESPORTS INDIA</h1>
          <h2 style="font-size:45px;color:#fff;margin-bottom:40px;letter-spacing:5px;font-weight:900;">CHAMPIONSHIP AWARD</h2>
          <div style="width:800px;height:2px;background:linear-gradient(90deg, transparent, #E63946, transparent);margin-bottom:40px;"></div>
          <p style="font-size:30px;color:#A8B2C1;letter-spacing:2px;font-weight:700;">PROUDLY PRESENTED TO</p>
          <p style="font-size:110px;font-family:'Orbitron',monospace;color:#FFFFFF;margin:10px 0;text-shadow:0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(230,57,70,0.6);">${data.playerName}</p>
          <p style="font-size:28px;color:#A8B2C1;margin-top:20px;">FOR ATTAINING <strong style="color:#E63946;font-size:40px;">PLACE #${data.placement}</strong> IN</p>
          <p style="font-size:60px;color:#fff;margin:10px 0;font-weight:900;text-transform:uppercase;">${data.tournamentName} - ${data.game}</p>
          <div style="display:flex;justify-content:space-between;width:70%;margin-top:80px;border-top:1px solid rgba(255,255,255,0.2);padding-top:30px;">
              <div style="text-align:center;"><p style="font-size:18px;color:#888;letter-spacing:2px;text-transform:uppercase;">Date Issued</p><p style="font-size:26px;font-family:'Orbitron',monospace;font-weight:700;">${data.date}</p></div>
              <div style="text-align:center;"><p style="font-size:18px;color:#888;letter-spacing:2px;text-transform:uppercase;">Sign / Auth</p><p style="font-size:26px;font-family:'Outfit',sans-serif;color:#E63946;font-weight:900;font-style:italic;">ZENTRIX HQ</p></div>
          </div>
      </div>`,

    mvp: (data) => `
      <div style="width:1920px;height:1080px;background:linear-gradient(135deg, #FFB703 0%, #FB8500 50%, #023047 50%, #000000 100%);color:black;display:flex;flex-direction:row;align-items:center;font-family:'Outfit',sans-serif;box-sizing:border-box;position:relative;overflow:hidden;border:10px solid #FB8500;">
          <div style="width:40%;height:100%;padding:100px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2;">
              ${logo(150)}
              <h1 style="color:#000;font-size:55px;font-weight:900;letter-spacing:4px;line-height:1.1;margin-bottom:20px;text-transform:uppercase;">ZENTRIX ESPORTS<br/>INDIA</h1>
              <h2 style="font-size:90px;color:#000;font-weight:900;letter-spacing:2px;line-height:1;margin-bottom:0;">M.V.P</h2>
              <h3 style="font-size:35px;color:#fff;background:#000;display:inline-block;padding:10px 20px;margin-top:20px;">MOST VALUABLE PLAYER</h3>
          </div>
          <div style="width:60%;height:100%;padding:100px;display:flex;flex-direction:column;justify-content:center;color:white;text-align:right;position:relative;z-index:2;">
              <p style="font-size:26px;color:#FFB703;margin-bottom:10px;font-weight:700;letter-spacing:2px;">AWARDED PROUDLY TO</p>
              <p style="font-size:110px;font-family:'Orbitron',monospace;color:#FFF;margin:0;font-weight:900;text-shadow: 4px 4px 0px #FB8500;">${data.playerName}</p>
              <div style="width:100%;height:2px;background:#FB8500;margin:40px 0;"></div>
              <p style="font-size:24px;color:#ccc;line-height:1.5;">For demonstrating extraordinary skill,<br/>precision, and leadership at the</p>
              <p style="font-size:45px;color:#FFB703;font-weight:900;margin:20px 0;text-transform:uppercase;">${data.tournamentName} - ${data.game}</p>
              <div style="display:flex;justify-content:flex-end;gap:80px;margin-top:80px;">
                  <div style="text-align:right;"><p style="font-size:16px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Date</p><p style="font-size:22px;font-family:'Orbitron',monospace;">${data.date}</p></div>
                  <div style="text-align:right;"><p style="font-size:16px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Signature</p><h4 style="font-size:26px;color:#fff;margin:0;font-family:'Caveat',cursive;">Zentrix Admin</h4></div>
              </div>
          </div>
          <div style="position:absolute;top:-500px;left:700px;width:200px;height:2000px;background:#FFF;transform:rotate(35deg);opacity:0.05;"></div>
      </div>`,

    cyberpunk: (data) => `
      <div style="width:1920px;height:1080px;background:#080A10;color:#00E5FF;display:flex;flex-direction:column;font-family:'Space Grotesk',sans-serif;box-sizing:border-box;position:relative;border:40px solid #111;padding:80px;">
          <div style="position:absolute;top:0;left:0;width:100%;height:100%;background-image:linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px);background-size:60px 60px;opacity:0.03;pointer-events:none;"></div>
          <div style="position:absolute;top:30px;right:40px;text-align:right;z-index:10;">
              <p style="font-size:14px;color:#F012BE;letter-spacing:5px;font-family:'Orbitron',monospace;">SYS.CERT.AUTHORIZATION // VERIFIED</p>
              <p style="font-size:14px;color:#444;letter-spacing:2px;font-family:'Orbitron',monospace;">UID: ${data.certId || '000000'}</p>
          </div>
          <div style="display:flex;align-items:center;gap:30px;margin-bottom:60px;z-index:2;">
              ${logo(100)}
              <div>
                 <h1 style="font-family:'Orbitron',monospace;color:#F012BE;font-size:40px;letter-spacing:8px;margin:0;">ZENTRIX ESPORTS INDIA</h1>
                 <p style="color:#00E5FF;font-size:18px;letter-spacing:10px;margin:5px 0 0 0;font-weight:700;">DIGITAL CERTIFICATE OF ELITE PERFORMANCE</p>
              </div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;border-left:5px solid #F012BE;padding-left:60px;margin-left:20px;z-index:2;">
              <p style="font-size:24px;color:#A8B2C1;letter-spacing:4px;">RECOGNIZED OPERATOR:</p>
              <h2 style="font-size:120px;font-family:'Orbitron',monospace;color:#FFF;margin:10px 0;text-shadow: -3px 0 #00E5FF, 3px 0 #F012BE;">${data.playerName}</h2>
              <div style="display:flex;align-items:center;gap:20px;margin-top:20px;">
                  <span style="background:#F012BE;color:#000;padding:5px 15px;font-weight:900;font-size:20px;text-transform:uppercase;">RANK ACHV: #${data.placement}</span>
                  <span style="border:2px solid #00E5FF;color:#00E5FF;padding:5px 15px;font-weight:900;font-size:20px;text-transform:uppercase;">G-MOD: ${data.game}</span>
              </div>
              <p style="font-size:40px;color:#FFF;margin:40px 0 0 0;font-weight:700;">${data.tournamentName}</p>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;z-index:2;">
              <div><p style="color:#444;font-size:12px;font-family:'Orbitron',monospace;letter-spacing:2px;">TIMESTAMP</p><p style="color:#00E5FF;font-size:24px;font-family:'Orbitron',monospace;">${data.date}</p></div>
              <div style="width:200px;height:60px;background:repeating-linear-gradient(45deg, #00E5FF, #00E5FF 10px, #080A10 10px, #080A10 20px);"></div>
          </div>
      </div>`,

    tactician: (data) => `
      <div style="width:1920px;height:1080px;background:#0F1923;color:#ECE8E1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;position:relative;border-top:30px solid #FF4655;border-bottom:30px solid #111;">
          <div style="position:absolute;top:0;left:0;width:300px;height:300px;background:#FF4655;clip-path:polygon(0 0, 100% 0, 0 100%);"></div>
          <div style="position:absolute;bottom:0;right:0;width:400px;height:400px;background:#111;clip-path:polygon(100% 100%, 100% 0, 0 100%);"></div>
          <div style="position:absolute;bottom:0;right:70px;width:300px;height:300px;background:#FF4655;clip-path:polygon(100% 100%, 100% 0, 0 100%);"></div>
          ${logo(130)}
          <h1 style="font-family:'Orbitron',monospace;color:#FF4655;font-size:45px;letter-spacing:15px;margin-bottom:60px;font-weight:900;">ZENTRIX ESPORTS INDIA</h1>
          <div style="background:#ECE8E1;width:1000px;padding:60px 40px;text-align:center;box-shadow: 20px 20px 0px rgba(0,0,0,0.5);border:2px solid #333;">
              <p style="color:#FF4655;font-size:20px;font-weight:900;letter-spacing:8px;margin-bottom:20px;">CERTIFICATE OF ACHIEVEMENT</p>
              <p style="color:#111;font-size:24px;margin-bottom:10px;">PROUDLY PRESENTED TO</p>
              <h2 style="font-size:80px;color:#111;margin:10px 0;font-weight:900;font-family:'Orbitron',monospace;text-transform:uppercase;">${data.playerName}</h2>
              <div style="width:100px;height:4px;background:#FF4655;margin:30px auto;"></div>
              <p style="color:#444;font-size:20px;line-height:1.6;max-width:800px;margin:0 auto;">For demonstrating exemplary strategic execution and teamwork, leading to a <strong style="color:#0F1923;font-size:26px;">Place #${data.placement}</strong> finish in the official Zentrix competition.</p>
          </div>
          <div style="margin-top:60px;text-align:center;">
               <p style="font-size:40px;color:#ECE8E1;font-weight:900;letter-spacing:5px;">${data.tournamentName} - ${data.game}</p>
               <p style="font-size:18px;color:#888;margin-top:10px;font-family:'Orbitron',monospace;letter-spacing:4px;">DATE: ${data.date}</p>
          </div>
      </div>`,

    participation: (data) => `
      <div style="width:1920px;height:1080px;background:#FAFAFA;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;position:relative;border:1px solid #E5E7EB;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;width:100%;height:400px;background:linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);clip-path:polygon(0 0, 100% 0, 100% 100%, 0 80%);"></div>
          <div style="z-index:2;">${logo(140)}</div>
          <h1 style="color:#374151;font-size:40px;letter-spacing:10px;margin-bottom:10px;font-weight:900;z-index:2;text-align:center;">ZENTRIX ESPORTS INDIA</h1>
          <h2 style="font-size:60px;color:#111;margin-bottom:60px;font-weight:900;letter-spacing:4px;z-index:2;">CERTIFICATE OF PARTICIPATION</h2>
          <p style="font-size:26px;color:#6B7280;z-index:2;">This acknowledges that</p>
          <p style="font-size:90px;color:#111;font-weight:900;margin:10px 0;z-index:2;font-family:'Orbitron',monospace;">${data.playerName}</p>
          <p style="font-size:24px;color:#6B7280;max-width:900px;text-align:center;line-height:1.6;margin-top:20px;z-index:2;">has successfully participated and demonstrated honorable sportsmanship during the official events held at</p>
          <p style="font-size:40px;color:#374151;font-weight:900;margin:30px 0;z-index:2;">${data.tournamentName} <span style="color:#3B82F6;">| ${data.game}</span></p>
          <div style="display:flex;justify-content:space-around;width:800px;margin-top:60px;border-top:2px solid #E5E7EB;padding-top:40px;z-index:2;">
               <div style="text-align:center;"><p style="font-family:'Caveat',cursive;font-size:40px;color:#111;margin:0;">Zentrix Admin</p><p style="font-size:16px;color:#6B7280;text-transform:uppercase;letter-spacing:2px;border-top:1px solid #D1D5DB;padding-top:5px;margin-top:5px;">League Director</p></div>
               <div style="text-align:center;"><p style="font-family:'Space Grotesk',sans-serif;font-size:28px;color:#111;margin:12px 0 0 0;">${data.date}</p><p style="font-size:16px;color:#6B7280;text-transform:uppercase;letter-spacing:2px;border-top:1px solid #D1D5DB;padding-top:5px;margin-top:5px;">Date</p></div>
          </div>
      </div>`,

    sharpshooter: (data) => `
      <div style="width:1920px;height:1080px;background:#0c0f12;color:white;display:flex;flex-direction:row;font-family:'Space Grotesk',sans-serif;border:10px solid #222;">
          <div style="width:30%;height:100%;border-right:1px solid #333;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;background:radial-gradient(circle, #1a1f26 0%, #0c0f12 100%);">
              ${logo(200)}
              <div style="width:100px;height:100px;border:4px solid #22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:20px 0;">
                  <div style="width:10px;height:10px;background:#22c55e;border-radius:50%;"></div>
              </div>
              <h3 style="color:#22c55e;font-size:30px;font-weight:900;letter-spacing:6px;text-align:center;">SHARPSHOOTER<br/>AWARD</h3>
          </div>
          <div style="width:70%;height:100%;padding:100px;display:flex;flex-direction:column;justify-content:center;">
               <h1 style="color:#666;font-size:25px;letter-spacing:10px;margin-bottom:10px;font-weight:900;">ZENTRIX ESPORTS INDIA</h1>
               <p style="font-size:30px;color:#999;margin-top:60px;">RECOGNIZED LETHALITY:</p>
               <h2 style="font-size:120px;color:white;font-weight:900;font-family:'Orbitron',monospace;margin:0;">${data.playerName}</h2>
               <div style="width:300px;height:10px;background:#22c55e;margin:40px 0;"></div>
               <p style="font-size:45px;color:white;font-weight:700;">${data.tournamentName}</p>
               <p style="font-size:25px;color:#22c55e;font-weight:900;letter-spacing:4px;margin-top:10px;text-transform:uppercase;">${data.game} / PLACE #${data.placement}</p>
               <p style="font-size:20px;color:#666;margin-top:100px;">AUTHORIZED: ZENTRIX HQ / DATE: ${data.date}</p>
          </div>
      </div>`,

    igl: (data) => `
      <div style="width:1920px;height:1080px;background:#050505;color:#EAB308;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;position:relative;border:4px solid #EAB308;outline:20px solid #050505;outline-offset:-30px;">
          ${logo(140)}
          <h1 style="color:#fff;font-size:30px;letter-spacing:10px;font-weight:700;margin-bottom:5px;">ZENTRIX ESPORTS INDIA</h1>
          <h2 style="color:#EAB308;font-size:60px;letter-spacing:6px;font-weight:900;margin-bottom:60px;font-family:'Orbitron',serif;">IGL EXCELLENCE AWARD</h2>
          <p style="color:#888;font-size:22px;letter-spacing:2px;">BESTOWED UPON LEADER:</p>
          <p style="font-size:100px;color:#fff;font-family:'Orbitron',serif;margin:10px 0;">${data.playerName}</p>
          <p style="color:#aaa;font-size:22px;max-width:800px;text-align:center;line-height:1.6;margin:30px 0;">For exemplary in-game leadership, immaculate shot-calling, and guiding the squad to <strong style="color:#EAB308;">Place #${data.placement}</strong>.</p>
          <p style="font-size:40px;color:#EAB308;font-weight:900;margin:30px 0;letter-spacing:3px;">${data.tournamentName} - ${data.game}</p>
          <div style="display:flex;gap:400px;margin-top:80px;">
              <div style="text-align:center;border-top:1px solid #555;padding-top:10px;"><p style="font-size:24px;color:#fff;">${data.date}</p><p style="color:#888;letter-spacing:2px;font-size:14px;">DATE</p></div>
              <div style="text-align:center;border-top:1px solid #555;padding-top:10px;"><p style="font-size:24px;color:#EAB308;font-family:'Caveat',cursive;">Zentrix Directors</p><p style="color:#888;letter-spacing:2px;font-size:14px;">AUTHORITY</p></div>
          </div>
      </div>`,

    rookie: (data) => `
      <div style="width:1920px;height:1080px;background:#0ea5e9;color:#fff;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:120px;font-family:'Outfit',sans-serif;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-20%;right:-10%;width:800px;height:140%;background:#0284c7;transform:skewX(-20deg);z-index:1;"></div>
          <div style="position:relative;z-index:2;width:100%;">
              <h1 style="color:#fff;font-size:24px;letter-spacing:8px;font-weight:900;margin-bottom:40px;">ZENTRIX ESPORTS INDIA</h1>
              <h2 style="font-size:100px;color:#fff;font-weight:900;letter-spacing:2px;margin:0;line-height:1;text-shadow:5px 5px 0px #0369a1;">ROOKIE OF<br/>THE YEAR</h2>
              <div style="width:100px;height:10px;background:#fff;margin:40px 0;"></div>
              <p style="font-size:30px;color:#e0f2fe;font-weight:700;">OUTSTANDING NEW TALENT:</p>
              <p style="font-size:140px;font-family:'Orbitron',monospace;color:#fff;margin:0;font-weight:900;letter-spacing:-2px;">${data.playerName}</p>
              <div style="display:flex;align-items:center;gap:30px;margin-top:60px;">
                   <p style="font-size:40px;color:#fff;font-weight:900;">${data.tournamentName}</p>
                   <span style="background:#fff;color:#0ea5e9;font-weight:900;font-size:24px;padding:10px 20px;border-radius:10px;">${data.game} / PLACE #${data.placement}</span>
              </div>
              <p style="font-size:20px;color:#bae6fd;margin-top:60px;font-weight:700;letter-spacing:4px;">ISSUED: ${data.date}</p>
          </div>
          <div style="position:absolute;bottom:100px;right:100px;z-index:2;">${logo(250)}</div>
      </div>`,

    clutch: (data) => `
      <div style="width:1920px;height:1080px;background:#180018;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;border:10px solid #d946ef;box-shadow:inset 0 0 100px rgba(217,70,239,0.3);">
          ${logo(180)}
          <h1 style="color:#d946ef;font-size:28px;letter-spacing:15px;margin-bottom:40px;font-weight:900;">ZENTRIX ESPORTS INDIA</h1>
          <h2 style="font-family:'Orbitron',monospace;font-size:80px;color:#facc15;margin-bottom:10px;text-transform:uppercase;text-shadow:0 0 40px #facc15;">CLUTCH MASTER</h2>
          <p style="font-size:24px;color:#fdf4ff;">AGAINST ALL ODDS, VICTORY WAS SECURED BY</p>
          <p style="font-size:120px;color:#fff;font-weight:900;margin:20px 0;letter-spacing:5px;">${data.playerName}</p>
          <div style="width:800px;height:1px;background:linear-gradient(90deg, transparent, #d946ef, transparent);margin:30px 0;"></div>
          <p style="font-size:35px;color:#f0abfc;">${data.tournamentName} - ${data.game}</p>
          <p style="font-size:25px;color:#facc15;margin-top:15px;font-weight:700;">PLACE / RANK: #${data.placement}</p>
          <p style="font-size:18px;color:#86198f;margin-top:80px;letter-spacing:8px;">VERIFIED LOG TIMESTAMP: ${data.date}</p>
      </div>`,

    honneur: (data) => `
      <div style="width:1920px;height:1080px;background:#E2E8F0;color:#0F172A;display:flex;flex-direction:row;align-items:center;font-family:'Outfit',sans-serif;position:relative;border:40px solid #F8FAFC;">
          <div style="width:50%;height:100%;padding:100px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid #CBD5E1;">
              ${logo(120)}
              <h1 style="font-size:20px;letter-spacing:10px;color:#475569;margin-bottom:20px;font-weight:900;">ZENTRIX ESPORTS INDIA</h1>
              <h2 style="font-size:75px;font-weight:900;line-height:1.1;color:#0F172A;margin-bottom:40px;">ESPORTS<br/>HONOR ROLL</h2>
              <p style="font-size:22px;color:#475569;line-height:1.6;">This prestigious documentation is awarded in recognition of outstanding athletic achievement in digital competition.</p>
          </div>
          <div style="width:50%;height:100%;padding:100px;display:flex;flex-direction:column;justify-content:center;background:#F1F5F9;">
              <p style="font-size:20px;color:#64748B;letter-spacing:2px;font-weight:700;">PRESENTED REMARKABLY TO:</p>
              <p style="font-size:90px;font-family:'Orbitron',monospace;color:#0F172A;margin:10px 0;font-weight:900;">${data.playerName}</p>
              <p style="font-size:28px;color:#334155;margin-bottom:40px;font-weight:700;">ACHIEVING PLACE #${data.placement}</p>
              <p style="font-size:45px;color:#0F172A;font-weight:900;margin-bottom:10px;">${data.tournamentName}</p>
              <p style="font-size:28px;color:#3B82F6;font-weight:700;margin-bottom:80px;">OFFICIAL TITLE: ${data.game}</p>
              <div style="display:flex;gap:60px;">
                  <div><p style="border-bottom:2px solid #CBD5E1;padding-bottom:5px;font-size:24px;font-family:'Caveat',cursive;color:#0F172A;">Officially Signed</p><p style="font-size:14px;color:#64748B;margin-top:10px;letter-spacing:1px;text-transform:uppercase;">Zentrix Executive</p></div>
                  <div><p style="border-bottom:2px solid #CBD5E1;padding-bottom:5px;font-size:20px;color:#0F172A;font-weight:700;font-family:'Space Grotesk',sans-serif;">${data.date}</p><p style="font-size:14px;color:#64748B;margin-top:10px;letter-spacing:1px;text-transform:uppercase;">Issuance Date</p></div>
              </div>
          </div>
      </div>`
  };
}

// Lazy-initialized templates with logo
let _templates = null;
let _logoFunc = null;

async function ensureTemplates() {
  if (_templates) return _templates;
  const dataUrl = await getLogoDataUrl();
  _logoFunc = (size) => logoHtml(dataUrl, size);
  _templates = makeTemplates(_logoFunc);
  return _templates;
}

// For the live preview (synchronous), use CSS fallback initially
const fallbackLogo = (size) => logoHtml(null, size);
export const TEMPLATES = makeTemplates(fallbackLogo);

/**
 * Exports the certificate as a PNG image.
 * Re-renders the template with the pre-loaded base64 logo,
 * then creates a temporary offscreen container to capture it cleanly.
 * 
 * @param {string} templateKey - e.g. 'winner', 'mvp', 'cyberpunk'
 * @param {object} formData    - { playerName, tournamentName, placement, game, date }
 * @param {string} certId      - filename for the download
 */
export const exportCertificateAsPDF = async (templateKey, formData, certId) => {
  try {
    // Step 1: Get templates with the real pre-loaded base64 logo
    const templates = await ensureTemplates();
    
    const templateFn = templates[templateKey];
    if (!templateFn) throw new Error("Unknown template: " + templateKey);

    // Step 2: Render the template HTML with the REAL logo baked in
    const html = templateFn(formData);

    // Step 3: Create a temporary offscreen container at FULL SIZE (no transforms)
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1920px';
    tempContainer.style.height = '1080px';
    tempContainer.style.zIndex = '-9999';
    tempContainer.style.overflow = 'hidden';
    tempContainer.innerHTML = html;
    
    document.body.appendChild(tempContainer);
    
    // Step 4: Wait for images inside to fully load + browser to paint
    const images = tempContainer.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // don't block on failed images
        });
      }));
    }
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
    // Step 5: Capture with html2canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 1920,
      height: 1080,
    });
    
    // Step 6: Clean up
    document.body.removeChild(tempContainer);
    
    // Step 7: Download as PNG
    const imgData = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = (certId || 'certificate') + '.png';
    link.href = imgData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (err) {
    // Show the exact error so we can debug
    console.error('Certificate generation error:', err);
    alert('CERTIFICATE ERROR:\n\n' + err.message + '\n\n' + (err.stack || ''));
    throw err;
  }
};
