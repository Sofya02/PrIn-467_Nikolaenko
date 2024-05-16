<?php
include 'db.php';

$result = mysqli_query($connection, "SELECT id, name FROM types_of_publications");

$typesData = [];
while ($row = mysqli_fetch_assoc($result)) {
    $typesData[] = $row;
}



mysqli_close($connection);

header('Content-Type: application/json');
echo json_encode($typesData);
?>