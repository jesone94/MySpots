async function init() {
  const url = window.location.href + '/spots';

  let response = await fetch(url);

  let spots = await response.json();

  var myMap = new ymaps.Map('map', {
      center: [55.7, 37.5],
      zoom: 9,
      controls: ['zoomControl'],
    }),
    // Создаем коллекцию.
    myCollection = new ymaps.GeoObjectCollection(),
    // Создаем массив с данными.
    myPoints = spots;

  // Заполняем коллекцию данными.
  for (var i = 0, l = myPoints.length; i < l; i++) {
    var point = myPoints[i];
    myCollection.add(
      new ymaps.Placemark(point.coords, {
        balloonContentHeader: `${point.name}`,
        balloonContentBody: `${point.description}`,
        balloonContentFooter: `<button type="button" class="btn btn-warning" id="${point._id}">Удалить</button>`,
      })
    );
  }

  // Добавляем коллекцию меток на карту.
  myMap.geoObjects.add(myCollection);

  // Создаем экземпляр класса ymaps.control.SearchControl
  var mySearchControl = new ymaps.control.SearchControl({
    options: {
      // Заменяем стандартный провайдер данных (геокодер) нашим собственным.
      provider: new CustomSearchProvider(myPoints),
      // Не будем показывать еще одну метку при выборе результата поиска,
      // т.к. метки коллекции myCollection уже добавлены на карту.
      noPlacemark: true,
      resultsPerPage: 5,
    },
  });

  // Добавляем контрол в верхний правый угол,
  myMap.controls.add(mySearchControl, { float: 'right' });
}

// Провайдер данных для элемента управления ymaps.control.SearchControl.
// Осуществляет поиск геообъектов в по массиву points.
// Реализует интерфейс IGeocodeProvider.
function CustomSearchProvider(points) {
  this.points = points;
}

// Провайдер ищет по полю text стандартным методом String.ptototype.indexOf.
CustomSearchProvider.prototype.geocode = function (request, options) {
  var deferred = new ymaps.vow.defer(),
    geoObjects = new ymaps.GeoObjectCollection(),
    // Сколько результатов нужно пропустить.
    offset = options.skip || 0,
    // Количество возвращаемых результатов.
    limit = options.results || 20;

  var points = [];
  // Ищем в свойстве text каждого элемента массива.
  for (var i = 0, l = this.points.length; i < l; i++) {
    var point = this.points[i];
    if (point.text.toLowerCase().indexOf(request.toLowerCase()) != -1) {
      points.push(point);
    }
  }
  // При формировании ответа можно учитывать offset и limit.
  points = points.splice(offset, limit);
  // Добавляем точки в результирующую коллекцию.
  for (var i = 0, l = points.length; i < l; i++) {
    var point = points[i],
      coords = point.coords,
      text = point.text;

    geoObjects.add(
      new ymaps.Placemark(coords, {
        name: text + ' name',
        description: text + ' description',
        balloonContentBody: '<p>' + text + '</p>',
        boundedBy: [coords, coords],
      })
    );
  }

  deferred.resolve({
    // Геообъекты поисковой выдачи.
    geoObjects: geoObjects,
    // Метаинформация ответа.
    metaData: {
      geocoder: {
        // Строка обработанного запроса.
        request: request,
        // Количество найденных результатов.
        found: geoObjects.getLength(),
        // Количество возвращенных результатов.
        results: limit,
        // Количество пропущенных результатов.
        skip: offset,
      },
    },
  });

  // Возвращаем объект-обещание.
  return deferred.promise();
};

ymaps.ready(init);

document.addEventListener('click', async (ev) => {
  if (ev.target.className === 'btn btn-warning') {
    const url = window.location.href + '/' + 'spots' + '/' + ev.target.id;
    let response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    let ok = await response.json();
    const map = document.querySelector('.ymaps-2-1-78-map');
    document.getElementById('map').removeChild(map);
    ymaps.ready(init);
  }
});
