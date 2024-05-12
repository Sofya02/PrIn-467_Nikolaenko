const mysql = require('mysql');

function connectToDatabase() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'author_network'
  });

  connection.connect((error) => {
    if (error) {
      console.error('Ошибка подключения к базе данных: ' + error.stack);
      return;
    }

    console.log('Успешно подключен к базе данных с идентификатором ' + connection.threadId);

    connection.end();
  });
}

// Вызов функции для подключения к базе данных
connectToDatabase();