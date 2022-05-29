-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 04, 2022 at 01:26 PM
-- Server version: 10.4.6-MariaDB
-- PHP Version: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `penggajiansym`
--

-- --------------------------------------------------------

--
-- Table structure for table `bagian`
--

CREATE TABLE `bagian` (
  `idBagian` int(11) NOT NULL,
  `namaBagian` varchar(50) DEFAULT NULL,
  `uangMakan` int(11) DEFAULT NULL,
  `insentif` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `bagian`
--

INSERT INTO `bagian` (`idBagian`, `namaBagian`, `uangMakan`, `insentif`) VALUES
(122, 'Produksi', 10000, 2000),
(123, 'Sortir', 8000, 2000),
(124, 'Administrasi', 5000, 2000);

-- --------------------------------------------------------

--
-- Table structure for table `gaji`
--

CREATE TABLE `gaji` (
  `idGaji` int(11) NOT NULL,
  `nik` int(11) NOT NULL,
  `tgl` date NOT NULL,
  `mulaiTglHit` date NOT NULL,
  `akhirTglHit` date NOT NULL,
  `jumHariMasuk` int(11) DEFAULT NULL,
  `jumJamLembur` int(11) DEFAULT NULL,
  `gajiPokok` int(11) NOT NULL,
  `totInsentif` int(11) DEFAULT NULL,
  `uangMakan` int(11) DEFAULT NULL,
  `uangLainlain` int(11) DEFAULT NULL,
  `potonganLainnya` int(11) DEFAULT NULL,
  `potKasbon` int(11) DEFAULT NULL,
  `uangLembur` int(11) DEFAULT NULL,
  `jumGaji` int(11) NOT NULL,
  `ket` tinytext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `gaji`
--

INSERT INTO `gaji` (`idGaji`, `nik`, `tgl`, `mulaiTglHit`, `akhirTglHit`, `jumHariMasuk`, `jumJamLembur`, `gajiPokok`, `totInsentif`, `uangMakan`, `uangLainlain`, `potonganLainnya`, `potKasbon`, `uangLembur`, `jumGaji`, `ket`) VALUES
(73, 10, '2021-06-05', '2021-06-05', '2021-06-18', 11, 5, 1320000, 22000, 8000, 0, 0, 0, 85714, 1435714, 'ssad'),
(74, 11, '2021-06-05', '2021-06-05', '2021-06-18', 10, 0, 800000, 20000, 0, 10000, 10000, 0, 0, 820000, ''),
(75, 10, '2021-06-06', '2021-06-05', '2021-06-18', 11, 5, 1320000, 22000, 8000, 0, 0, 25000, 85714, 1410714, '');

-- --------------------------------------------------------

--
-- Table structure for table `karyawan`
--

CREATE TABLE `karyawan` (
  `nik` int(11) NOT NULL,
  `idBagian` int(11) DEFAULT NULL,
  `nama` varchar(50) DEFAULT NULL,
  `jenKelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `alamat` varchar(100) DEFAULT NULL,
  `tempat` varchar(50) DEFAULT NULL,
  `tglLahir` date DEFAULT NULL,
  `agama` varchar(50) DEFAULT NULL,
  `noTelp` varchar(20) NOT NULL,
  `foto` varchar(50) DEFAULT NULL,
  `upahPerHari` int(11) DEFAULT NULL,
  `tglMasuk` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `karyawan`
--

INSERT INTO `karyawan` (`nik`, `idBagian`, `nama`, `jenKelamin`, `alamat`, `tempat`, `tglLahir`, `agama`, `noTelp`, `foto`, `upahPerHari`, `tglMasuk`) VALUES
(10, 123, 'Cristiano Ronaldo', 'Laki-laki', 'sambogunung dukun gresik', 'Gresik', '1990-10-10', 'islam', '0857xxx', 'foto1622853254856.png', 120000, '2020-12-12'),
(11, 122, 'Lionel Messi', 'Laki-laki', 'Melirang Bungah Gresik', 'Gresik', '1991-12-12', 'Kristen', '089xxx', 'foto1622853496765.png', 80000, '2021-12-19'),
(15, 123, 'Mifbahul Afaq', 'Laki-laki', 'melirang gresik', 'gresik', '1990-11-12', 'islam', '09832878', 'foto1622865005932.png', 100000, '2021-06-05');

-- --------------------------------------------------------

--
-- Table structure for table `kasbon`
--

CREATE TABLE `kasbon` (
  `idKasbon` int(11) NOT NULL,
  `nik` int(11) DEFAULT NULL,
  `tgl` date DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `sisa` int(11) DEFAULT NULL,
  `bayar` int(11) DEFAULT NULL,
  `statusKas` enum('Lunas','Belum Lunas') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `kasbon`
--

INSERT INTO `kasbon` (`idKasbon`, `nik`, `tgl`, `jumlah`, `sisa`, `bayar`, `statusKas`) VALUES
(27, 10, '2021-12-12', 50000, 25000, 0, 'Belum Lunas');

-- --------------------------------------------------------

--
-- Table structure for table `kehadiran`
--

CREATE TABLE `kehadiran` (
  `idKehadiran` int(11) NOT NULL,
  `nik` int(11) NOT NULL,
  `tgl` date NOT NULL,
  `statusKeh` enum('Masuk','Sakit','Izin','Alpa','Libur') NOT NULL,
  `jamLembur` int(11) DEFAULT NULL,
  `ket` tinytext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `kehadiran`
--

INSERT INTO `kehadiran` (`idKehadiran`, `nik`, `tgl`, `statusKeh`, `jamLembur`, `ket`) VALUES
(138, 10, '2021-06-05', 'Masuk', 0, ''),
(139, 11, '2021-06-05', 'Masuk', 0, ''),
(140, 10, '2021-06-06', 'Masuk', 0, ''),
(141, 11, '2021-06-06', 'Libur', 0, ''),
(142, 10, '2021-06-07', 'Izin', 0, 'lembur'),
(143, 11, '2021-06-07', 'Masuk', 0, ''),
(144, 10, '2021-06-08', 'Masuk', 5, ''),
(145, 11, '2021-06-08', 'Masuk', 0, ''),
(146, 10, '2021-06-09', 'Masuk', 0, ''),
(147, 11, '2021-06-09', 'Masuk', 0, ''),
(148, 10, '2021-06-10', 'Masuk', 0, ''),
(149, 11, '2021-06-10', 'Masuk', 0, ''),
(150, 10, '2021-06-11', 'Alpa', 0, ''),
(151, 11, '2021-06-11', 'Alpa', 0, ''),
(152, 10, '2021-06-12', 'Masuk', 0, ''),
(153, 11, '2021-06-12', 'Masuk', 0, ''),
(154, 10, '2021-06-13', 'Masuk', 0, ''),
(155, 11, '2021-06-13', 'Libur', 0, ''),
(156, 10, '2021-06-14', 'Masuk', 0, ''),
(157, 11, '2021-06-14', 'Masuk', 0, ''),
(158, 10, '2021-06-15', 'Sakit', 0, ''),
(159, 11, '2021-06-15', 'Sakit', 0, ''),
(160, 10, '2021-06-16', 'Masuk', 0, ''),
(161, 11, '2021-06-16', 'Masuk', 0, ''),
(162, 10, '2021-06-17', 'Masuk', 0, ''),
(163, 11, '2021-06-17', 'Masuk', 0, ''),
(164, 10, '2021-06-18', 'Masuk', 0, ''),
(165, 11, '2021-06-18', 'Masuk', 0, ''),
(166, 10, '2021-06-19', 'Masuk', 10, ''),
(167, 11, '2021-06-19', 'Sakit', 0, ''),
(168, 10, '2021-06-20', 'Masuk', 0, ''),
(169, 11, '2021-06-20', 'Masuk', 0, ''),
(170, 15, '2021-06-20', 'Masuk', 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `idUser` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `hakAkses` enum('Administrasi','HRD','Supervisor') NOT NULL,
  `rememberMe` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`idUser`, `username`, `password`, `hakAkses`, `rememberMe`) VALUES
(1, 'adm', '$2b$10$8lBv07bFPV0ZI/L2qQGGjOX5EComd.0EgeFddXDzXeM.N0721j68W', 'Administrasi', 'c3b32fc46e4f3febcc10b6bfc8692e3548f03443943d7b3eac3925e1b3c1'),
(2, 'hrd', '$2b$10$cEecq9wDcTk14BjFu6mafOEaJKZAI9q.lJDxNHAlkpNj1M/WUrYce', 'HRD', 'e45400dff1c838b3abf48d08ee52f57686cfb4d3c37549cfe8aca3bf48b2'),
(3, 'spv', '$2b$10$9SZhQiFc6cxUgdkSpgkQOeB7LHq8wigGxGACZxjmjd/93cdXhJkAi', 'Supervisor', 'c17ed402efa9f4300091a5c4670c4e54a08615663618e87c7a306823c253');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bagian`
--
ALTER TABLE `bagian`
  ADD PRIMARY KEY (`idBagian`);

--
-- Indexes for table `gaji`
--
ALTER TABLE `gaji`
  ADD PRIMARY KEY (`idGaji`),
  ADD KEY `nik` (`nik`);

--
-- Indexes for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD PRIMARY KEY (`nik`),
  ADD KEY `idBagian` (`idBagian`);

--
-- Indexes for table `kasbon`
--
ALTER TABLE `kasbon`
  ADD PRIMARY KEY (`idKasbon`),
  ADD KEY `nik` (`nik`);

--
-- Indexes for table `kehadiran`
--
ALTER TABLE `kehadiran`
  ADD PRIMARY KEY (`idKehadiran`),
  ADD KEY `nik` (`nik`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`idUser`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bagian`
--
ALTER TABLE `bagian`
  MODIFY `idBagian` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `gaji`
--
ALTER TABLE `gaji`
  MODIFY `idGaji` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `kasbon`
--
ALTER TABLE `kasbon`
  MODIFY `idKasbon` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `kehadiran`
--
ALTER TABLE `kehadiran`
  MODIFY `idKehadiran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `idUser` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gaji`
--
ALTER TABLE `gaji`
  ADD CONSTRAINT `gaji_ibfk_1` FOREIGN KEY (`nik`) REFERENCES `karyawan` (`nik`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD CONSTRAINT `karyawan_ibfk_1` FOREIGN KEY (`idBagian`) REFERENCES `bagian` (`idBagian`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kasbon`
--
ALTER TABLE `kasbon`
  ADD CONSTRAINT `kasbon_ibfk_1` FOREIGN KEY (`nik`) REFERENCES `karyawan` (`nik`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kehadiran`
--
ALTER TABLE `kehadiran`
  ADD CONSTRAINT `kehadiran_ibfk_1` FOREIGN KEY (`nik`) REFERENCES `karyawan` (`nik`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
