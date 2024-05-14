<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Авторская сеть</title>
  <link rel="stylesheet" href="index.css">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css" rel="stylesheet" type="text/css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
  <?php include 'db.php'; ?>
  <div id="author_network"></div>
  <script>
    $.getJSON('/bd_graph.php', graphData => {
      const nodes = new vis.DataSet(graphData.nodes);
      const edges = new vis.DataSet(graphData.edges);

      const container = document.getElementById('author_network');
      const data = {
        nodes: nodes,
        edges: []
      };
      const options = {
      nodes: {
          shape: "dot",
          font: {
              size: 24,
              color: "#000000",
              face: "bold"
                }
            },
      };

      const network = new vis.Network(container, data, options);
      $('#author-search-dropdown').on('change', function() {
        const selectedAuthorId = $(this).val();
        if (selectedAuthorId) {
          $.getJSON('/bd_graph.php?author_id=' + selectedAuthorId, graphData => {
            network.setData(graphData);
          });
        }
      });

      // network.on('click', function(event) {
      //   const nodeId = event.nodes[0];
      //   if (nodeId) {
      //     fetch('/authors_publications.php?author_id=' + nodeId)
      //       .then(response => response.json())
      //       .then(publications => {
      //         const publicationsList = document.getElementById('publications-list');
      //         publicationsList.innerHTML = '';
      //         publications.forEach(publication => {
      //           const listItem = document.createElement('li');
      //           listItem.textContent = publication.title;
      //           publicationsList.appendChild(listItem);
      //         });
      //       });
      //   }
      // });

      network.on('click', function(event) {
        const nodeId = event.nodes[0];
        if (nodeId) {
          fetch('/authors_publications.php?author_id=' + nodeId)
            .then(response => response.json())
            .then(data => {
              const publicationsList = document.getElementById('publications-list');
              publicationsList.innerHTML = '';
              const authorName = data.author.name;
              const totalPublications = data.author.total_publications;

              const authorInfoElement = document.getElementById('author-info');
              authorInfoElement.innerHTML = `<h2> ${authorName}, ${totalPublications} пуб. <\h2>`;
              
              data.publications.forEach(publication => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<h3>${publication.title}<\h3><p>(Город: ${publication.city}, Университет: ${publication.university})<\p>`;
                publicationsList.appendChild(listItem);
              });
            });
        }
      });

    });
  </script>
  <div id="au">
    <h1>Автор:</h1>
    <select id="author-search-dropdown" name="authors">
      <option>---</option>
      <?php
        $result = mysqli_query($connection, "SELECT id, name FROM authors");

        while ($row = mysqli_fetch_assoc($result)) {
            echo '<option value="' . $row['id'] . '">' . $row['name'] . '</option>';
        }

        mysqli_close($connection);
      ?>
    </select>
  </div>
  <div id="text-l">
    <h1 id="text">Список публикаций автора:</h1>
    <p id="author-info"></p>
    <ol id="publications-list"></ol>
  </div>
</body>
</html>