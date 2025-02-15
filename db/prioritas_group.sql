-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Feb 15, 2025 at 12:46 PM
-- Server version: 5.7.39
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prioritas_group`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_products`
--

CREATE TABLE `tbl_products` (
  `id` int(11) NOT NULL COMMENT 'ID Produk',
  `name` varchar(255) NOT NULL COMMENT 'Nama Produk',
  `price` decimal(10,2) NOT NULL COMMENT 'Harga Produk',
  `stock` int(11) NOT NULL COMMENT 'Jumlah Stok',
  `is_sell` tinyint(1) NOT NULL COMMENT 'Status Produk (Dijual / Tidak Dijual)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp saat produk dibuat',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp saat produk diperbarui'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_products`
--

INSERT INTO `tbl_products` (`id`, `name`, `price`, `stock`, `is_sell`, `created_at`, `updated_at`) VALUES
(1, 'Smart TV Samsung 42 inc', '6500000.00', 20, 1, '2025-02-15 12:35:26', '2025-02-15 12:35:26'),
(2, 'Mesin Cuci LG Front', '4500000.00', 15, 1, '2025-02-15 12:25:39', '2025-02-15 12:25:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_products`
--
ALTER TABLE `tbl_products`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_products`
--
ALTER TABLE `tbl_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID Produk', AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
