<?php
include 'db.php';

$authorId = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;
$typeId = isset($_GET['type_id']) ? intval($_GET['type_id']) : null;
$filterType = isset($_GET['filter_type']) ? $_GET['filter_type'] : null;
$includeCoauthors = isset($_GET['include_coauthors']) && $_GET['include_coauthors'] === 'true';

if ($authorId) {
    $authors = mysqli_query($connection, "SELECT authors.id, authors.name, COUNT(authorpublication.IdPublications) AS total_publications
    FROM authors  
    LEFT JOIN authorpublication ON authors.id = authorpublication.IdAuthors
    WHERE authors.id = $authorId
    GROUP BY authors.id, authors.name");
} else {
    $authors = mysqli_query($connection, "SELECT authors.id, authors.name, COUNT(authorpublication.IdPublications) AS total_publications
    FROM authors 
    LEFT JOIN authorpublication ON authors.id = authorpublication.IdAuthors
    GROUP BY authors.id, authors.name
    HAVING 
    CASE 
        WHEN '$filterType' = 'меньше 10' THEN total_publications < 10
        WHEN '$filterType' = '11-50' THEN total_publications BETWEEN 11 AND 50
        WHEN '$filterType' = '51-100' THEN total_publications BETWEEN 51 AND 100
        WHEN '$filterType' = 'больше 100' THEN total_publications > 100
        ELSE TRUE
    END");
}

$authorsData = [];
while ($row = mysqli_fetch_assoc($authors)) {
    $authorsData[] = [
        'id' => $row['id'],
        'label' => $row['name'] . ', ' . "\n" . $row['total_publications'] . ' публ.',
        'size' => max($row['total_publications'] * 0.75, 32),
        'color' => setColor($row['total_publications']),
        'publications' => $row['total_publications'],
    ];
}

if ($includeCoauthors) {
    $coauthors = mysqli_query($connection, "SELECT DISTINCT a.id, a.name, COUNT(ap.IdPublications) AS total_publications
    FROM authors a
    JOIN authorpublication ap ON a.id = ap.IdAuthors
    JOIN authorpublication ap2 ON ap.IdPublications = ap2.IdPublications AND ap2.IdAuthors != ap.IdAuthors
    WHERE ap2.IdAuthors = $authorId
    GROUP BY a.id, a.name");

    while ($row = mysqli_fetch_assoc($coauthors)) {
        $authorsData[] = [
            'id' => $row['id'],
            'label' => $row['name'] . ', ' . "\n" . $row['total_publications'] . ' публ.',
            'size' => max($row['total_publications'] * 0.75, 32),
            'color' => '#E6E6FA',
            'publications' => $row['total_publications'],
        ];
    }
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

$edges = mysqli_query($connection, "SELECT authorpublication1.IdAuthors AS from_author, authorpublication2.IdAuthors AS to_author, publications.title AS publication_title 
FROM authorpublication authorpublication1 
JOIN authorpublication authorpublication2 ON authorpublication1.IdPublications = authorpublication2.IdPublications AND authorpublication1.IdAuthors != authorpublication2.IdAuthors 
JOIN publications ON authorpublication1.IdPublications = publications.id 
WHERE authorpublication1.IdAuthors < authorpublication2.IdAuthors");

$edgesData = [];
while ($row = mysqli_fetch_assoc($edges)) {
    $edgesData[] = [
        'from' => $row['from_author'],
        'to' => $row['to_author'],
        'label' => $row['publication_title'],
    ];
}

mysqli_close($connection);

header('Content-Type: application/json');
echo json_encode(['nodes' => $authorsData, 'edges' => $edgesData]);
?>