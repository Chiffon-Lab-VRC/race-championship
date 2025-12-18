/**
 * データ管理システム
 * レース結果、ドライバー、チーム情報を管理
 */

import initialData from './data/initial-data.json';

export type Driver = {
  id: string;
  name: string;
  number: number;
  teamId: string;
  nationality: string;
  bio: string;
  photoUrl?: string;
};

export type Team = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  description: string;
};

export type RaceResult = {
  position: number;
  driverId: string;
  teamId: string;
  laps: number;
  totalTime: string;
  points: number;
  fastestLap?: boolean;
};

export type RaceSession = {
  sessionType: string;
  name: string;
  results: RaceResult[];
};

export type Race = {
  id: string;
  round: number;
  name: string;
  circuit: string;
  date: string;
  country: string;
  sessions: RaceSession[];
};

export type ChampionshipData = {
  drivers: Driver[];
  teams: Team[];
  races: Race[];
  pointsSystem: Record<string, number>;
};

export type DriverStanding = {
  driver: Driver;
  team: Team;
  points: number;
  wins: number;
  podiums: number;
};

export type TeamStanding = {
  team: Team;
  points: number;
  wins: number;
  drivers: string[];
};

/**
 * ローカルストレージのキー
 */
const STORAGE_KEY = 'race-championship-data';

/**
 * データを取得
 */
export function getData(): ChampionshipData {
  if (typeof window === 'undefined') {
    return initialData as ChampionshipData;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored data:', e);
    }
  }

  return initialData as ChampionshipData;
}

/**
 * データを保存
 */
export function saveData(data: ChampionshipData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * データをリセット(初期データに戻す)
 */
export function resetData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================================================
// D1 API Functions (New - for gradual migration)
// ============================================================================

/**
 * D1からドライバーデータを取得
 */
export async function fetchDrivers(): Promise<Driver[]> {
  try {
    const response = await fetch('/api/drivers');
    if (!response.ok) {
      throw new Error(`Failed to fetch drivers: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
}

/**
 * D1からチームデータを取得
 */
export async function fetchTeams(): Promise<Team[]> {
  try {
    const response = await fetch('/api/teams');
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
}

/**
 * D1からレースデータを取得
 */
export async function fetchRaces(): Promise<Race[]> {
  try {
    const response = await fetch('/api/races');
    if (!response.ok) {
      throw new Error(`Failed to fetch races: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching races:', error);
    throw error;
  }
}

/**
 * D1から全データを取得
 */
export async function fetchAllData(): Promise<ChampionshipData> {
  try {
    const [drivers, teams, races] = await Promise.all([
      fetchDrivers(),
      fetchTeams(),
      fetchRaces()
    ]);

    return {
      drivers,
      teams,
      races,
      pointsSystem: initialData.pointsSystem
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
}

// ============================================================================
// Calculation Functions (unchanged - work with any data source)
// ============================================================================

// ============================================================================
// D1 API Mutation Functions (Create, Update, Delete)
// ============================================================================

/**
 * ドライバーを作成
 */
export async function createDriver(driver: Omit<Driver, 'id'>): Promise<Driver> {
  try {
    const response = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driver)
    });
    if (!response.ok) {
      throw new Error(`Failed to create driver: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating driver:', error);
    throw error;
  }
}

/**
 * ドライバーを更新
 */
export async function updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
  try {
    const response = await fetch(`/api/drivers?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driver)
    });
    if (!response.ok) {
      throw new Error(`Failed to update driver: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating driver:', error);
    throw error;
  }
}

/**
 * ドライバーを削除
 */
export async function deleteDriver(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/drivers?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete driver: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
}

/**
 * チームを作成
 */
export async function createTeam(team: Omit<Team, 'id'>): Promise<Team> {
  try {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    });
    if (!response.ok) {
      throw new Error(`Failed to create team: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

/**
 * チームを更新
 */
export async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
  try {
    const response = await fetch(`/api/teams?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    });
    if (!response.ok) {
      throw new Error(`Failed to update team: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
}

/**
 * チームを削除
 */
export async function deleteTeam(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/teams?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete team: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
}

/**
 * レースを作成
 */
export async function createRace(race: Omit<Race, 'id'>): Promise<Race> {
  try {
    const response = await fetch('/api/races', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(race)
    });
    if (!response.ok) {
      throw new Error(`Failed to create race: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating race:', error);
    throw error;
  }
}

/**
 * レースを更新
 */
export async function updateRaceData(id: string, race: Partial<Race>): Promise<Race> {
  try {
    const response = await fetch(`/api/races?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(race)
    });
    if (!response.ok) {
      throw new Error(`Failed to update race: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating race:', error);
    throw error;
  }
}

/**
 * レースを削除
 */
export async function deleteRace(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/races?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete race: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting race:', error);
    throw error;
  }
}

// ============================================================================
// Calculation Functions (unchanged - work with any data source)
// ============================================================================


/**
 * ドライバーズチャンピオンシップランキングを計算
 */
export function calculateDriverStandings(data: ChampionshipData): DriverStanding[] {
  const standings = new Map<string, { points: number; wins: number; podiums: number }>();

  // 全レースの結果を集計
  data.races.forEach(race => {
    race.sessions.forEach(session => {
      session.results.forEach(result => {
        const current = standings.get(result.driverId) || { points: 0, wins: 0, podiums: 0 };
        current.points += result.points;
        if (result.position === 1) current.wins++;
        if (result.position <= 3) current.podiums++;
        standings.set(result.driverId, current);
      });
    });
  });

  // ドライバー情報と結合
  const driverStandings: DriverStanding[] = [];
  standings.forEach((stats, driverId) => {
    const driver = data.drivers.find(d => d.id === driverId);
    const team = driver ? data.teams.find(t => t.id === driver.teamId) : undefined;
    if (driver && team) {
      driverStandings.push({
        driver,
        team,
        points: stats.points,
        wins: stats.wins,
        podiums: stats.podiums,
      });
    }
  });

  // ポイント順にソート
  return driverStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.podiums - a.podiums;
  });
}

/**
 * コンストラクターズチャンピオンシップランキングを計算
 */
export function calculateTeamStandings(data: ChampionshipData): TeamStanding[] {
  const standings = new Map<string, { points: number; wins: number; drivers: Set<string> }>();

  // 全レースの結果を集計
  data.races.forEach(race => {
    race.sessions.forEach(session => {
      session.results.forEach(result => {
        const current = standings.get(result.teamId) || {
          points: 0,
          wins: 0,
          drivers: new Set<string>()
        };
        current.points += result.points;
        if (result.position === 1) current.wins++;
        current.drivers.add(result.driverId);
        standings.set(result.teamId, current);
      });
    });
  });

  // チーム情報と結合
  const teamStandings: TeamStanding[] = [];
  standings.forEach((stats, teamId) => {
    const team = data.teams.find(t => t.id === teamId);
    if (team) {
      teamStandings.push({
        team,
        points: stats.points,
        wins: stats.wins,
        drivers: Array.from(stats.drivers),
      });
    }
  });

  // ポイント順にソート
  return teamStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.wins - a.wins;
  });
}

/**
 * 特定のレースを取得
 */
export function getRaceById(data: ChampionshipData, raceId: string): Race | undefined {
  return data.races.find(r => r.id === raceId);
}

/**
 * 特定のドライバーを取得
 */
export function getDriverById(data: ChampionshipData, driverId: string): Driver | undefined {
  return data.drivers.find(d => d.id === driverId);
}

/**
 * 特定のチームを取得
 */
export function getTeamById(data: ChampionshipData, teamId: string): Team | undefined {
  return data.teams.find(t => t.id === teamId);
}

/**
 * レースを追加
 */
export function addRace(data: ChampionshipData, race: Race): ChampionshipData {
  return {
    ...data,
    races: [...data.races, race],
  };
}

/**
 * レースを更新
 */
export function updateRace(data: ChampionshipData, raceId: string, updatedRace: Race): ChampionshipData {
  return {
    ...data,
    races: data.races.map(r => r.id === raceId ? updatedRace : r),
  };
}

/**
 * レースを削除 (deprecated helper - use deleteRace API function instead)
 */
export function deleteRaceFromData(data: ChampionshipData, raceId: string): ChampionshipData {
  return {
    ...data,
    races: data.races.filter(r => r.id !== raceId),
  };
}
