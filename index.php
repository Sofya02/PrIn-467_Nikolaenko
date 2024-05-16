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
        edges: edges
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

      const depthSelect = $('#depth-search-dropdown');
      for (let depth = 0; depth <= 10; depth++) {
        depthSelect.append(`<option value="${depth}">${depth}</option>`);
      }

      // Обработчик для выпадающего списка глубины поиска
      depthSelect.on('change', function() {
        performDepthSearch(depthSelect);
      });

      // Функция для выполнения поиска в глубину на клиентской стороне
      function performDepthSearch(depth) {
        const startNodeId = nodes.getIds()[0];
        const visitedNodes = new Set();
        const visitedAuthors = []; // Массив для хранения авторов посещенных узлов
        depthFirstSearch(startNodeId, depth, visitedNodes, visitedAuthors);

        // Выводим список посещенных узлов с названием автора
        const visitedAuthorsElement = document.getElementById('visited-authors');
        visitedAuthorsElement.innerHTML = '';
        visitedAuthors.forEach(author => {
          const authorElement = document.createElement('p');
          authorElement.textContent = `Посещен узел: ${author.id}, Автор: ${author.name}`;
          visitedAuthorsElement.appendChild(authorElement);
        });
      }

      // Функция для рекурсивного поиска в глубину
      function depthFirstSearch(nodeId, currentDepth, visitedNodes, visitedAuthors) {
        if (currentDepth === 0 || visitedNodes.has(nodeId)) {
          return;
        }
        visitedNodes.add(nodeId);
        const node = nodes.get(nodeId);
        const author = { id: node.id, name: node.label }; // Предполагаем, что узел содержит имя автора в свойстве 'label'
        visitedAuthors.push(author); // Добавляем автора в массив посещенных авторов
        const neighbors = network.getConnectedNodes(nodeId);
        for (const neighborId of neighbors) {
          depthFirstSearch(neighborId, currentDepth - 1, visitedNodes, visitedAuthors);
        }
      }

      // Кнопка очистки поиска в глубину
      const clearDepthSearchButton = document.getElementById('clear-depth-search');
      clearDepthSearchButton.addEventListener('click', function() {
        // Очищаем список посещенных узлов
        const visitedAuthorsElement = document.getElementById('visited-authors');
        visitedAuthorsElement.innerHTML = '';
      });

       // Обработчик для выпадающего списка типа публикации
       $('#type-search-dropdown').on('change', function() {
        const selectedTypeId = $(this).val();
        if (selectedTypeId) {
          // Фильтруем узлы и ребра на основе выбранного типа публикации
          const filteredNodes = new vis.DataSet();
          const filteredEdges = new vis.DataSet();

          nodes.forEach(node => {
            if (node.label.includes(selectedTypeId)) {
              filteredNodes.add(node);
            }
          });

          edges.forEach(edge => {
            if (edge.label.includes(selectedTypeId)) {
              filteredEdges.add(edge);
            }
          });

          // Обновляем данные графа
          const filteredData = {
            nodes: filteredNodes,
            edges: filteredEdges
          };
          network.setData(filteredData);
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
  <div id="au">
    <h1>Тип публикации:</h1>
    <select id="type-search-dropdown">
      <script>
        $(document).ready(function() {
            // Запрос к базе данных для получения списка типов публикаций
            $.getJSON('/types_of_publications.php', function(data) {
                // Заполнение выпадающего списка типами публикаций
                var $typeDropdown = $('#type-search-dropdown');
                $typeDropdown.append('<option value="">---</option>');
                data.forEach(function(type) {
                    $typeDropdown.append('<option value="' + type.id + '">' + type.name + '</option>');
                });
            });
        });
       
      </script>
    </select>
  </div>
  <div id="au">
    <h1>Глубина поиска:</h1>
    <select id="depth-search-dropdown"></select>
    <button id="clear-depth-search">Очистить поиск в глубину</button> 
  </div>
  <div id="visited-authors"></div>
  
  <div id="text-l">
    <h1 id="text">Список публикаций автора:</h1>
    <button id="clear-author-selection">Очистить выбор</button> 
    <p id="author-info"></p>
    <ol id="publications-list"></ol>
  </div>
</body>
</html>