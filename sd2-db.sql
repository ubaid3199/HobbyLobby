-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Feb 26, 2025 at 09:26 PM
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
(3, 'Travel');

-- --------------------------------------------------------

--
-- Table structure for table `Hobbies`
--

CREATE TABLE `Hobbies` (
  `hobbyID` int NOT NULL,
  `hobbyName` varchar(100) NOT NULL,
  `description` text,
  `ownerID` int NOT NULL,
  `categoryID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Hobbies`
--

INSERT INTO `Hobbies` (`hobbyID`, `hobbyName`, `description`, `ownerID`, `categoryID`) VALUES
(1, 'Oil Painting', 'Exploring oil painting techniques for beginners.', 1, 1),
(2, 'Sketching', 'Basic sketching and shading lessons.', 2, 1),
(3, 'Chess Club', 'A group for playing and improving chess skills.', 3, 2),
(4, 'Travel Vlogging', 'Sharing travel experiences and tips.', 4, 3),
(5, 'Book Club', 'Weekly book reading and discussion sessions.', 5, 4),
(6, 'Cooking Class', 'Teaching different cultural cuisines.', 6, 5),
(7, 'Football Training', 'Organized training for local football enthusiasts.', 8, 6),
(8, 'Basketball Coaching', 'Teaching fundamental basketball skills.', 12, 6),
(9, 'Guitar Jamming', 'Collaborative guitar jam sessions.', 9, 7),
(10, 'Music Production', 'Creating beats and learning music software.', 13, 7),
(11, 'Podcasting', 'Learning how to create and publish podcasts.', 10, 8),
(12, 'Coding Bootcamp', 'Introduction to programming and web development.', 11, 9),
(13, 'Drone Flying', 'Beginner drone flying tutorials.', 7, 9);

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
(10, 4);

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
(6, 8, 12, 'Do you teach basketball moves and skills');

-- --------------------------------------------------------

--
-- Table structure for table `Reviews`
--

CREATE TABLE `Reviews` (
  `reviewID` int NOT NULL,
  `userID` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comments` text
) ;

--
-- Dumping data for table `Reviews`
--

INSERT INTO `Reviews` (`reviewID`, `userID`, `rating`, `comments`) VALUES
(3, 1, 5, 'Had a great time learning chess from Edward.'),
(4, 2, 4, 'The book club had an amazing discussion about Game of Thrones.'),
(5, 6, 5, 'Football training was really professional and fun!'),
(6, 10, 3, 'The podcast equipment was slightly outdated other studios dont have thee same equipment'),
(7, 4, 5, 'Kanye was an amazing Musician.'),
(8, 8, 4, 'Lebron James is the best ive seen at basketball.');

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
(3, 'Advanced'),
(1, 'Beginner'),
(2, 'Intermediate'),
(4, 'Professional');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `userID` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`userID`, `name`, `email`, `location`, `created_at`) VALUES
(1, 'Stiles Stevens', 'stiles@hobbylobby.com', 'West London', '2025-02-26 20:54:52'),
(2, 'Jessica Davis', 'jessica@hobbylobby.com', 'North London', '2025-02-26 20:54:52'),
(3, 'Edward Cullen', 'edward@hobbylobby.com', 'East London', '2025-02-26 20:54:52'),
(4, 'Dexter Morgan', 'dexter@hobbylobby.com', 'South London', '2025-02-26 20:54:52'),
(5, 'Brian Moser', 'brian@hobbylobby.com', 'East London', '2025-02-26 20:54:52'),
(6, 'Ben Parker', 'ben@hobbylobby.com', 'North London', '2025-02-26 20:54:52'),
(7, 'Becky Smith', 'becky@hobbylobby.com', 'West London', '2025-02-26 20:54:52'),
(8, 'John Terry', 'john@hobbylobby.com', 'East London', '2025-02-26 20:54:52'),
(9, 'Frank Lampard', 'frank@hobbylobby.com', 'South London', '2025-02-26 20:54:52'),
(10, 'Oliver Queen', 'oliver@hobbylobby.com', 'Central London', '2025-02-26 20:54:52'),
(11, 'Cole Bennett', 'Cole@hobbylobby.com', 'Central London', '2025-02-26 20:54:52'),
(12, 'Lebron James', 'lebron@hobbylobby.com', 'South London', '2025-02-26 20:54:52'),
(13, 'Kanye West', 'kanye@hobbylobby.com', 'Central London', '2025-02-26 20:54:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`categoryID`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `Hobbies`
--
ALTER TABLE `Hobbies`
  ADD PRIMARY KEY (`hobbyID`),
  ADD KEY `ownerID` (`ownerID`),
  ADD KEY `categoryID` (`categoryID`);

--
-- Indexes for table `Hobby_Tags`
--
ALTER TABLE `Hobby_Tags`
  ADD PRIMARY KEY (`hobbyID`,`tagID`),
  ADD KEY `tagID` (`tagID`);

--
-- Indexes for table `Messages`
--
ALTER TABLE `Messages`
  ADD PRIMARY KEY (`messageID`),
  ADD KEY `senderID` (`senderID`),
  ADD KEY `receiverID` (`receiverID`);

--
-- Indexes for table `Reviews`
--
ALTER TABLE `Reviews`
  ADD PRIMARY KEY (`reviewID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `Tags`
--
ALTER TABLE `Tags`
  ADD PRIMARY KEY (`tagID`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `categoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `Hobbies`
--
ALTER TABLE `Hobbies`
  MODIFY `hobbyID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `Messages`
--
ALTER TABLE `Messages`
  MODIFY `messageID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `Reviews`
--
ALTER TABLE `Reviews`
  MODIFY `reviewID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Tags`
--
ALTER TABLE `Tags`
  MODIFY `tagID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `userID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Hobbies`
--
ALTER TABLE `Hobbies`
  ADD CONSTRAINT `hobbies_ibfk_1` FOREIGN KEY (`ownerID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `hobbies_ibfk_2` FOREIGN KEY (`categoryID`) REFERENCES `Categories` (`categoryID`) ON DELETE CASCADE;

--
-- Constraints for table `Hobby_Tags`
--
ALTER TABLE `Hobby_Tags`
  ADD CONSTRAINT `hobby_tags_ibfk_1` FOREIGN KEY (`hobbyID`) REFERENCES `Hobbies` (`hobbyID`) ON DELETE CASCADE,
  ADD CONSTRAINT `hobby_tags_ibfk_2` FOREIGN KEY (`tagID`) REFERENCES `Tags` (`tagID`) ON DELETE CASCADE;

--
-- Constraints for table `Messages`
--
ALTER TABLE `Messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiverID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `Reviews`
--
ALTER TABLE `Reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
