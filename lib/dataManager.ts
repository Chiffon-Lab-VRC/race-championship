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
 * データをリセット（初期データに戻す）
 */
export function resetData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

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
 * レースを削除
 */
export function deleteRace(data: ChampionshipData, raceId: string): ChampionshipData {
  return {
    ...data,
    races: data.races.filter(r => r.id !== raceId),
  };
}
