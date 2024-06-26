function initGraph() {

    $.getJSON('/bd_graph.php', graphData => {
        try {  
                const nodes = new vis.DataSet(graphData.nodes);
                const edges = new vis.DataSet(graphData.edges);
                const dataSet = createDataSetFromServerData(graphData);
                const container = document.getElementById('author_network');
                if (!container) throw new Error("Container 'author_network' not found");
                const data = {
                    nodes: dataSet.nodes,
                    edges: dataSet.edges,
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


                    handleJointWorksCheckbox('showJointWorks', nodes, edges, network);
                    handleNoJointWorksCheckbox('showNoJointWorks', nodes, edges, network);
                    handleValueSearchDropdown(network, nodes, edges);
                    handleNodeClick(network, nodes, edges);
                    setupAuthorSearchDropdown(network);
                    clearAuthorSelection();
                    clearAuthorSearch(network);
                    clearValueSearch(network);

            } catch (error) {
                console.error("Failed to fetch graph data:", error.statusText, error.responseText);
            }
        });
}

initGraph();

/**************************************************************************************************** */

function setupAuthorSearchDropdown(network) {
    $('#author-search-dropdown').on('change', function() {
      resetSelectToInitialValue('#value-search-dropdown');
      $('#showNoJointWorks').prop('checked', false);
      $('#showJointWorks').prop('checked', false);
      const selectedAuthorId = $(this).val();
      updateGraphWithAuthorId(selectedAuthorId, network);
    });
  }

function updateGraphWithAuthorId(authorId, network) {
    if (authorId) {
        $.getJSON('/bd_graph.php?author_id=' + authorId + '&include_coauthors=true', graphData => {
            try {
                network.setData(graphData);
            } catch (error) {
                console.error("Failed to update graph with author ID", error);
            }
        });
    }
  }

const url = "/bd_graph.php";
  function getJSONData(url,network) {
    return $.getJSON(url, graphData => {
      network.setData(graphData);
    });
  }

//Функция обработки добавления узлов в множество на основе ребер
function createConnectedNodesSet(edges) {
    const connectedNodes = new Set();
    edges.forEach(edge => {
        connectedNodes.add(edge.from);
        connectedNodes.add(edge.to);
    });
    return connectedNodes;
}

// Функция управления отображением узлов, связанных с совместными работами, на основе состояния чекбокса.
function handleJointWorksCheckbox(checkboxId, nodes, edges, network) {
    $('#showJointWorks').on('change', function() {
        if ($(this).is(':checked')) {
            resetSelectToInitialValue('#value-search-dropdown');
            resetSelectToInitialValue('#author-search-dropdown');
            // Отключаем второй чекбокс
            $('#showNoJointWorks').prop('checked', false);

            // Вызов функции с передачей массива ребер
            const connectedNodes = createConnectedNodesSet(edges);

            // Создаем новый DataSet с узлами, имеющими ребер
            const filteredNodes = new vis.DataSet(
                nodes.get().filter(node => connectedNodes.has(node.id))
            );

            // Обновляем данные графа
            const data = {
                nodes: filteredNodes,
                edges: edges,
            };

            network.setData(data);
        } else {
            // Возвращаем исходные данные, если checkbox отключен
            const originalData = {
                nodes: nodes,
                edges: edges,
            };

            network.setData(originalData);
        }
    });
}

// Функция управления отображением узлов, связанных без совместных работ, на основе состояния чекбокса.
function handleNoJointWorksCheckbox(checkboxId, nodes, edges, network) {
    $('#showNoJointWorks').on('change', function() {
        if ($(this).is(':checked')) {
            resetSelectToInitialValue('#value-search-dropdown');
            resetSelectToInitialValue('#author-search-dropdown');
            // Отключаем первый чекбокс
            $('#showJointWorks').prop('checked', false);

            // Вызов функции с передачей массива ребер
            const connectedNodes = createConnectedNodesSet(edges);

            // Создаем новый DataSet с узлами, не имеющими ребер
            const filteredNodes = new vis.DataSet(
                nodes.get().filter(node => !connectedNodes.has(node.id))
            );

            // Обновляем данные графа
            const data = {
                nodes: filteredNodes,
                edges: new vis.DataSet(), // Удаляем ребра
            };

            network.setData(data);
        } else {
            // Возвращаем исходные данные, если checkbox отключен
            const originalData = {
                nodes: nodes,
                edges: edges,
            };

            network.setData(originalData);
        }

    });
}

// Функция для фильтрации узлов по количеству публикаций
function filterNodesByPublications(node, selectedValue) {
    switch (selectedValue) {
        case 'меньше 10':
            return node.publications < 10;
        case '11-50':
            return node.publications >= 11 && node.publications <= 50;
        case '51-100':
            return node.publications >= 51 && node.publications <= 100;
        case 'больше 100':
            return node.publications > 100;
        default:
            return false;
    }
  }

//   //Функция фильтрации графа по количеству публикаций автора
function handleValueSearchDropdown(network, nodes, edges) {
    $('#value-search-dropdown').on('change', function() {
        try {
            resetSelectToInitialValue('#author-search-dropdown');
            $('#showNoJointWorks').prop('checked', false);
            $('#showJointWorks').prop('checked', false);
            const selectedValue = $(this).val();
            if (selectedValue) {
                $.getJSON('/bd_graph.php?filter_type=' + selectedValue, function(response) {
                    const data = response;
                    const nodes = new vis.DataSet(data.nodes);
                    const edges = new vis.DataSet(data.edges);

                    const container = document.getElementById('author_network');
                    const graphData = {
                        nodes: nodes,
                        edges: edges,
                    };

                    network.setData(graphData);
                });
            } 
        } catch (error) {
            console.error("Failed to handle value search dropdown", error);
        }
    });
}

function groupPublicationsByType(data) {
    const publicationsByType = {};
    data.publications.forEach(publication => {
        if (!publicationsByType[publication.type_name]) {
            publicationsByType[publication.type_name] = [];
        }
        const year = extractYear(publication.year);
        if (year !== null) {
            publicationsByType[publication.type_name].push({
                title: publication.title,
                city: publication.city,
                university: publication.university,
                year: year,
            });
        }
    });
    return publicationsByType;
}

function displayPublicationsByType(publicationsByType) {
    const publicationsList = document.getElementById('publications-list');
    if (!publicationsList) {
        console.error("Element 'publications-list' not found");
        return;
    }
    publicationsList.innerHTML = '';
    for (const typeName in publicationsByType) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<h3>${typeName}</h3>`;
        publicationsByType[typeName].forEach((publication, index) => {
            const publicationItem = document.createElement('p');
            publicationItem.innerHTML = `<strong>${index + 1}. ${publication.title}</strong> (Год: ${publication.year}, Город: ${publication.city}, Университет: ${publication.university})`;
            listItem.appendChild(publicationItem);
        });
        publicationsList.appendChild(listItem);
    }
}

function collectCoPublications(data, nodeId, nodes, edges) {
    const coPublications = {};
    edges.forEach(edge => {
        if (edge.from === nodeId || edge.to === nodeId) {
            const otherAuthorId = edge.from === nodeId ? edge.to : edge.from;
            const otherAuthorNode = nodes.get(otherAuthorId);
            if (!coPublications[otherAuthorId]) {
                coPublications[otherAuthorId] = {
                    count: 0,
                    publications: []
                };
            }
            coPublications[otherAuthorId].count++;
            coPublications[otherAuthorId].publications.push({
                title: edge.label,
                authors: [data.author.name, otherAuthorNode.label]
            });
        }
    });
    return coPublications;
}

function displayCoPublications(coPublications, nodes) {
    const coPublicationsList = document.getElementById('co-publications-list');
    if (!coPublicationsList) {
        console.error("Element 'co-publications-list' not found");
        return;
    }
    coPublicationsList.innerHTML = '';
    for (const authorId in coPublications) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${nodes.get(authorId).label}</strong>: ${coPublications[authorId].count} совместных публикаций`;
        const toggleButton = document.createElement('button');
        toggleButton.innerHTML = 'Показать <i class="open-down"></i>';
        toggleButton.className = 'toggle-publications';
        listItem.appendChild(toggleButton);
        const publicationsContent = document.createElement('div');
        publicationsContent.className = 'publications-content';
        publicationsContent.style.display = 'none';
        coPublications[authorId].publications.forEach((publication, index) => {
            const publicationItem = document.createElement('p');
            publicationItem.innerHTML = `${index + 1}. ${publication.title}`;
            publicationsContent.appendChild(publicationItem);
        });
        listItem.appendChild(publicationsContent);
        coPublicationsList.appendChild(listItem);
    }
    coPublicationsList.addEventListener('click', togglePublicationVisibility);
}

function togglePublicationVisibility(event) {
    if (event.target.classList.contains('toggle-publications')) {
        event.preventDefault();
        const publicationsContent = event.target.parentElement.querySelector('.publications-content');
        publicationsContent.style.display = publicationsContent.style.display === 'block' ? 'none' : 'block';
        event.target.innerHTML = event.target.innerHTML.includes('Показать') ? 'Скрыть <i class="open-up"></i>' : 'Показать <i class="open-down"></i>';
    }
}

function removePreviousChart() {
    const chartElement = document.getElementById('chart');
    if (chartElement) {
        chartElement.remove();
    }
}

function createChart(data) {

    try {
        // Предполагаем, что publicationsByYear - это объект вида { год: количество_публикаций }
        const years = Object.keys(data.publicationsByYear).map(year => parseInt(year, 10));
        const counts = years.map(year => data.publicationsByYear[year.toString()]);

        if (!data.publicationsByYear || typeof data.publicationsByYear !== 'object') {
            throw new Error("Invalid data format for chart creation");
        }

        // Фильтруем NaN из данных
        const validCounts = counts.filter(count => !isNaN(count));

        // Сортировка лет в порядке возрастания
        years.sort((a, b) => a - b);

        // Определяем последний год
        const lastYear = years[years.length - 1];

        // Удаляем годы, для которых нет данных (если такие есть)
        const yearsWithData = years.filter((year, index) => !isNaN(validCounts[index]));/**/ 

        removePreviousChart();

        const newChartElement = document.createElement('canvas');
        newChartElement.id = 'chart';
        document.querySelector('.chart-container').appendChild(newChartElement);
        window.myChart = new Chart(newChartElement, {
            type: 'bar',
            data: {
                labels: yearsWithData.map(year => year.toString()),
                datasets: [{
                    label: 'Количество публикаций',
                    data: validCounts.filter((count, index) => !isNaN(count) && !isNaN(years[index])),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        // Указываем, что метки должны быть только из данных
                        ticks: {
                            source: 'data'
                        },
                        // Ограничиваем ширину графика последним годом
                        max: lastYear
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating chart", error);
    }
}
// //Функция для работы с инф при нажатии на узел графа
function handleNodeClick(network, nodes, edges) {
    network.on('click', function(event) {
        try {
            const nodeId = event.nodes[0];
            if (nodeId) {
                fetch('/authors_publications.php?author_id=' + nodeId)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        const authorName = data.author.name;
                        const totalPublications = data.author.total_publications;
                        const authorInfoElement = document.getElementById('author-info');

                        authorInfoElement.innerHTML = `<h2>${authorName}, ${totalPublications} публ.</h2>`;

                        const publicationsByType = groupPublicationsByType(data);
                        displayPublicationsByType(publicationsByType);

                        const coPublications = collectCoPublications(data, nodeId, nodes, edges);
                        displayCoPublications(coPublications, nodes);

                        removePreviousChart();
                        createChart(data);
                    })
                    .catch(error => {
                        // console.error("Failed to fetch author publications", error);
                        $('#author-info').empty();
                        $('#co-publications-list').empty();
                        $('#publications-list').empty();
                        const chartElement = document.getElementById('chart');
                        if (chartElement) {
                            chartElement.remove(); // Удаление элемента canvas
                        }
                        // Обработка ошибки, если не удалось получить данные
                        const authorInfoElement = document.getElementById('author-info');
                        authorInfoElement.innerHTML = `<h1 style="color: red;">Ошибка при загрузке информации об авторе!<p>Или у автора нет публикаций!</p></h1>`;
                    });
            }
        } catch (error) {
            console.error("Error handling node click", error);
        }
    });
}

function extractYear(yearString) {
    
    if (yearString === null || yearString === '') {
        return null;
    }
    const match = yearString.match(/\b\d{4}\b/);
    return match ? parseInt(match[0], 10) : null;
    
}

//Функция для кнопки очистки списка публикаций автора
function clearAuthorSelection() {
    $('#clear-author-selection').on('click', function() {
        try {
            $('#author-info').empty();
            $('#co-publications-list').empty();
            $('#publications-list').empty();
            const chartElement = document.getElementById('chart');
            if (chartElement) {
                chartElement.remove(); // Удаление элемента canvas
            }
        } catch (error) {
            console.error("Failed to clear author selection", error);
        }
    });
  }

//Функция для кнопки очистки графа после выбора автора
function clearAuthorSearch(network) {
    $('#clear-author-search').on('click', function() {
        try {
            resetSelectToInitialValue('#author-search-dropdown');
            getJSONData(url,network);
        } catch (error) {
            console.error("Failed to clear graph after author selection", error);
        }
    });
  }


// Функция для установки выбранного значения в селекте на "---"
function resetSelectToInitialValue(selectId) {
    const selectElement = $(selectId);
    const initialOptionValue = '---';
    selectElement.val(initialOptionValue);
  }

// Обработчик для кнопки очистки графа после выбора кол-ва публикаций автора
function clearValueSearch(network) {
    $('#clear-value-search').on('click', function() {
        try {
            resetSelectToInitialValue('#value-search-dropdown');
            getJSONData(url,network);
        } catch (error) {
            console.error("Failed to clear graph after value selection", error);
        }
    });
}

function loadAndSortAuthors() {
    $.getJSON('authors.php', function(data) {
      const authorSelect = $('#author-search-dropdown');
      authorSelect.append('<option value="">   </option>');
  
      // Функция для извлечения фамилии из строки
      function extractSurname(name) {
        const parts = name.split(' ');
        return parts[parts.length - 1];
      }
  
      // Сортировка данных об авторах по фамилии
      data.sort(function(a, b) {
        return extractSurname(a.name).localeCompare(extractSurname(b.name));
      });
  
      // Добавление отсортированных данных в select
      data.forEach(author => {
        authorSelect.append(`<option value="${author.id}">${author.name}</option>`);
      });
    });
  }
 
  loadAndSortAuthors();


  function createDataSetFromServerData(serverData) {
    try {
        const nodes = new vis.DataSet(serverData.nodes);
        const edges = new vis.DataSet(serverData.edges);
        return { nodes, edges };
    } catch (error) {
        console.error("Error creating DataSet from server data", error);
        return { nodes: new vis.DataSet(), edges: new vis.DataSet() };
    }
}
