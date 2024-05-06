const mysql = require('mysql2');

function connectToDatabase() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'author_network'
  });

  connection.connect((error) => {
    if (error) {
      console.error('Ошибка при подключении к базе данных:', error);
    } else {
      console.log('Успешное подключение к базе данных');
    }
  });

  return connection;
}

module.exports = connectToDatabase;