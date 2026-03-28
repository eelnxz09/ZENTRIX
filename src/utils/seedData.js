// Zentrix Esports — Comprehensive Seed Data
// Seeds realistic demo data for all 4 games when localStorage is empty.

const SEED_KEY = 'zentrix_seeded_v3';

const TEAMS = [
  { id: 'team_vlt_alpha',  name: 'Zentrix Alpha',   game: 'Valorant',  tag: 'ZX-A', wins: 18, losses: 6,  totalMatches: 24 },
  { id: 'team_vlt_beta',   name: 'Zentrix Beta',    game: 'Valorant',  tag: 'ZX-B', wins: 12, losses: 8,  totalMatches: 20 },
  { id: 'team_bgmi_main',  name: 'Zentrix Titans',  game: 'BGMI',      tag: 'ZX-T', wins: 22, losses: 3,  totalMatches: 25 },
  { id: 'team_bgmi_acad',  name: 'Zentrix Academy', game: 'BGMI',      tag: 'ZX-AC',wins: 9,  losses: 11, totalMatches: 20 },
  { id: 'team_ff_storm',   name: 'Storm Riders',    game: 'Free Fire', tag: 'SR',   wins: 14, losses: 6,  totalMatches: 20 },
  { id: 'team_codm_elite', name: 'CODM Elite',      game: 'CODM',      tag: 'CE',   wins: 16, losses: 4,  totalMatches: 20 },
];

const PLAYERS = [
  // Valorant
  { id: 'p_slayer99',  displayName: 'Vikram Singh',  ign: 'Slayer_99',    game: 'Valorant',  teamId: 'team_vlt_alpha',  role: 'Duelist',     stats: { totalMatches: 248, wins: 168, kills: 3420, kd: 1.8, accuracy: 62, clutchRate: 35 }, isActive: true },
  { id: 'p_hyperv',    displayName: 'Arjun Mehta',   ign: 'HyperViper',   game: 'Valorant',  teamId: 'team_vlt_alpha',  role: 'Sentinel',    stats: { totalMatches: 310, wins: 204, kills: 2890, kd: 2.4, accuracy: 68, clutchRate: 42 }, isActive: true },
  { id: 'p_voidwalk',  displayName: 'Karan Desai',   ign: 'VOID_WALKER',  game: 'Valorant',  teamId: 'team_vlt_alpha',  role: 'Controller',  stats: { totalMatches: 280, wins: 185, kills: 2100, kd: 1.5, accuracy: 55, clutchRate: 28 }, isActive: true },
  { id: 'p_ghost',     displayName: 'Rohan Joshi',   ign: 'Ghostly',      game: 'Valorant',  teamId: 'team_vlt_beta',   role: 'Initiator',   stats: { totalMatches: 190, wins: 110, kills: 1850, kd: 1.6, accuracy: 58, clutchRate: 31 }, isActive: true },
  { id: 'p_zenith',    displayName: 'Priya Nair',    ign: 'Zenith',       game: 'Valorant',  teamId: 'team_vlt_beta',   role: 'Duelist',     stats: { totalMatches: 220, wins: 145, kills: 2680, kd: 2.1, accuracy: 64, clutchRate: 38 }, isActive: true },
  // BGMI
  { id: 'p_demon',     displayName: 'Sahil Patel',   ign: 'Demon_King',   game: 'BGMI',      teamId: 'team_bgmi_main',  role: 'IGL',         stats: { totalMatches: 350, wins: 245, kills: 4200, kd: 3.2, accuracy: 71, clutchRate: 45 }, isActive: true },
  { id: 'p_ninja',     displayName: 'Raj Kumar',     ign: 'NinjaBlade',   game: 'BGMI',      teamId: 'team_bgmi_main',  role: 'Assaulter',   stats: { totalMatches: 300, wins: 210, kills: 3800, kd: 2.8, accuracy: 65, clutchRate: 39 }, isActive: true },
  { id: 'p_mystic',    displayName: 'Ananya Sharma', ign: 'Mystic_QT',    game: 'BGMI',      teamId: 'team_bgmi_main',  role: 'Support',     stats: { totalMatches: 280, wins: 195, kills: 2100, kd: 1.4, accuracy: 52, clutchRate: 22 }, isActive: false },
  { id: 'p_storm',     displayName: 'Vivek Iyer',    ign: 'StormBreaker', game: 'BGMI',      teamId: 'team_bgmi_acad',  role: 'Fragger',     stats: { totalMatches: 150, wins: 85,  kills: 1600, kd: 1.9, accuracy: 59, clutchRate: 30 }, isActive: true },
  // Free Fire
  { id: 'p_blaze',     displayName: 'Kunal Verma',   ign: 'Blaze_FF',     game: 'Free Fire', teamId: 'team_ff_storm',   role: 'Rusher',      stats: { totalMatches: 400, wins: 280, kills: 5200, kd: 2.6, accuracy: 60, clutchRate: 36 }, isActive: true },
  { id: 'p_shadow',    displayName: 'Deepak Rao',    ign: 'ShadowX',      game: 'Free Fire', teamId: 'team_ff_storm',   role: 'Sniper',      stats: { totalMatches: 380, wins: 260, kills: 4800, kd: 2.3, accuracy: 67, clutchRate: 40 }, isActive: true },
  { id: 'p_phoenix',   displayName: 'Meera Reddy',   ign: 'Phoenix_FF',   game: 'Free Fire', teamId: 'team_ff_storm',   role: 'Support',     stats: { totalMatches: 250, wins: 170, kills: 2200, kd: 1.3, accuracy: 48, clutchRate: 18 }, isActive: true },
  // CODM
  { id: 'p_venom',     displayName: 'Aditya Khanna', ign: 'Venom_COD',    game: 'CODM',      teamId: 'team_codm_elite', role: 'Fragger',     stats: { totalMatches: 320, wins: 220, kills: 4100, kd: 2.5, accuracy: 63, clutchRate: 37 }, isActive: true },
  { id: 'p_titan',     displayName: 'Ishaan Gupta',  ign: 'TitanX',       game: 'CODM',      teamId: 'team_codm_elite', role: 'IGL',         stats: { totalMatches: 290, wins: 200, kills: 3200, kd: 2.0, accuracy: 58, clutchRate: 33 }, isActive: true },
  { id: 'p_omega',     displayName: 'Neha Kapoor',   ign: 'Omega_COD',    game: 'CODM',      teamId: 'team_codm_elite', role: 'Support',     stats: { totalMatches: 200, wins: 130, kills: 1800, kd: 1.4, accuracy: 50, clutchRate: 20 }, isActive: true },
];

const TOURNAMENTS = [
  { id: 't_skyesports',  name: 'Skyesports Masters 2024',  game: 'Valorant',  organizer: 'Skyesports',    prizePool: 500000,  entryFee: { amount: 5000, proofURL: 'proof_sky.png' },  status: 'upcoming', startDate: '2024-11-15', location: 'Mumbai',  format: '5v5' },
  { id: 't_esl_india',   name: 'ESL India Premiership',    game: 'Valorant',  organizer: 'ESL India',     prizePool: 250000,  entryFee: { amount: 2500, proofURL: 'proof_esl.png' },  status: 'upcoming', startDate: '2024-11-22', location: 'Online',  format: '5v5' },
  { id: 't_bgis_s4',     name: 'BGIS Series Round 4',      game: 'BGMI',      organizer: 'Krafton',       prizePool: 1200000, entryFee: { amount: 0 },                                status: 'upcoming', startDate: '2024-12-01', location: 'Delhi',   format: 'Squad' },
  { id: 't_prime_bgmi',  name: 'Prime Series BGMI',        game: 'BGMI',      organizer: 'Prime Gaming',  prizePool: 300000,  entryFee: { amount: 3000, proofURL: 'proof_prime.png' },status: 'live',     startDate: '2024-10-20', location: 'Online',  format: 'Squad' },
  { id: 't_ff_cup',      name: 'Free Fire India Cup',      game: 'Free Fire', organizer: 'Garena',        prizePool: 200000,  entryFee: { amount: 0 },                                status: 'completed',startDate: '2024-09-10', location: 'Bangalore', format: 'Squad', placements: { first: 'Storm Riders', second: 'Team Phoenix', third: 'Elite Squad' }, concludedAt: Date.now() - 86400000 * 5, prizePoolProofURL: 'prize_ff_cup.png' },
  { id: 't_codm_champ',  name: 'CODM Championship India',  game: 'CODM',      organizer: 'Activision',    prizePool: 400000,  entryFee: { amount: 1000, proofURL: 'proof_codm.png' },status: 'completed',startDate: '2024-08-15', location: 'Hyderabad', format: 'Squad', placements: { first: 'CODM Elite', second: 'Team Valor', third: 'Shadow Squad' }, concludedAt: Date.now() - 86400000 * 15, prizePoolProofURL: 'prize_codm.png' },
  { id: 't_masters_2024',name: 'Masters India 2024',       game: 'Valorant',  organizer: 'Riot Games',    prizePool: 800000,  entryFee: { amount: 0 },                                status: 'completed',startDate: '2024-07-01', location: 'Mumbai', format: '5v5', placements: { first: 'Zentrix Alpha', second: 'Team Spirit', third: 'Velocity Gaming' }, concludedAt: Date.now() - 86400000 * 45, prizePoolProofURL: 'prize_masters.png' },
];

const dt = (daysAgo, hour=10, min=45) => Date.now() - (daysAgo * 86400000) + (hour * 3600000) + (min * 60000);

const FINANCIAL_LOGS = [
  { id: 'fl_1', type: 'income',  category: 'tournament',   amount: 150000, notes: 'Tournament Winnings - IEM',       uploadedBy: 'sys_owner_neel',    uploadedByName: 'Neel',     proofURL: 'proof_iem.png',    verifiedBy: 'R. Khanna', createdAt: dt(4), version: 1 },
  { id: 'fl_2', type: 'income',  category: 'sponsor',      amount: 85000,  notes: 'Sponsor Payout - Razer',         uploadedBy: 'sys_owner_sahil',   uploadedByName: 'Sahil',    proofURL: 'proof_razer.png',  verifiedBy: 'System', createdAt: dt(2), version: 1 },
  { id: 'fl_3', type: 'expense', category: 'travel',       amount: 3200,   notes: 'Operational Reimbursement',      uploadedBy: 'sys_owner_hrishikesh', uploadedByName: 'Hrishikesh', proofURL: null, verifiedBy: 'A. Verma', flagged: true, flagReason: 'UNVERIFIED VENDOR', createdAt: dt(3), version: 1 },
  { id: 'fl_4', type: 'expense', category: 'hosting',      amount: 12400,  notes: 'Server Hosting - AWS',           uploadedBy: 'sys_owner_neel',    uploadedByName: 'Neel',     proofURL: 'proof_aws.png',    verifiedBy: 'System', createdAt: dt(6), version: 1 },
  { id: 'fl_5', type: 'income',  category: 'streaming',    amount: 68400,  notes: 'Twitch Ad Revenue',              uploadedBy: 'sys_owner_sahil',   uploadedByName: 'Sahil',    proofURL: 'proof_twitch.png', verifiedBy: 'System', createdAt: dt(8), version: 1 },
  { id: 'fl_6', type: 'expense', category: 'tournament',   amount: 45000,  notes: 'Travel Expense - Bangalore',     uploadedBy: 'sys_owner_hrishikesh', uploadedByName: 'Hrishikesh', proofURL: 'proof_travel.png', verifiedBy: 'System', createdAt: dt(10), version: 1 },
  { id: 'fl_7', type: 'income',  category: 'merchandise',  amount: 12300,  notes: 'Merchandise Sales',              uploadedBy: 'sys_owner_neel',    uploadedByName: 'Neel',     proofURL: 'proof_merch.png',  verifiedBy: 'System', createdAt: dt(12), version: 1 },
  { id: 'fl_8', type: 'expense', category: 'bootcamp',     amount: 85000,  notes: 'Bootcamp Rent - Oct',            uploadedBy: 'sys_owner_sahil',   uploadedByName: 'Sahil',    proofURL: 'proof_boot.png',   verifiedBy: 'System', createdAt: dt(15), version: 1 },
  { id: 'fl_9', type: 'income',  category: 'prize_pool',   amount: 450000, notes: 'PMGC Prize Pool Share',          uploadedBy: 'sys_owner_neel',    uploadedByName: 'Neel',     proofURL: 'proof_pmgc.png',   verifiedBy: 'R. Khanna', createdAt: dt(18), version: 1 },
  { id: 'fl_10',type: 'expense', category: 'jersey',       amount: 42000,  notes: 'Jersey Production',              uploadedBy: 'sys_owner_hrishikesh', uploadedByName: 'Hrishikesh', proofURL: 'proof_jersey.png', verifiedBy: 'System', createdAt: dt(20), version: 1, status: 'pending' },
];

const SCRIMS = [
  { id: 'sc_1', title: 'Valorant Alpha',  game: 'Valorant',  teamId: 'team_vlt_alpha',  opponent: 'Entity Gaming',    map: 'Haven',  format: '5v5 Tactical',     scheduledAt: Date.now() + 3600000, status: 'live',     scoreUs: 13, scoreThem: 11, result: 'victory' },
  { id: 'sc_2', title: 'BGMI Map Practice', game: 'BGMI',    teamId: 'team_bgmi_main',  opponent: 'Internal Session', map: 'Erangel', format: 'Strategy Run',     scheduledAt: Date.now() + 7200000, status: 'scheduled' },
  { id: 'sc_3', title: 'Valorant Beta',   game: 'Valorant',  teamId: 'team_vlt_beta',   opponent: 'Velocity Gaming',  map: 'Ascent', format: '5v5 Tactical',     scheduledAt: Date.now() + 10800000,status: 'live',     scoreUs: 13, scoreThem: 10, result: 'victory' },
  { id: 'sc_4', title: 'Velocity Elite',  game: 'Valorant',  teamId: 'team_vlt_alpha',  opponent: 'Global Esports',   map: 'Mirage', format: '5v5 Competitive',  scheduledAt: Date.now() - 3600000, status: 'completed',scoreUs: 9,  scoreThem: 13, result: 'defeat' },
  { id: 'sc_5', title: 'FF Storm Rush',   game: 'Free Fire', teamId: 'team_ff_storm',   opponent: 'FireBolt Squad',   map: 'Bermuda',format: 'Squad Rush',       scheduledAt: Date.now() + 86400000, status: 'scheduled' },
  { id: 'sc_6', title: 'CODM Strategy',   game: 'CODM',      teamId: 'team_codm_elite', opponent: 'Coach Led Session',map: 'Crash',  format: 'Tactical Review',  scheduledAt: Date.now() + 172800000, status: 'scheduled' },
];

const AUDIT_LOGS = [
  { id: 'al_1', action: 'approve_expense',  performedByName: 'Arjun Sharma',  entity: '₹45,000 for Valorant Team Travel Expense', status: 'verified',  timestamp: dt(0, 10, 45) },
  { id: 'al_2', action: 'user_login',       performedByName: 'System Auth',   entity: 'Manager Arjun Sharma logged in via Mumbai IP', status: 'success', timestamp: dt(0, 10, 30) },
  { id: 'al_3', action: 'data_sync',        performedByName: 'Bot Controller',entity: 'Synced tournament brackets with VLR.gg API', status: 'synced',   timestamp: dt(0, 9, 12)  },
  { id: 'al_4', action: 'update_roster',    performedByName: 'Rohan Mehta',   entity: 'Moved Player "Ghostly" from Sub to Active (Valorant)', status: 'updated', timestamp: dt(0, 8, 50) },
  { id: 'al_5', action: 'tournament_added', performedByName: 'Neel',          entity: 'Registered BGIS Series Round 4 (₹12L Prize)', status: 'success',  timestamp: dt(1, 14, 20) },
  { id: 'al_6', action: 'financial_entry',  performedByName: 'Sahil',         entity: 'Added Sponsor Payout ₹85,000 from Razer', status: 'verified',     timestamp: dt(2, 11, 0)  },
];

const INVITES = [
  { id: 'inv_1', code: 'ZX-DEMO', createdBy: 'sys_owner_neel', game: 'Valorant', roleAssigned: 'player', status: 'active', permissions: ['view_players', 'view_tournaments'], createdAt: Date.now() - 86400000 },
  { id: 'inv_2', code: 'ZX-TEST', createdBy: 'sys_owner_sahil', game: 'BGMI', roleAssigned: 'player', status: 'active', permissions: ['view_players', 'view_tournaments'], createdAt: Date.now() - 172800000 },
];

const ANNOUNCEMENTS = [
  { id: 'ann_1', title: 'New Patch V8.00 Deployment', body: 'Mandatory update for all tournament rigs. Ensure local clients are updated before 18:00.', timeAgo: '2 HOURS AGO', priority: 'high' },
  { id: 'ann_2', title: 'Zentrix India HQ Meetup', body: 'Official team photoshoot scheduled for next Friday at Mumbai Studio. Be ready by 10 AM.', timeAgo: 'YESTERDAY', priority: 'normal' },
  { id: 'ann_3', title: 'Boot Camp Schedule Released', body: 'November bootcamp confirmed in Bangalore. All Valorant and BGMI squads required.', timeAgo: '3 DAYS AGO', priority: 'normal' },
];

export function seedDemoData() {
  if (localStorage.getItem(SEED_KEY)) return;

  const setIfEmpty = (key, data) => {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (existing.length === 0) {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event(`db_update_${key.replace('zentrix_db_', '')}`));
    }
  };

  setIfEmpty('zentrix_db_teams', TEAMS);
  setIfEmpty('zentrix_db_players', PLAYERS);
  setIfEmpty('zentrix_db_tournaments', TOURNAMENTS);
  setIfEmpty('zentrix_db_financial_logs', FINANCIAL_LOGS);
  setIfEmpty('zentrix_db_scrims', SCRIMS);
  setIfEmpty('zentrix_db_audit_demo', AUDIT_LOGS);
  setIfEmpty('zentrix_db_invites', INVITES);
  setIfEmpty('zentrix_db_announcements', ANNOUNCEMENTS);

  localStorage.setItem(SEED_KEY, 'true');
  console.log('[Zentrix] Demo data seeded successfully.');
}

// Export raw data for dashboard computations
export { TEAMS, PLAYERS, TOURNAMENTS, FINANCIAL_LOGS, SCRIMS, AUDIT_LOGS, ANNOUNCEMENTS };
