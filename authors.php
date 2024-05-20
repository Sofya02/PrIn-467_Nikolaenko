<?php
include 'db.php';

// Получаем данные об авторах из базы данных
$result = mysqli_query($connection, "SELECT id, name FROM authors");

// Формируем массив данных об авторах
$authors = [];
while ($row = mysqli_fetch_assoc($result)) {
    $authors[] = $row;
}

// Закрываем соединение с базой данных
mysqli_close($connection);

// Возвращаем данные в формате JSON
header('Content-Type: application/json');
echo json_encode($authors);
?>