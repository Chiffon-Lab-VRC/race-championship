-- 初期データをD1にインポートするSQLスクリプト

-- チームを追加
INSERT INTO teams (id, name, short_name, color, description) VALUES
  ('kci-racing', 'KCI Racing RBPT Honda', 'KCI Racing', '#E60012', '強豪チーム'),
  ('secracing-team', 'SecRacingTeam Mercedes', 'SecRacing', '#00D2BE', 'メルセデスパワーユニット搭載'),
  ('maradoda-racing', 'MaraDoda Racing Mercedes', 'MaraDoda', '#FF8700', '4名体制の強力チーム');

-- ドライバーを追加
INSERT INTO drivers (id, name, number, team_id, nationality, bio) VALUES
  ('chiffon-inugasaki', 'Chiffon Inugasaki', 1, 'kci-racing', 'JPN', 'トップドライバー'),
  ('tsubasa-sekine', 'Tsubasa Sekine', 2, 'secracing-team', 'JPN', '実力派ドライバー'),
  ('luna-umarase', 'Luna Umarase', 3, 'maradoda-racing', 'JPN', '期待の若手'),
  ('suzuto-nakayama', 'Suzuto Nakayama', 4, 'maradoda-racing', 'JPN', 'チームメイト'),
  ('rio-okamura', 'Rio Okamura', 5, 'kci-racing', 'JPN', 'ベテランドライバー'),
  ('takuya-ochiai', 'Takuya Ochiai', 6, 'maradoda-racing', 'JPN', '安定感のある走り'),
  ('ryota-takayama', 'Ryota Takayama', 7, 'maradoda-racing', 'JPN', 'チャレンジャー');

-- レースを追加
INSERT INTO races (id, round, name, circuit, date, country) VALUES
  ('rd1-japan-suzuka', 1, 'Rd.1 Japan', 'Suzuka Circuit', '2025-12-12', 'JPN');

-- レースセッションを追加
INSERT INTO race_sessions (race_id, session_type, name) VALUES
  ('rd1-japan-suzuka', 'RACE 1', 'RACE 1'),
  ('rd1-japan-suzuka', 'RACE 2', 'RACE 2');

-- RACE 1の結果
INSERT INTO race_results (session_id, position, driver_id, team_id, laps, total_time, points, fastest_lap) VALUES
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 1'), 1, 'chiffon-inugasaki', 'kci-racing', 8, '12:16:055', 25, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 1'), 2, 'tsubasa-sekine', 'secracing-team', 7, '12:17:377', 18, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 1'), 3, 'luna-umarase', 'maradoda-racing', 7, '12:45:033', 15, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 1'), 4, 'suzuto-nakayama', 'maradoda-racing', 7, '12:53:703', 12, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 1'), 5, 'rio-okamura', 'kci-racing', 7, '13:05:866', 10, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 1'), 6, 'takuya-ochiai', 'maradoda-racing', 7, '13:26:260', 8, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 1'), 7, 'ryota-takayama', 'maradoda-racing', 7, '13:30:045', 6, 0);

-- RACE 2の結果
INSERT INTO race_results (session_id, position, driver_id, team_id, laps, total_time, points, fastest_lap) VALUES
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 2'), 1, 'chiffon-inugasaki', 'kci-racing', 8, '12:16:055', 25, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 2'), 2, 'tsubasa-sekine', 'secracing-team', 7, '12:17:377', 18, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 2'), 3, 'rio-okamura', 'kci-racing', 7, '12:45:033', 15, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 2'), 4, 'suzuto-nakayama', 'maradoda-racing', 7, '12:53:703', 12, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 2'), 5, 'ryota-takayama', 'maradoda-racing', 7, '13:05:866', 10, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 2'), 6, 'takuya-ochiai', 'maradoda-racing', 7, '13:26:260', 8, 0),
  ((SELECT id FROM race_sessions WHERE race_id = 'rd1-japan-suzuka' AND session_type = 'RACE 2'), 7, 'luna-umarase', 'maradoda-racing', 7, '13:30:045', 6, 0);
