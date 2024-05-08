// // // // const connectToDatabase = require('./db.js');
// // // // const connection = connectToDatabase();*/


// Данные для графа
let nodes = new vis.DataSet();
let edges = new vis.DataSet();

// Пример данных
let data = {
  authors: [
    { id: 1, name: 'Иванов И.И', city: 'Москва', university: 'МГУ' },
    { id: 2, name: 'Сидоров А.Д.', city: 'Волгоград', university: 'ВолгГТУ' },
    { id: 3, name: 'Ушаков С.И.', city: 'Волгоград', university: 'ВолГУ' },
    { id: 4, name: 'Петров А.В.', city: 'Санкт-Петербург', university: 'СПбГУ' },
    { id: 5, name: 'Козлова Е.П.', city: 'Москва', university: 'МГИМО' },
  ],
  publications: [
    { id: 1, title: 'Машинное обучение', authorId: 1 },
    { id: 2, title: 'Нейронные сети', authorId: 1 },
    { id: 3, title: 'Алгоритмы оптимизации', authorId: 2 },
    { id: 4, title: 'Вычислительная лингвистика', authorId: 1 },
    { id: 5, title: 'Глубокое обучение', authorId: 3 },
    { id: 6, title: 'Регуляризация', authorId: 3 },
    { id: 7, title: 'Обработка естественного языка', authorId: 1 },
    { id: 8, title: 'Глубокое обучение для компьютерного зрения', authorId: 2 },
    { id: 9, title: 'Анализ временных рядов с использованием нейронных сетей', authorId: 2 },
    { id: 10, title: 'Кластеризация данных с помощью алгоритмов машинного обучения', authorId: 1 },
    { id: 11, title: 'Обработка изображений с использованием глубокого обучения', authorId: 1 },
    { id: 12, title: 'Рекомендательные системы на основе нейронных сетей', authorId: 3 },
    { id: 13, title: 'Прогнозирование временных рядов с использованием алгоритмов машинного обучения', authorId: 1 },
    { id: 14, title: 'Классификация текстов с использованием глубокого обучения', authorId: 2 },
    { id: 15, title: 'Анализ данных с использованием нейронных сетей', authorId: 2 },
    { id: 16, title: 'Обработка естественного языка с использованием глубокого обучения', authorId: 1 },
    { id: 17, title: 'Сверточные нейронные сети для обработки изображений', authorId: 2 },
    { id: 18, title: 'Рекомендательные системы на основе алгоритмов машинного обучения', authorId: 1 },
    { id: 19, title: 'Облачные технологии', authorId: [4, 1] },
    { id: 20, title: 'Блокчейн', authorId: [2, 5] },
    { id: 21, title: 'Интернет вещей', authorId: [3, 1] },
    { id: 22, title: 'Большие данные и аналитика', authorId: [4, 5] },
    { id: 23, title: 'Кибербезопасность', authorId: [4, 3] }
  ]
};

// Создание узлов (авторов)
data.publications = data.publications.map(publication => {
  if (Array.isArray(publication.authorId)) {
    return publication;
  } else {
    return {
      ...publication,
      authorId: [publication.authorId]
    };
  }
});

// Очистить существующие ребра
edges.clear();

// Функция расчета цвета края в зависимости от количества публикаций
// function getEdgeColor(authorId) {
//   const authorPublicationsCount = data.publications.reduce((count, publication) => {
//     if (publication.authorId.includes(authorId)) {
//       count++;
//     }
//     return count;
//   }, 0);

//   if (authorPublicationsCount < 3) {
//     return '#ff0000'; // Красный
//   } else if (authorPublicationsCount >= 3 && authorPublicationsCount <= 6) {
//     return '#FFFF00'; // Желтый
//   } else {
//     return '#00ff00'; // Зеленый
//   }
// }

// Функция расчета ширины ребра на основе количества публикаций
function getEdgeWidth(authorId) {
  const authorPublicationsCount = data.publications.reduce((count, publication) => {
    if (publication.authorId.includes(authorId)) {
      count++;
    }
    return count;
  }, 0);

  return authorPublicationsCount * 2; 
}

// Очистить существующие ребра
edges.clear();

// Создание связей (ребер) между авторами и публикациями. Ребра имеют различные цвета, и надписи города и университета
data.publications.forEach(publication => {
  publication.authorId.forEach(authorId => {
    const author = data.authors.find(a => a.id === authorId);
    // const edgeColor = getEdgeColor(authorId);
    const edgeWidth = getEdgeWidth(authorId);
    edges.add({ 
      from: authorId, 
      to: publication.title, 
      // color: edgeColor, 
      width: edgeWidth, // Устанавливаем ширину ребра в зависимости от количества публикаций
      label: author.city + ',\n' + ' ' + author.university});
  });
});

// Функция для расчета количества публикаций для автора
function getAuthorPublicationsCount(authorId, publications) {
  return publications.reduce((count, publication) => {
    if (publication.authorId.includes(authorId)) {
      count++;
    }
    return count;
  }, 0);
}

// Создание узлов для авторов
data.authors.forEach(author => {
  // Рассчитываем количество публикаций для автора
  const authorPublicationsCount = getAuthorPublicationsCount(author.id, data.publications);

  nodes.add({ 
    id: author.id, 
    label: `${author.name}` + ',\n' + ' ' + `${authorPublicationsCount}` + 'публ.', // имя автора и количество публикаций
    shape: 'dot', 
    // color: '#ff17b9'
   });
});

// Создание дополнительных узлов для публикаций
data.publications.forEach(publication => {
  nodes.add({ 
    id: publication.title, 
    label: publication.title, 
    shape: 'box' });
});

//Настройки для графа
let options = {
  nodes: {
    shape: 'ellipse',
    font: {
      size: 14,
      color: '#000'
    },
  },
  edges: {
    // Убираем зависимость цветов между узлом и ребром
    // color: { inherit: false },// Отключаем наследование цвета от узла
    font: { size: 14 }
  }
};


// Создание графа
let place = document.getElementById('author_network');
let info_about_network_structure  = {
  nodes: nodes,
  edges: edges
};
let network = new vis.Network(place, info_about_network_structure, options);

