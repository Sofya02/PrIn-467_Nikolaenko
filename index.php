<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Авторская сеть</title>
  <link rel="stylesheet" href="i.css">
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
        edges: edges
      };

      const options = {
        nodes: {
          shape: "dot",
          font: {
            size: 24,
            color: "#000000",
            face: "bold"
          },
        },
        physics: {
          forceAtlas2Based: {
            gravitationalConstant: -26, 
            centralGravity: 0.005,
            springLength: 230, 
            springConstant: 0.18,
          },
          maxVelocity: 146, 
          solver: "forceAtlas2Based",
          timestep: 0.35, 
          stabilization: {
            iterations: 150, 
          },
          barnesHut: {
            avoidOverlap: 0.5 
          }
        },
        interaction: {
          dragNodes: true,
          zoomView: true,
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
              const hasJointWorks = data.author.has_joint_works;////

              const authorInfoElement = document.getElementById('author-info');
              authorInfoElement.innerHTML = `<h2> ${authorName}, ${totalPublications} пуб. </h2>`;

              // Создаем объект для группировки публикаций по типу
              const publicationsByType = {};
              data.publications.forEach(publication => {
                if (!publicationsByType[publication.type_name]) {
                  publicationsByType[publication.type_name] = [];
                }
                publicationsByType[publication.type_name].push({
                  title: publication.title,
                  city: publication.city,
                  university: publication.university
                });
              });

              // Выводим список публикаций, сгруппированных по типу
              for (const typeName in publicationsByType) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<h3>${typeName}</h3>`;
                publicationsByType[typeName].forEach((publication, index) => {
                  const publicationItem = document.createElement('p');
                  publicationItem.innerHTML = `<strong>${index + 1}. ${publication.title}</strong> (Город: ${publication.city}, Университет: ${publication.university})`;
                  listItem.appendChild(publicationItem);
                });
                publicationsList.appendChild(listItem);
              }
            });
        }
      });

      //обработчик для кнопки очистки выбора автора
      $('#clear-author-selection').on('click', function() {
        $('#author-info').empty();
        $('#publications-list').empty();
      });

      //обработчик для кнопки очистки выбора автора
      $('#clear-visited-selection').on('click', function() {
        $('#depth-authors').empty();
      });

      const depthSelect = $('#depth-search-dropdown');
      for (let depth = 0; depth <= 10; depth++) {
        depthSelect.append(`<option value="${depth}">${depth}</option>`);
      }

      depthSelect.on('change', function() {
        performDepthSearch(depthSelect.val());
      });

      function performDepthSearch(depth) {
        const selectedAuthorId = $('#author-search-dropdown').val();
        if (selectedAuthorId) {
          const startNodeId = selectedAuthorId;
          const visitedNodes = new Set();
          const visitedAuthors = [];
          depthFirstSearch(startNodeId, depth, visitedNodes, visitedAuthors);

          const visitedAuthorsElement = document.getElementById('depth-authors');
          visitedAuthorsElement.innerHTML = '';
          visitedAuthors.forEach(author => {
            const authorElement = document.createElement('p');
            authorElement.textContent = `Посещен узел: ${author.id}, Автор: ${author.name}`;
            visitedAuthorsElement.appendChild(authorElement);
          });
        }
      }

      function depthFirstSearch(nodeId, currentDepth, visitedNodes, visitedAuthors) {
        if (currentDepth === 0 || visitedNodes.has(nodeId)) {
          return;
        }
        visitedNodes.add(nodeId);
        const node = nodes.get(nodeId);
        const author = { id: node.id, name: node.label };
        visitedAuthors.push(author);
        const neighbors = network.getConnectedEdges(nodeId);
        for (const edge of neighbors) {
          const neighborId = edge.from === nodeId ? edge.to : edge.from;
          depthFirstSearch(neighborId, currentDepth - 1, visitedNodes, visitedAuthors);
        }
      }

  

    });
  
  </script>
  <div id="filter-menu">
    <div id="au">
      <div id="controls">
        <input type="checkbox" id="showJointWorks" name="showJointWorks" value="true">
        <label for="showJointWorks">Авторы с совместными публикациями</label>
      </div>
      <div id="controls">
        <input type="checkbox" id="showNoJointWorks" name="showNoJointWorks" value="true">
        <label for="showJointWorks">Авторы без совместных публикаций</label>
      </div>
    </div>
    
    <div id="au">
      <h3>Автор:</h3>
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
      <button id="clear-author-search">Очистить</button> 
    </div>
    <div id="au">
      <h3>Количество публикаций:</h3>
      <select id="value-search-dropdown">
        <option>---</option>
        <option>меньше 10</option>
        <option>11-50</option>
        <option>51-100</option>
        <option>больше 100</option>
      </select>
      <button id="clear-value-search">Очистить</button> 
    </div>
    <div id="au">
      <h3>Глубина поиска:</h3>
      <select id="depth-search-dropdown"></select>
    </div>
  </div> 
  <div id="visited-authors">
    <h1 id="text">Поиск в глубину:</h1>
    <ol id="depth-authors"></ol>
    <button id="clear-visited-selection">Очистить</button> 
  </div>
  <div id="text-l">
    <h1 id="text">Список публикаций автора:</h1>
    <button id="clear-author-selection">Очистить</button> 
    <p id="author-info"></p>
    <ol id="publications-list"></ol>
  </div>
</body>
</html>