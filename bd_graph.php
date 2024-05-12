<?php
include 'db.php';

$authorId = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;

if ($authorId) {
    $authors = mysqli_query($connection, "SELECT a.id, a.name, COUNT(ap.IdPublications) AS total_publications, GROUP_CONCAT(DISTINCT CONCAT(b.name, ', ', IFNULL(c.publication_count, 0)) SEPARATOR ', ') AS coauthors FROM authors a
    LEFT JOIN authorpublication ap ON a.id = ap.IdAuthors
    LEFT JOIN (
        SELECT ap2.IdAuthors, COUNT(ap2.IdPublications) AS publication_count
        FROM authorpublication ap2
        GROUP BY ap2.IdAuthors
    ) c ON ap.IdPublications = c.IdAuthors
    LEFT JOIN authorpublication ap2 ON ap.IdPublications = ap2.IdPublications AND ap2.IdAuthors != a.id
    LEFT JOIN authors b ON ap2.IdAuthors = b.id
    WHERE a.id = $authorId
    GROUP BY a.id, a.name");
} else {
    $authors = mysqli_query($connection, "SELECT a.id, a.name, COUNT(ap.IdPublications) AS total_publications, GROUP_CONCAT(DISTINCT CONCAT(b.name, ', ', IFNULL(c.publication_count, 0)) SEPARATOR ', ') AS coauthors FROM authors a
    LEFT JOIN authorpublication ap ON a.id = ap.IdAuthors
    LEFT JOIN (
        SELECT ap2.IdAuthors, COUNT(ap2.IdPublications) AS publication_count
        FROM authorpublication ap2
        GROUP BY ap2.IdAuthors
    ) c ON ap.IdPublications = c.IdAuthors
    LEFT JOIN authorpublication ap2 ON ap.IdPublications = ap2.IdPublications AND ap2.IdAuthors != a.id
    LEFT JOIN authors b ON ap2.IdAuthors = b.id
    GROUP BY a.id, a.name");
}

$authorsData = [];
while ($row = mysqli_fetch_assoc($authors)) {
    $authorsData[] = [
        'id' => $row['id'],
        'label' => $row['name'] . ', ' . "\n" . $row['total_publications'] . ' пуб.',
        'group' => $row['coauthors']
    ];
}

$edges = mysqli_query($connection, "SELECT DISTINCT ap1.IdAuthors AS from_author, ap2.IdAuthors AS to_author FROM authorpublication ap1
JOIN authorpublication ap2 ON ap1.IdPublications = ap2.IdPublications AND ap1.IdAuthors != ap2.IdAuthors");

$edgesData = [];
while ($row = mysqli_fetch_assoc($edges)) {
    $edgesData[] = [
        'from' => $row['from_author'],
        'to' => $row['to_author']
    ];
}

mysqli_close($connection);

header('Content-Type: application/json');
echo json_encode(['nodes' => $authorsData, 'edges' => $edgesData]);
?>