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
    { id: 1, title: 'Машинное обучение', authorId: 1, type: 'статья' },
    { id: 2, title: 'Нейронные сети', authorId: 1, type: 'статья' },
    { id: 3, title: 'Алгоритмы оптимизации', authorId: [2, 5], type: 'сборник' },
    { id: 4, title: 'Вычислительная лингвистика', authorId: 1, type: 'статья' },
    { id: 5, title: 'Глубокое обучение', authorId: 3, type: 'книга' },
    { id: 6, title: 'Регуляризация', authorId: 3, type: 'научная работа' },
    { id: 7, title: 'Обработка естественного языка', authorId: 1, type: 'статья' },
    { id: 8, title: 'Глубокое обучение для компьютерного зрения', authorId: 2, type: 'статья' },
    { id: 9, title: 'Анализ временных рядов с использованием нейронных сетей', authorId: 2, type: 'статья' },
    { id: 10, title: 'Кластеризация данных с помощью алгоритмов машинного обучения', authorId: 1, type: 'статья' },
    { id: 11, title: 'Обработка изображений с использованием глубокого обучения', authorId: 1, type: 'статья' },
    { id: 12, title: 'Рекомендательные системы на основе нейронных сетей', authorId: 3, type: 'научная работа' },
    { id: 13, title: 'Прогнозирование временных рядов с использованием алгоритмов машинного обучения', authorId: 1, type: 'статья' },
    { id: 14, title: 'Классификация текстов с использованием глубокого обучения', authorId: [2, 5], type: 'сборник' },
    { id: 15, title: 'Анализ данных с использованием нейронных сетей', authorId: [2, 5], type: 'научная работа' },
    { id: 16, title: 'Обработка естественного языка с использованием глубокого обучения', authorId: 1, type: 'статья' },
    { id: 17, title: 'Сверточные нейронные сети для обработки изображений', authorId: 2, type: 'статья' },
    { id: 18, title: 'Рекомендательные системы на основе алгоритмов машинного обучения', authorId: 1, type: 'статья' },
    { id: 19, title: 'Облачные технологии', authorId: [4, 1], type: 'книга' },
    { id: 20, title: 'Блокчейн', authorId: [2, 5], type: 'сборник' },
    { id: 21, title: 'Интернет вещей', authorId: [3, 1], type: 'научная работа' },
    { id: 22, title: 'Большие данные и аналитика', authorId: [4, 5], type: 'книга' },
    { id: 23, title: 'Кибербезопасность', authorId: [4, 3], type: 'научная работа' }
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

// Функция для определения цвета на основе количества публикаций
function getColorByPublicationsCount(count) {
  if (count <= 3) {
    return { background: '#ff0000', border: '#808080', color: '#ff0000' }; // Красный
  } else if (count <= 6) {
    return { background: '#FFFF00', border: '#808080', color: '#FFFF00' }; // Желтый
  } else if (count <= 10) {
    return { background: '#FFA500', border: '#808080', color: '#FFA500' }; // Оранжевый
  } else {
    return { background: '#008000', border: '#808080', color: '#008000' }; // Зеленый
  }
}

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
    const edgeWidth = getEdgeWidth(authorId);
    const edgeColor = getColorByPublicationsCount(getAuthorPublicationsCount(authorId, data.publications));
    edges.add({ 
      from: authorId, 
      to: publication.title, 
      width: edgeWidth, // Устанавливаем ширину ребра в зависимости от количества публикаций
      color: edgeColor, // Устанавливаем цвет ребра
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
  // Определяем цвет на основе количества публикаций
  const nodeColor = getColorByPublicationsCount(authorPublicationsCount);
  nodes.add({ 
    id: author.id, 
    label: `${author.name}` + ',\n' + ' ' + `${authorPublicationsCount}` + ' публ.', // имя автора и количество публикаций
    shape: 'dot', 
    color: nodeColor, // Устанавливаем цвет узла
   });
});

// Создание дополнительных узлов для публикаций
data.publications.forEach(publication => {
  nodes.add({ 
    id: publication.title, 
    label: publication.title, 
    shape: 'box',
   });
});

// Функция для создание узлов для типов публикаций
function addPublicationTypeNodes(nodes, data) {
  const publicationTypes = [...new Set(data.publications.map(p => p.type))];
  publicationTypes.forEach(type => {
    nodes.add({ 
      id: `type_${type}`, 
      label: type, 
      shape: 'box',
      size: 28,
      font: {
        size: 24, 
        face: 'bold',
        color: '#FFFFFF'
      },
      color: { background: '#C71585', border: '#808080', color: '#C71585' }
     });
  });
}

// Функция для создания связей (ребер) между типами публикаций и публикациями
function addPublicationTypeEdges(edges, data) {
  data.publications.forEach(publication => {
    edges.add({ 
      from: `type_${publication.type}`, 
      to: publication.title, 
      color: { color: '#000' }, // Черный цвет для ребер между типами публикаций и публикациями
      label: '' // Не отображаем метку для этих ребер
    });
  });
}


addPublicationTypeNodes(nodes, data);
addPublicationTypeEdges(edges, data);


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

