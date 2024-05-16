<?php
include 'db.php';

$authorId = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;


if ($authorId) {
    $authors = mysqli_query($connection, "SELECT a.id, a.name, COUNT(ap.IdPublications) AS total_publications FROM authors a 
    LEFT JOIN authorpublication ap ON a.id = ap.IdAuthors WHERE a.id = $authorId GROUP BY a.id, a.name");
} else {
    $authors = mysqli_query($connection, "SELECT a.id, a.name, COUNT(ap.IdPublications) AS total_publications, 
    CASE WHEN EXISTS (SELECT 1 FROM authorpublication ap1 JOIN authorpublication ap2 ON ap1.IdPublications = ap2.IdPublications AND ap1.IdAuthors != ap2.IdAuthors WHERE ap1.IdAuthors = a.id) THEN 1 ELSE 0 END AS has_joint_works FROM authors a LEFT JOIN authorpublication ap ON a.id = ap.IdAuthors GROUP BY a.id, a.name");
}

$authorsData = [];
$color = '';
while ($row = mysqli_fetch_assoc($authors)) {
    $authorsData[] = [
        'id' => $row['id'],
        'label' => $row['name'] . ', ' . "\n" . $row['total_publications'] . ' пуб.',
        'size' => max($row['total_publications'] * 1.5, 32),
        'color' => setColor($row['total_publications']),
    ];
}

function setColor($totalPublications) {
    if ($totalPublications < 10) {
        return 'red';
    } elseif ($totalPublications >= 10 && $totalPublications <= 50) {
        return 'yellow';
    } elseif ($totalPublications >= 51 && $totalPublications <= 100) {
        return 'orange';
    } elseif ($totalPublications > 100) {
        return 'green';
    }
}

$edges = mysqli_query($connection, "SELECT ap1.IdAuthors AS from_author, ap2.IdAuthors AS to_author, p.title AS publication_title, tp.name AS publication_type FROM authorpublication ap1 
    JOIN authorpublication ap2 ON ap1.IdPublications = ap2.IdPublications AND ap1.IdAuthors != ap2.IdAuthors 
    JOIN publications p ON ap1.IdPublications = p.id 
    JOIN types_of_publications tp ON p.type_id = tp.id 
    WHERE ap1.IdAuthors < ap2.IdAuthors");

$edgesData = [];
while ($row = mysqli_fetch_assoc($edges)) {
    
    $edgesData[] = [
        'from' => $row['from_author'],
        'to' => $row['to_author'],
        'label' => $row['publication_type'],
    ];
}

mysqli_close($connection);

header('Content-Type: application/json');
echo json_encode(['nodes' => $authorsData, 'edges' => $edgesData]);
?>