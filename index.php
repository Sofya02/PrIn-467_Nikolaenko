<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Авторская сеть</title>
  <link rel="stylesheet" href="i.css">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css" rel="stylesheet" type="text/css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <?php include 'db.php'; ?>
  <script src="graph.js"></script>
</head>
<body>
  <div id="author_network"></div>
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
  </div> 
  <div id="text-l">
    <h1 id="text">Список публикаций автора:</h1>
    <button id="clear-author-selection">Очистить</button> 
    <p id="author-info"></p>
    <div class="chart-container">
        <canvas id="chart"></canvas>
    </div>
    <ol id="co-publications-list"></ol>
    <ol id="publications-list"></ol>
  </div>
</body>
</html>