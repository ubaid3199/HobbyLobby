-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Apr 05, 2025 at 01:08 AM
-- Server version: 9.2.0
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sd2-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `Categories`
--

CREATE TABLE `Categories` (
  `categoryID` int NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Categories`
--

INSERT INTO `Categories` (`categoryID`, `name`) VALUES
(1, 'Art & Crafts'),
(4, 'Books'),
(5, 'Food'),
(2, 'Gaming'),
(7, 'Music'),
(8, 'Social Media'),
(6, 'Sports'),
(9, 'Technology'),
(3, 'Travel'),
(10, 'Photography'),
(11, 'Dancing'),
(12, 'Gardening'),
(13, 'Fitness'),
(14, 'Writing');

-- --------------------------------------------------------

--
-- Table structure for table `Hobbies`
--

CREATE TABLE `Hobbies` (
  `hobbyID` int NOT NULL,
  `hobbyName` varchar(100) NOT NULL,
  `description` text,
  `categoryID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Hobbies`
--

INSERT INTO `Hobbies` (`hobbyID`, `hobbyName`, `description`, `categoryID`) VALUES
(1, 'Oil Painting', 'Exploring oil painting techniques for beginners.', 1),
(2, 'Sketching', 'Basic sketching and shading lessons.', 1),
(3, 'Chess Club', 'A group for playing and improving chess skills.', 2),
(4, 'Travel Vlogging', 'Sharing travel experiences and tips.', 3),
(5, 'Book Club', 'Weekly book reading and discussion sessions.', 4),
(6, 'Cooking Class', 'Teaching different cultural cuisines.', 5),
(7, 'Football Training', 'Organized training for local football enthusiasts.', 6),
(8, 'Basketball Coaching', 'Teaching fundamental basketball skills.', 6),
(9, 'Guitar Jamming', 'Collaborative guitar jam sessions.', 7),
(10, 'Music Production', 'Creating beats and learning music software.', 7),
(11, 'Podcasting', 'Learning how to create and publish podcasts.', 8),
(12, 'Coding Bootcamp', 'Introduction to programming and web development.', 9),
(13, 'Drone Flying', 'Beginner drone flying tutorials.', 9),
(14, 'Digital Photography', 'Learn the basics of digital photography and editing.', 10),
(15, 'Salsa Dancing', 'Join our salsa dancing classes for all levels.', 11),
(16, 'Urban Gardening', 'Tips and tricks for gardening in small spaces.', 12),
(17, 'Yoga Classes', 'Relaxing yoga sessions for beginners and intermediates.', 13),
(18, 'Creative Writing', 'Workshops to improve your creative writing skills.', 14),
(19, 'Street Photography', 'Capturing the essence of urban life through photography.', 10),
(20, 'Zumba Fitness', 'High-energy Zumba classes to keep you fit.', 13),
(21, 'Volleyball', 'A fun environment to play and improve your skills', 6),
(22, 'TryE1', 'abc', 14);

-- --------------------------------------------------------

--
-- Table structure for table `Hobby_Tags`
--

CREATE TABLE `Hobby_Tags` (
  `hobbyID` int NOT NULL,
  `tagID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Hobby_Tags`
--

INSERT INTO `Hobby_Tags` (`hobbyID`, `tagID`) VALUES
(1, 1),
(5, 1),
(13, 1),
(2, 2),
(4, 2),
(6, 2),
(9, 2),
(11, 2),
(3, 3),
(12, 3),
(7, 4),
(8, 4),
(10, 4),
(14, 1),
(15, 2),
(16, 1),
(17, 2),
(18, 3),
(19, 2),
(20, 4),
(21, 4),
(22, 4);

-- --------------------------------------------------------

--
-- Table structure for table `Messages`
--

CREATE TABLE `Messages` (
  `messageID` int NOT NULL,
  `senderID` int NOT NULL,
  `receiverID` int NOT NULL,
  `content` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Messages`
--

INSERT INTO `Messages` (`messageID`, `senderID`, `receiverID`, `content`) VALUES
(1, 1, 3, 'Hey Edward, I would love to join the Chess Club!'),
(2, 2, 5, 'Whats up Brian, what books are you currently discussing in the book club?'),
(3, 6, 9, 'Hey its Ben, I am interested in your football training sessions.'),
(4, 10, 11, 'Can you teach me how to use the podcasting equipment?'),
(5, 4, 13, 'Hey Kanye, I’d like to learn more about Music from you.'),
(6, 8, 12, 'Do you teach basketball moves and skills'),
(7, 14, 15, 'Hi Tom, I would love to join your salsa dancing classes!'),
(8, 16, 17, 'Hey Brad, can you tell me more about your yoga classes?'),
(9, 18, 19, 'Hi Chris, I am interested in your street photography sessions.'),
(10, 20, 14, 'Emma, can you recommend a good camera for beginners?'),
(11, 15, 16, 'Angelina, I would like to learn more about urban gardening.'),
(12, 28, 5, 'Hi waas curious about getting in touch to learn more about the hobby you teach'),
(13, 29, 28, 'yooooo\r\n'),
(14, 29, 28, 'try 123');

-- --------------------------------------------------------

--
-- Table structure for table `Reviews`
--

CREATE TABLE `Reviews` (
  `reviewID` int NOT NULL,
  `userID` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comments` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Reviews`
--

INSERT INTO `Reviews` (`reviewID`, `userID`, `rating`, `comments`) VALUES
(3, 1, 5, 'Had a great time learning chess from Edward.'),
(4, 2, 4, 'The book club had an amazing discussion about Game of Thrones.'),
(5, 6, 5, 'Football training was really professional and fun!'),
(6, 10, 3, 'The podcast equipment was slightly outdated other studios dont have thee same equipment'),
(7, 4, 5, 'Kanye was an amazing Musician.'),
(8, 8, 4, 'Lebron James is the best ive seen at basketball.'),
(9, 14, 5, 'Digital photography class was very informative.'),
(10, 15, 4, 'Salsa dancing was fun and well-organized.'),
(11, 16, 5, 'Urban gardening tips were very practical.'),
(12, 17, 4, 'Yoga classes were relaxing and well-taught.'),
(13, 18, 5, 'Creative writing workshop was inspiring.'),
(14, 19, 4, 'Street photography session was very engaging.'),
(15, 20, 5, 'Zumba fitness class was energetic and fun.');

-- --------------------------------------------------------

--
-- Table structure for table `Tags`
--

CREATE TABLE `Tags` (
  `tagID` int NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Tags`
--

INSERT INTO `Tags` (`tagID`, `name`) VALUES
(1, 'Beginner'),
(2, 'Intermediate'),
(3, 'Advanced'),
(4, 'Professional');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `userID` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `travel_locations` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `hobbies` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`userID`, `name`, `email`, `password`, `dob`, `gender`, `location`, `travel_locations`, `created_at`, `hobbies`) VALUES
(1, 'Stiles Stevens', 'stiles@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2000-04-17', 'Other', 'West London', 'South London, West London', '2025-02-26 20:54:52', NULL),
(2, 'Jessica Davis', 'jessica@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2005-03-01', 'Female', 'North London', 'North London, Central London', '2025-02-26 20:54:52', NULL),
(3, 'Edward Cullen', 'edward@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2006-11-19', 'Female', 'East London', 'Central London, East London, North London', '2025-02-26 20:54:52', NULL),
(4, 'Dexter Morgan', 'dexter@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2001-01-31', 'Female', 'South London', 'North London, South London, Central London', '2025-02-26 20:54:52', NULL),
(5, 'Brian Moser', 'brian@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2002-09-21', 'Male', 'East London', 'Central London, East London', '2025-02-26 20:54:52', NULL),
(6, 'Ben Parker', 'ben@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1990-08-18', 'Male', 'West London', 'South London, West London', '2025-02-26 20:54:52', NULL),
(7, 'Becky Smiths', 'becky@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1996-07-27', 'Female', 'North London', 'North London, South London', '2025-02-26 20:54:52', NULL),
(8, 'John Terry', 'john@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1999-06-12', 'Male', 'East London', 'East London, Central London, North London', '2025-02-26 20:54:52', NULL),
(9, 'Frank Lampard', 'frank@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1989-04-10', 'Male', 'South London', 'South London, West London, East London', '2025-02-26 20:54:52', NULL),
(10, 'Oliver Queen', 'oliver@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1986-05-07', 'Male', 'South London', 'South London, West London', '2025-02-26 20:54:52', NULL),
(11, 'Cole Bennett', 'cole@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2004-04-09', 'Male', 'Central London', 'Central London, North London', '2025-02-26 20:54:52', NULL),
(12, 'Lebron James', 'lebron@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1983-10-02', 'Male', 'South London', 'South London, Central London', '2025-02-26 20:54:52', NULL),
(13, 'Kanye West', 'kanye@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2000-12-22', 'Male', 'Central London', 'Central London, North London, East London', '2025-02-26 20:54:52', NULL),
(14, 'Emma Watson', 'emma@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1972-11-16', 'Female', 'West London', 'South London, West London', '2025-02-26 20:54:52', NULL),
(15, 'Tom Hanks', 'tom@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1965-03-03', 'Male', 'North London', 'North London, Central London, East London', '2025-02-26 20:54:52', NULL),
(16, 'Angelina Jolie', 'angelina@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1994-04-14', 'Male', 'East London', 'East London, South London, Central London', '2025-02-26 20:54:52', NULL),
(17, 'Bradd Pitt', 'brad@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2001-04-17', 'Male', 'South London', 'South London, Central London, West London', '2025-02-26 20:54:52', NULL),
(18, 'Chris Hemsworth', 'thor@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1991-05-10', 'Male', 'West London', 'West London, Central London, North London', '2025-02-26 20:54:52', NULL),
(19, 'Scarlett Johansson', 'widow@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '2010-08-27', 'Female', 'Central London', 'Central London, North London, East London', '2025-02-26 20:54:52', NULL),
(20, 'Jennifer Lawrence', 'jenn@hobbylobby.com', '$2a$10$7ZbfOqPqjV/SKDY4sAzxpeNkUVEQo8yTO5J1ZQHyLU2LK2GpT6CFi', '1992-02-21', 'Male', 'North London', 'North London, Central London, West London', '2025-02-26 20:54:52', NULL),
(28, 'Ramzi Salah', 'ramboss@hobbylobby.com', '$2b$10$cG/NC4UsfzMl8uyDm8UlfO03KBpuE4Xdu2Rgmc3g9D87/mLpSt3D.', '2004-03-10', 'male', 'North London', 'North London, East London, Central London, West London', '2025-04-04 10:35:21', NULL),
(29, 'Ehtesham Mumtaz', 'pkhackers7@gmail.com', '$2b$10$/Tj9BCCa5vcaDFbh6KVpEut8osIp1NuqxOZE2LEOZVR07Y3LcvlmK', '2000-01-01', 'male', 'West London', 'North London, South London', '2025-04-05 01:02:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `User_Hobbies`
--

CREATE TABLE `User_Hobbies` (
  `userID` int NOT NULL,
  `hobbyID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `User_Hobbies`
--

INSERT INTO `User_Hobbies` (`userID`, `hobbyID`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(8, 7),
(12, 8),
(9, 9),
(13, 10),
(10, 11),
(11, 12),
(7, 13),
(14, 14),
(15, 15),
(16, 16),
(17, 17),
(18, 18),
(19, 19),
(20, 20),
(28, 21),
(29, 22);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Hobbies`
--
ALTER TABLE `Hobbies`
  ADD PRIMARY KEY (`hobbyID`);

--
-- Indexes for table `Messages`
--
ALTER TABLE `Messages`
  ADD PRIMARY KEY (`messageID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`userID`);

--
-- Indexes for table `User_Hobbies`
--
ALTER TABLE `User_Hobbies`
  ADD PRIMARY KEY (`userID`,`hobbyID`),
  ADD KEY `user_hobbies_ibfk_2` (`hobbyID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Hobbies`
--
ALTER TABLE `Hobbies`
  MODIFY `hobbyID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `Messages`
--
ALTER TABLE `Messages`
  MODIFY `messageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `userID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `User_Hobbies`
--
ALTER TABLE `User_Hobbies`
  ADD CONSTRAINT `user_hobbies_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`),
  ADD CONSTRAINT `user_hobbies_ibfk_2` FOREIGN KEY (`hobbyID`) REFERENCES `Hobbies` (`hobbyID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
