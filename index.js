const dropdown = document.getElementById('dropdown');

dropdown.addEventListener('change', function(event) {
  console.log(event.target.value);
});

const selectElement = document.getElementById('dropdown');
selectElement.style.width = '150px';
selectElement.style.height = '30px';
selectElement.style.border = '1px solid #ccc';
selectElement.style.padding = '5px';
