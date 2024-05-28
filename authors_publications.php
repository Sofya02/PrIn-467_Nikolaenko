<?php
include 'db.php';

$authorId = isset($_GET['author_id']) ? intval($_GET['author_id']) : null;

if ($authorId) {
    $authorInfo = mysqli_query($connection, "SELECT authors.name, COUNT(authorpublication.IdPublications) AS total_publications FROM authors
    LEFT JOIN authorpublication ON authors.id = authorpublication.IdAuthors
    WHERE authors.id = $authorId");

    $authorData = mysqli_fetch_assoc($authorInfo);

    $publications = mysqli_query($connection, "SELECT publications.id, publications.title, publications.year, cities.name AS city_name, universities.name AS university_name, types_of_publications.name AS type_name 
    FROM publications 
    JOIN authorpublication ON publications.id = authorpublication.IdPublications 
    LEFT JOIN companypublication ON authorpublication.IdPublications = companypublication.IdPublications 
    LEFT JOIN universities ON companypublication.IdUniversities = universities.id 
    LEFT JOIN citypublication ON authorpublication.IdPublications = citypublication.IdPublications 
    LEFT JOIN cities ON citypublication.IdCities = cities.id 
    LEFT JOIN types_of_publications ON publications.type_id = types_of_publications.id 
    WHERE authorpublication.IdAuthors = $authorId 
    ORDER BY publications.title;");

    $publicationsData = [];
    while ($row = mysqli_fetch_assoc($publications)) {
        $publicationsData[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'city' => $row['city_name'],
            'university' => $row['university_name'],
            'type_name' => $row['type_name'],
            'year' => $row['year'],
        ];
        if (!isset($publicationsByYear[$row['year']])) {
            $publicationsByYear[$row['year']] = 0;
        }
        $publicationsByYear[$row['year']]++;
    }

    mysqli_close($connection);

    header('Content-Type: application/json');
    echo json_encode(['author' => $authorData, 'publications' => $publicationsData, 'publicationsByYear' => $publicationsByYear]);
}
?>