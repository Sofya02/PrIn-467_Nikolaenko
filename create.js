document.addEventListener('DOMContentLoaded', function() {
    // Создание элементов для фильтрации
    const filterMenu = document.createElement('div');
    filterMenu.id = 'filter-menu';

    // Создание элементов для фильтрации авторов с совместными публикациями
    const jointWorksCheckbox = document.createElement('input');
    jointWorksCheckbox.type = 'checkbox';
    jointWorksCheckbox.id = 'showJointWorks';
    jointWorksCheckbox.name = 'showJointWorks';
    jointWorksCheckbox.value = 'true';

    const jointWorksLabel = document.createElement('label');
    jointWorksLabel.htmlFor = 'showJointWorks';
    jointWorksLabel.textContent = 'Авторы с совместными публикациями';

    const jointWorksControls = document.createElement('div');
    jointWorksControls.id = 'controls';
    jointWorksControls.appendChild(jointWorksCheckbox);
    jointWorksControls.appendChild(jointWorksLabel);

    // Создание элементов для фильтрации авторов без совместных публикаций
    const noJointWorksCheckbox = document.createElement('input');
    noJointWorksCheckbox.type = 'checkbox';
    noJointWorksCheckbox.id = 'showNoJointWorks';
    noJointWorksCheckbox.name = 'showNoJointWorks';
    noJointWorksCheckbox.value = 'true';

    const noJointWorksLabel = document.createElement('label');
    noJointWorksLabel.htmlFor = 'showJointWorks';
    noJointWorksLabel.textContent = 'Авторы без совместных публикаций';

    const noJointWorksControls = document.createElement('div');
    noJointWorksControls.id = 'controls';
    noJointWorksControls.appendChild(noJointWorksCheckbox);
    noJointWorksControls.appendChild(noJointWorksLabel);

    // Создание элементов для выбора автора
    const authorSelect = document.createElement('select');
    authorSelect.id = 'author-search-dropdown';
    authorSelect.name = 'authors';

    const clearAuthorSearchButton = document.createElement('button');
    clearAuthorSearchButton.id = 'clear-author-search';
    clearAuthorSearchButton.textContent = 'Очистить';

    // Создание элементов для выбора количества публикаций
    const valueSearchDropdown = document.createElement('select');
    valueSearchDropdown.id = 'value-search-dropdown';
    const options = ['---', 'меньше 10', '11-50', '51-100', 'больше 100'];
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.textContent = option;
        valueSearchDropdown.appendChild(opt);
    });

    const clearValueSearchButton = document.createElement('button');
    clearValueSearchButton.id = 'clear-value-search';
    clearValueSearchButton.textContent = 'Очистить';

    // Добавление элементов в filterMenu
    const auDiv = document.createElement('div');
    auDiv.id = 'au';
    auDiv.appendChild(jointWorksControls);
    auDiv.appendChild(noJointWorksControls);
    filterMenu.appendChild(auDiv);

    const auDiv2 = document.createElement('div');
    auDiv2.id = 'au';
    auDiv2.appendChild(document.createElement('h3')).textContent = 'Автор:';
    auDiv2.appendChild(authorSelect);
    auDiv2.appendChild(clearAuthorSearchButton);
    filterMenu.appendChild(auDiv2);

    const auDiv3 = document.createElement('div');
    auDiv3.id = 'au';
    auDiv3.appendChild(document.createElement('h3')).textContent = 'Количество публикаций:';
    auDiv3.appendChild(valueSearchDropdown);
    auDiv3.appendChild(clearValueSearchButton);
    filterMenu.appendChild(auDiv3);

    // Добавление filterMenu в body
    document.body.appendChild(filterMenu);

    // Создание элемента для отображения графа
    const authorNetwork = document.createElement('div');
    authorNetwork.id = 'author_network';
    document.body.appendChild(authorNetwork);

    // Создание элементов для списка публикаций
    const textL = document.createElement('div');
    textL.id = 'text-l';

    const textHeader = document.createElement('h1');
    textHeader.id = 'text';
    textHeader.textContent = 'Список публикаций автора:';

    const clearAuthorSelectionButton = document.createElement('button');
    clearAuthorSelectionButton.id = 'clear-author-selection';
    clearAuthorSelectionButton.textContent = 'Очистить';

    const authorInfo = document.createElement('p');
    authorInfo.id = 'author-info';

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = 'chart';

    const coPublicationsList = document.createElement('ol');
    coPublicationsList.id = 'co-publications-list';

    const publicationsList = document.createElement('ol');
    publicationsList.id = 'publications-list';

    // Добавление элементов в text-l
    textL.appendChild(textHeader);
    textL.appendChild(clearAuthorSelectionButton);
    textL.appendChild(authorInfo);
    textL.appendChild(chartContainer);
    chartContainer.appendChild(chartCanvas);
    textL.appendChild(coPublicationsList);
    textL.appendChild(publicationsList);

    // Добавление text-l в body
    document.body.appendChild(textL);



    // Установка стилей для body
    document.body.style.font = '10pt arial';
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.backgroundColor = 'rgb(247, 241, 227)';

    // Установка стилей для #author_network
    // const authorNetwork = document.getElementById('author_network');
    authorNetwork.style.position = 'fixed';
    authorNetwork.style.width = '900px';
    authorNetwork.style.height = '620px';
    authorNetwork.style.border = '1px solid rgb(0, 0, 0)';
    authorNetwork.style.marginTop = '90px';
    authorNetwork.style.marginLeft = '15px';
    authorNetwork.style.float = 'left';
    authorNetwork.style.backgroundColor = '#fff';

    // Установка стилей для #text-l
    // const textL = document.getElementById('text-l');
    textL.style.paddingTop = '5px';
    textL.style.paddingLeft = '950px';

    // Установка стилей для #filter-menu
    // const filterMenu = document.getElementById('filter-menu');
    filterMenu.style.position = 'fixed';
    filterMenu.style.border = '1px solid rgb(0, 0, 0)';
    filterMenu.style.backgroundColor = '#FFF8E7';
    filterMenu.style.marginLeft = '15px';
    filterMenu.style.marginTop = '15px';
    filterMenu.style.width = '900px';

    // Установка стилей для #au внутри #filter-menu
    const auElements = filterMenu.querySelectorAll('#filter-menu #au');
    auElements.forEach((au, index) => {
        au.style.display = 'inline-block';
        au.style.marginRight = index < auElements.length - 1 ? '30px' : '0';
    });
});