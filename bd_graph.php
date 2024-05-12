<?php

include 'db.php';

$authorId = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;

if ($authorId) {
    $authors = mysqli_query($connection, "SELECT a.id, a.name, COUNT(ap.IdPublications) AS total_publications FROM authors a
    LEFT JOIN authorpublication ap ON a.id = ap.IdAuthors
    WHERE a.id = $authorId
    GROUP BY a.id, a.name");
} else {
    $authors = mysqli_query($connection, "SELECT a.id, a.name, COUNT(ap.IdPublications) AS total_publications FROM authors a
    LEFT JOIN authorpublication ap ON a.id = ap.IdAuthors
    GROUP BY a.id, a.name");
}

$authorsData = [];
while ($row = mysqli_fetch_assoc($authors)) {
    $authorsData[] = [
        'id' => $row['id'],
        'label' => $row['name'] . ', ' . "\n" . $row['total_publications'] . ' пуб.'
    ];
}

mysqli_close($connection);

header('Content-Type: application/json');
echo json_encode(['nodes' => $authorsData]);
?>