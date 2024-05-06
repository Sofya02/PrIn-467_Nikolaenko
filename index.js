const connectToDatabase = require('./db.js');
const connection = connectToDatabase();


// Данные для графа
let nodes = new vis.DataSet();
let edges = new vis.DataSet();

// Пример данных
let data = {
  authors: [
    { id: 1, name: 'Иванов И.И' },
    { id: 2, name: 'Сидоров А.Д.' },
    { id: 3, name: 'Ушаков С.И.' }
  ],
  publications: [
    { id: 1, title: 'Машинное обучение', authorId: 1 },
    { id: 2, title: 'Нейронные сети', authorId: 1 },
    { id: 3, title: 'Алгоритмы оптимизации', authorId: 2 },
    { id: 4, title: 'Вычислительная лингвистика', authorId: 1 },
    { id: 5, title: 'Глубокое обучение', authorId: 3 },
    { id: 6, title: 'Регуляризация', authorId: 3 }
  ]
};

// Создание узлов (авторов)
data.authors.forEach(author => {
  nodes.add({ id: author.id, label: author.name });
});

// Создание связей (ребер) между авторами и публикациями
data.publications.forEach(publication => {
  edges.add({ from: publication.authorId, to: publication.title, label: publication.title });
});

// Создание дополнительных узлов для публикаций
data.publications.forEach(publication => {
  nodes.add({ id: publication.title, label: publication.title });
});

// Настройки для графа
let options = {
  nodes: {
    shape: 'Rectangle'
  },
  edges: {
    color: { inherit: 'from' },
    font: { size: 14 }
  }
};

// Создание графа
let place = document.getElementById('author_network');
let info_about_network_structure = {
  nodes: nodes,
  edges: edges
};
let network = new vis.Network(place, info_about_network_structure, options);