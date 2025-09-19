-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 19, 2025 at 04:18 PM
-- Server version: 8.0.42-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.21

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `food_delivery`
--
CREATE DATABASE IF NOT EXISTS `food_delivery` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `food_delivery`;

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE IF NOT EXISTS `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(255) NOT NULL,
  `vehicle_type` enum('bike','scooter','car','van') DEFAULT NULL,
  `status` enum('offline','available','on_delivery','break') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `full_name`, `phone`, `vehicle_type`, `status`) VALUES(2, 'Ahmed', '+989716458864512', 'car', 'on_delivery');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `driver_id` int DEFAULT NULL,
  `restaurant_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('Confirmed','Preparing','Ready','Picked up','Delivered') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_orders_user` (`user_id`),
  KEY `fk_orders_driver` (`driver_id`),
  KEY `resturant_idx` (`restaurant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `driver_id`, `restaurant_id`, `name`, `details`, `status`) VALUES(1, 2, 2, 1, 'package', 'oerihgowiefklqhetbginjklm;', 'Delivered');
INSERT INTO `orders` (`id`, `user_id`, `driver_id`, `restaurant_id`, `name`, `details`, `status`) VALUES(2, 2, 2, 3, 'wefewerg', 'erhrt4knhg3kie', 'Preparing');
INSERT INTO `orders` (`id`, `user_id`, `driver_id`, `restaurant_id`, `name`, `details`, `status`) VALUES(3, 2, NULL, 1, 'pizza', 'sliced', NULL);
INSERT INTO `orders` (`id`, `user_id`, `driver_id`, `restaurant_id`, `name`, `details`, `status`) VALUES(4, 2, NULL, 1, 'burger', 'sliced', NULL);
INSERT INTO `orders` (`id`, `user_id`, `driver_id`, `restaurant_id`, `name`, `details`, `status`) VALUES(5, 2, NULL, 1, 'burger', 'sliced', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `paymentmethods`
--

CREATE TABLE IF NOT EXISTS `paymentmethods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `payment_method` enum('Paypal','CreditCard') DEFAULT NULL,
  `payment_details` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_paymentmethods_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant`
--

CREATE TABLE IF NOT EXISTS `restaurant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `restaurant`
--

INSERT INTO `restaurant` (`id`, `name`, `city`, `location`) VALUES(1, 'FireBall Resturant 1', 'gaza', 'al-remal street');
INSERT INTO `restaurant` (`id`, `name`, `city`, `location`) VALUES(2, 'FireBall Resturant 2', 'hebron', 'erhotyjogiewmnntr');
INSERT INTO `restaurant` (`id`, `name`, `city`, `location`) VALUES(3, 'FireBall Resturant 3', 'Jerusalem ', 'rwoijehoieogrijertergwr4w');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `country` varchar(20) DEFAULT NULL,
  `role` enum('user','admin','driver') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `phone_number`, `location`, `country`, `role`) VALUES(1, 'khalilxd', 'driver@hotmail.com', '$2b$10$z2fkbhH4lBsvIVSNcThTAOv8MVhPEM8BY3tnT.0M9qEP1RAmc4c0W', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `phone_number`, `location`, `country`, `role`) VALUES(2, 'userKhalil', 'user@hotmail.com', '$2b$10$LYorqUjp8GKPfHpvQwAZAeh0PC6rlUOH42cho1/ZqAy7YKivYUzqC', NULL, NULL, NULL, NULL);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `paymentmethods`
--
ALTER TABLE `paymentmethods`
  ADD CONSTRAINT `fk_paymentmethods_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
SET FOREIGN_KEY_CHECKS=1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;