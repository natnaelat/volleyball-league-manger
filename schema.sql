-- CREATE DATABASE TournamentDB2;
USE TournamentDB2;

-- PLAYER TABLE
CREATE TABLE Player (
    Username VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Bdate DATE,
    Points INT DEFAULT 0
);

-- ADMIN TABLE
CREATE TABLE Admin (
    Ausername VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL
);

-- TEAM TABLE
CREATE TABLE Team (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(50) UNIQUE,
    Cusername VARCHAR(50),
    FOREIGN KEY (Cusername) REFERENCES Player(Username)
);

-- ADMIN_MANAGES (M:N relationship between Admin and Team)
CREATE TABLE Admin_Manages (
    Ausername VARCHAR(50),
    TeamID INT,
    StartDate DATE,
    PRIMARY KEY (Ausername, TeamID),
    FOREIGN KEY (Ausername) REFERENCES Admin(Ausername),
    FOREIGN KEY (TeamID) REFERENCES Team(TeamID)
);

-- GAME TABLE
CREATE TABLE Game (
    Match_ID INT AUTO_INCREMENT PRIMARY KEY,
    Time_Slot DATETIME NOT NULL,
    Team1ID INT,
    Team2ID INT,
    WinnerTeamID INT,
    LoserTeamID INT,
    FOREIGN KEY (Team1ID) REFERENCES Team(TeamID),
    FOREIGN KEY (Team2ID) REFERENCES Team(TeamID),
    FOREIGN KEY (WinnerTeamID) REFERENCES Team(TeamID),
    FOREIGN KEY (LoserTeamID) REFERENCES Team(TeamID)
);

-- SCORE TABLE
CREATE TABLE Score (
    S_MatchID INT,
    SetID INT,
    Game_Point INT,
    Losing_TeamID INT,
    Winning_TeamID INT,
    PRIMARY KEY (S_MatchID, SetID),
    FOREIGN KEY (S_MatchID) REFERENCES Game(Match_ID),
    FOREIGN KEY (Losing_TeamID) REFERENCES Team(TeamID),
    FOREIGN KEY (Winning_TeamID) REFERENCES Team(TeamID)
);

-- LOCATION TABLE
CREATE TABLE Location (
    LMatch_ID INT PRIMARY KEY,
    Name VARCHAR(100),
    State VARCHAR(50),
    StreetName VARCHAR(100),
    Zipcode VARCHAR(10),
    City VARCHAR(50),
    FOREIGN KEY (LMatch_ID) REFERENCES Game(Match_ID)
);


SHOW TABLES;
DESCRIBE Player;

-- Sample Admins
INSERT IGNORE INTO Admin (Ausername, Name) VALUES
('admin1', 'Alice Johnson'),
('admin2', 'Bob Smith'),
('admin3', 'Carol Thompson'),
('admin4', 'Daniel Lee'),
('admin5', 'Evelyn Parker'),
('admin6', 'Franklin Ortiz'),
('admin7', 'Grace Chen'),
('admin8', 'Henry Adams'),
('admin9', 'Isabella Martinez'),
('admin10', 'Jack Robinson'),
('admin11', 'Karen White'),
('admin12', 'Liam Scott'),
('admin13', 'Mia Turner'),
('admin14', 'Nathan Harris'),
('admin15', 'Olivia King'),
('admin16', 'Pauline Young'),
('admin17', 'Quentin Lewis'),
('admin18', 'Rachel Hall'),
('admin19', 'Samuel Allen'),
('admin20', 'Tina Baker');

-- Sample Players
INSERT IGNORE INTO Player (Username, Name, Bdate, Points) VALUES
('player1', 'John Doe', '2002-05-12', 10),
('player2', 'Jane Roe', '2002-11-23', 15),
('player3', 'Mike Lee', '2003-03-15', 12),
('player4', 'Sara Kim', '2003-07-30', 18),
('player5', 'Tom Brown', '2002-02-20', 9),
('player6', 'Emily Davis', '2004-09-10', 14),
('player7', 'David Wilson', '2002-12-05', 20),
('player8', 'Linda Green', '2005-06-18', 16),
('player9', 'Alex Morgan', '2003-04-08', 11),
('player10', 'Bella Clark', '2004-07-14', 13),
('player11', 'Chris Evans', '2005-11-21', 17),
('player12', 'Diana Ross', '2004-05-30', 19),
('player13', 'Ethan Hunt', '2002-03-12', 12),
('player14', 'Fiona Gallagher', '2005-09-25', 14),
('player15', 'George Martin', '2003-01-17', 16),
('player16', 'Hannah Scott', '2004-12-05', 15),
('player17', 'Ian Somerhalder', '2002-08-23', 18),
('player18', 'Julia Roberts', '2005-06-11', 20),
('player19', 'Kevin Hart', '2003-02-28', 13),
('player20', 'Laura Linney', '2004-10-19', 17);

-- Sample Teams (TeamID increments automatically)
INSERT IGNORE INTO Team (TeamID, TeamName, Cusername) VALUES
(1, 'Red Dragons', 'player1'),
(2, 'Blue Tigers', 'player2'),
(3, 'Green Hornets', 'player3'),
(4, 'Yellow Lions', 'player4'),
(5, 'Silver Wolves', 'player5'),
(6, 'Golden Eagles', 'player6'),
(7, 'Black Panthers', 'player7'),
(8, 'White Sharks', 'player8'),
(9, 'Crimson Bears', 'player9'),
(10, 'Azure Falcons', 'player10'),
(11, 'Emerald Snakes', 'player11'),
(12, 'Violet Tigers', 'player12'),
(13, 'Orange Foxes', 'player13'),
(14, 'Indigo Hawks', 'player14'),
(15, 'Scarlet Lions', 'player15'),
(16, 'Cobalt Wolves', 'player16'),
(17, 'Bronze Bulls', 'player17'),
(18, 'Magenta Panthers', 'player18'),
(19, 'Turquoise Eagles', 'player19'),
(20, 'Pink Jaguars', 'player20');

-- Admin_Manages (link admins to teams, using same pattern)
INSERT IGNORE INTO Admin_Manages (Ausername, TeamID, StartDate) VALUES
('admin1', 1, '2025-01-01'),
('admin1', 2, '2025-01-01'),
('admin2', 3, '2025-01-01'),
('admin2', 4, '2025-01-01'),
('admin1', 5, '2025-01-01'),
('admin1', 6, '2025-01-01'),
('admin2', 7, '2025-01-01'),
('admin2', 8, '2025-01-01'),
('admin1', 9, '2025-01-01'),
('admin1', 10, '2025-01-01'),
('admin2', 11, '2025-01-01'),
('admin2', 12, '2025-01-01'),
('admin1', 13, '2025-01-01'),
('admin1', 14, '2025-01-01'),
('admin2', 15, '2025-01-01'),
('admin2', 16, '2025-01-01'),
('admin1', 17, '2025-01-01'),
('admin1', 18, '2025-01-01'),
('admin2', 19, '2025-01-01'),
('admin2', 20, '2025-01-01');

-- Sample Games (use TeamIDs instead of TeamNames)
INSERT IGNORE INTO Game (Time_Slot, Team1ID, Team2ID, WinnerTeamID, LoserTeamID) VALUES
('2025-10-25 10:00:00', 1, 2, 1, 2),
('2025-10-25 12:00:00', 3, 4, 4, 3),
('2025-10-26 10:00:00', 1, 3, 1, 3),
('2025-10-26 12:00:00', 2, 4, 4, 2),
('2025-10-27 10:00:00', 5, 6, 6, 5),
('2025-10-27 12:00:00', 7, 8, 7, 8),
('2025-10-28 10:00:00', 9, 10, 9, 10),
('2025-10-28 12:00:00', 11, 12, 11, 12),
('2025-10-29 10:00:00', 13, 14, 14, 13),
('2025-10-29 12:00:00', 15, 16, 15, 16),
('2025-10-30 10:00:00', 17, 18, 17, 18),
('2025-10-30 12:00:00', 19, 20, 20, 19),
('2025-10-31 10:00:00', 1, 5, 1, 5),
('2025-10-31 12:00:00', 2, 6, 2, 6),
('2025-11-01 10:00:00', 3, 7, 7, 3),
('2025-11-01 12:00:00', 4, 8, 4, 8),
('2025-11-02 10:00:00', 9, 11, 11, 9),
('2025-11-02 12:00:00', 10, 12, 12, 10),
('2025-11-03 10:00:00', 13, 15, 15, 13),
('2025-11-03 12:00:00', 14, 16, 14, 16);

-- Sample Scores (use TeamIDs)
INSERT IGNORE INTO Score (S_MatchID, SetID, Game_Point, Losing_TeamID, Winning_TeamID) VALUES
(1, 1, 21, 2, 1),
(1, 2, 18, 1, 2),
(1, 3, 21, 2, 1),

(2, 1, 15, 3, 4),
(2, 2, 21, 3, 4),
(2, 3, 12, 4, 3),
(3, 1, 21, 3, 1),
(3, 2, 21, 3, 1),
(4, 1, 19, 2, 4),
(4, 2, 21, 2, 4),
(5, 1, 18, 5, 6),
(5, 2, 21, 5, 6),
(6, 1, 21, 8, 7),
(6, 2, 19, 8, 7),
(7, 1, 21, 10, 9),
(7, 2, 17, 10, 9),
(8, 1, 21, 12, 11),
(8, 2, 14, 12, 11),
(9, 1, 21, 5, 1),
(9, 2, 15, 1, 5),
(10, 1, 21, 6, 2),
(10, 2, 18, 6, 2),
(11, 1, 20, 3, 7),
(11, 2, 22, 3, 7);

-- Sample Locations
INSERT IGNORE INTO Location (LMatch_ID, Name, State, StreetName, Zipcode, City) VALUES
(1, 'Stadium A', 'California', 'Main St', '90001', 'Los Angeles'),
(2, 'Stadium B', 'Texas', 'Broadway', '73301', 'Austin'),
(3, 'Stadium C', 'New York', '5th Ave', '10001', 'New York'),
(4, 'Stadium D', 'Florida', 'Ocean Dr', '33101', 'Miami'),
(5, 'Stadium E', 'Illinois', 'Lake Shore Dr', '60601', 'Chicago'),
(6, 'Stadium F', 'Nevada', 'Sunset Blvd', '89101', 'Las Vegas'),
(7, 'Stadium G', 'Ohio', 'High St', '43085', 'Columbus'),
(8, 'Stadium H', 'Georgia', 'Peachtree St', '30303', 'Atlanta'),
(9, 'Stadium I', 'Washington', 'Pine St', '98101', 'Seattle'),
(10, 'Stadium J', 'Colorado', 'Broadway', '80202', 'Denver'),
(11, 'Stadium K', 'Arizona', 'Central Ave', '85004', 'Phoenix'),
(12, 'Stadium L', 'Oregon', 'NW 6th Ave', '97209', 'Portland'),
(13, 'Stadium M', 'Michigan', 'Woodward Ave', '48226', 'Detroit'),
(14, 'Stadium N', 'Massachusetts', 'Boylston St', '02116', 'Boston'),
(15, 'Stadium O', 'Pennsylvania', 'Market St', '19103', 'Philadelphia'),
(16, 'Stadium P', 'Tennessee', 'Broadway St', '37203', 'Nashville'),
(17, 'Stadium Q', 'Minnesota', 'Hennepin Ave', '55403', 'Minneapolis'),
(18, 'Stadium R', 'Missouri', 'Grand Blvd', '63103', 'St. Louis'),
(19, 'Stadium S', 'Indiana', 'Meridian St', '46204', 'Indianapolis'),
(20, 'Stadium T', 'Kentucky', 'Main St', '40202', 'Louisville');

-- Optional 
USE TournamentDB2;
SHOW TABLES;
SELECT * FROM Admin;
SELECT * FROM Player;
SELECT * FROM Team;
SELECT * FROM Admin_Manages;
SELECT * FROM Game;
SELECT * FROM Score;
SELECT * FROM Location;