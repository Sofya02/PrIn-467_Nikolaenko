<?php
include 'db.php';

$authorId = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;

if ($authorId) {
    $publications = mysqli_query($connection, "SELECT p.id, p.title FROM publications p
    JOIN authorpublication ap ON p.id = ap.IdPublications
    WHERE ap.IdAuthors = $authorId");

    $publicationsData = [];
    while ($row = mysqli_fetch_assoc($publications)) {
        $publicationsData[] = [
            'id' => $row['id'],
            'title' => $row['title']
        ];
    }

    mysqli_close($connection);

    header('Content-Type: application/json');
    echo json_encode($publicationsData);
}
?>