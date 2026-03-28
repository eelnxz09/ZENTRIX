// ═══════════════════════════════════════════════════════════
// ZENTRIX ESPORTS — Permission & Role System
// 4-role hierarchy: owner > manager > game_team_manager > player
// ═══════════════════════════════════════════════════════════

export const PERMISSIONS = {
  // Financial
  VIEW_FINANCIALS:        'view_financials',
  ADD_FINANCIAL_ENTRY:    'add_financial_entry',
  AMEND_FINANCIALS:       'amend_financials',
  DELETE_FINANCIAL_LOGS:  'delete_financial_logs',   // Owner only (never used in UI, rule-level)

  // Players
  VIEW_PLAYERS:           'view_players',
  ADD_PLAYERS:            'add_players',
  EDIT_PLAYERS:           'edit_players',
  DELETE_PLAYERS:         'delete_players',

  // Teams
  VIEW_TEAMS:             'view_teams',
  ADD_TEAMS:              'add_teams',
  EDIT_TEAMS:             'edit_teams',
  DELETE_TEAMS:           'delete_teams',

  // Tournaments
  VIEW_TOURNAMENTS:       'view_tournaments',
  ADD_TOURNAMENTS:        'add_tournaments',
  EDIT_TOURNAMENTS:       'edit_tournaments',

  // Scrims
  VIEW_SCRIMS:            'view_scrims',
  MANAGE_SCRIMS:          'manage_scrims',

  // Audit
  VIEW_AUDIT_LOGS:        'view_audit_logs',

  // Roles / Users
  MANAGE_ROLES:           'manage_roles',
  CREATE_MANAGERS:        'create_managers',
  CREATE_GAME_TEAM_MANAGERS: 'create_game_team_managers',
  CREATE_PLAYERS:         'create_players',
  DEACTIVATE_USERS:       'deactivate_users',

  // Certificates
  VIEW_CERTIFICATES:      'view_certificates',
  GENERATE_CERTIFICATES:  'generate_certificates',

  // Analytics
  VIEW_ANALYTICS:         'view_analytics',

  // Settings
  VIEW_SETTINGS:          'view_settings',
  EDIT_SETTINGS:          'edit_settings',
};

// ━━━ HARDCODED CREDENTIAL MAP ━━━
export const OWNER_EMAILS = [
  'sahil@zentrixesports.com',
  'hrishikesh@zentrixesports.com',
  'neel@zentrixesports.com',
];

export const MANAGER_EMAILS = [
  // Empty — all 3 founders are Owners. Future staff use game_team_manager role.
];

// All system admins (owners + managers with full system access)
export const SYSTEM_EMAILS = [...OWNER_EMAILS, ...MANAGER_EMAILS];

// ━━━ ROLE DEFINITIONS ━━━
export const ROLES = {
  OWNER:             'owner',
  MANAGER:           'manager',
  GAME_TEAM_MANAGER: 'game_team_manager',
  COACH:             'coach',
  PLAYER:            'player',
};

export const ROLE_LABELS = {
  [ROLES.OWNER]:             'Owner',
  [ROLES.MANAGER]:           'Esports Manager',
  [ROLES.GAME_TEAM_MANAGER]: 'Team Manager',
  [ROLES.COACH]:             'Team Coach',
  [ROLES.PLAYER]:            'Player',
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role || 'Unknown';

// ━━━ ROLE → DEFAULT PERMISSIONS ━━━
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_DEFAULTS = {
  [ROLES.OWNER]: ALL_PERMISSIONS,

  [ROLES.MANAGER]: [
    // Same as owner EXCEPT: no delete_financial_logs, no view_audit_logs, no create_managers
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.ADD_FINANCIAL_ENTRY,
    PERMISSIONS.AMEND_FINANCIALS,
    // NO DELETE_FINANCIAL_LOGS
    PERMISSIONS.VIEW_PLAYERS,
    PERMISSIONS.ADD_PLAYERS,
    PERMISSIONS.EDIT_PLAYERS,
    PERMISSIONS.DELETE_PLAYERS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.ADD_TEAMS,
    PERMISSIONS.EDIT_TEAMS,
    PERMISSIONS.DELETE_TEAMS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.ADD_TOURNAMENTS,
    PERMISSIONS.EDIT_TOURNAMENTS,
    PERMISSIONS.VIEW_SCRIMS,
    PERMISSIONS.MANAGE_SCRIMS,
    // NO VIEW_AUDIT_LOGS
    PERMISSIONS.MANAGE_ROLES,
    // NO CREATE_MANAGERS
    PERMISSIONS.CREATE_GAME_TEAM_MANAGERS,
    PERMISSIONS.CREATE_PLAYERS,
    PERMISSIONS.DEACTIVATE_USERS,
    PERMISSIONS.VIEW_CERTIFICATES,
    PERMISSIONS.GENERATE_CERTIFICATES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
  ],

  [ROLES.GAME_TEAM_MANAGER]: [
    // Manages specific game team — NO financials, NO audit logs
    PERMISSIONS.VIEW_PLAYERS,
    PERMISSIONS.ADD_PLAYERS,
    PERMISSIONS.EDIT_PLAYERS,
    PERMISSIONS.DELETE_PLAYERS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.ADD_TEAMS,
    PERMISSIONS.EDIT_TEAMS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.VIEW_SCRIMS,
    PERMISSIONS.MANAGE_SCRIMS,
    PERMISSIONS.VIEW_CERTIFICATES,
    PERMISSIONS.GENERATE_CERTIFICATES,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  [ROLES.COACH]: [
    // Tactical oversight — View only for players/teams, but manages scrims
    PERMISSIONS.VIEW_PLAYERS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.VIEW_SCRIMS,
    PERMISSIONS.MANAGE_SCRIMS,
    PERMISSIONS.VIEW_CERTIFICATES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  [ROLES.PLAYER]: [
    // View-only + own stats + own certs
    PERMISSIONS.VIEW_PLAYERS,
    PERMISSIONS.VIEW_TEAMS,
    PERMISSIONS.VIEW_TOURNAMENTS,
    PERMISSIONS.VIEW_SCRIMS,
    PERMISSIONS.VIEW_CERTIFICATES,
    PERMISSIONS.VIEW_SETTINGS,
  ],
};

// ━━━ HELPERS ━━━
export function hasPermission(userPermissions, permission) {
  return Array.isArray(userPermissions) && userPermissions.includes(permission);
}

export function getDefaultPermissions(role) {
  return ROLE_DEFAULTS[role] || ROLE_DEFAULTS[ROLES.PLAYER];
}

export function getRoleForEmail(email) {
  const e = email?.toLowerCase().trim();
  if (OWNER_EMAILS.includes(e)) return ROLES.OWNER;
  if (MANAGER_EMAILS.includes(e)) return ROLES.MANAGER;
  return null; // not a hardcoded account
}
