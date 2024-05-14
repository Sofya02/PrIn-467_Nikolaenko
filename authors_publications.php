<?php
include 'db.php';

$authorId = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;

if ($authorId) {
    $authorInfo = mysqli_query($connection, "SELECT a.name, COUNT(ap.IdPublications) AS total_publications FROM authors a
    LEFT JOIN authorpublication ap ON a.id = ap.IdAuthors
    WHERE a.id = $authorId");

    $authorData = mysqli_fetch_assoc($authorInfo);

    $publications = mysqli_query($connection, "SELECT p.id, p.title, MIN(c.name) AS city_name, MIN(u.name) AS university_name, tp.name AS type_name FROM publications p
    JOIN authorpublication ap ON p.id = ap.IdPublications 
    LEFT JOIN companypublication cp ON ap.IdPublications = cp.IdPublications 
    LEFT JOIN universities u ON cp.IdUniversities = u.id 
    LEFT JOIN citypublication cp2 ON ap.IdPublications = cp2.IdPublications 
    LEFT JOIN cities c ON cp2.IdCities = c.id 
    LEFT JOIN types_of_publications tp ON p.type_id = tp.id 
    WHERE ap.IdAuthors = $authorId 
    GROUP BY p.id, p.title, tp.name 
    ORDER BY tp.name");

    $publicationsData = [];
    while ($row = mysqli_fetch_assoc($publications)) {
        $publicationsData[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'city' => $row['city_name'],
            'university' => $row['university_name']
        ];
    }

    mysqli_close($connection);

    header('Content-Type: application/json');
    echo json_encode(['author' => $authorData, 'publications' => $publicationsData]);
}
?>