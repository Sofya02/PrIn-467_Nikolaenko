<?php
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'author_network';

$connection = mysqli_connect($host, $user, $password, $database);

if (!$connection) {
    die('Ошибка подключения к базе данных: ' . mysqli_connect_error());
}

// mysqli_close($connection);

?>


