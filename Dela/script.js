var map = L.map('map').setView([-7.7982486, 110.3550609], 12.75);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getColor(warna) {
  return warna;
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.warna),
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5
  };
}

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.nama) {
    layer.bindPopup(feature.properties.nama);
  }
}

fetch('Yogya.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  })
  .catch(error => console.error('Error fetching the GeoJSON file:', error));

function pointToLayer(feature, latlng) {
  if (feature.geometry.type === "Point") {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      })
    });
  }
}

fetch('RS.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer,
    }).addTo(map);
    showRumahsakitList(data);
  })
  .catch(error => console.error('Error fetching the GeoJSON file:', error));

var rsGeojson;

fetch('RS.geojson')
  .then(response => response.json())
  .then(data => {
    rsGeojson = data;
  })
  .catch(error => console.error('Error fetching the GeoJSON file:', error));

function searchRumahsakit() {
  var searchTerm = document.getElementById('search-input').value.toLowerCase();

  var found = false;
  if (rsGeojson.features && rsGeojson.features.length > 0) {
    rsGeojson.features.forEach(feature => {
      if (feature.properties && feature.properties.nama) {
        var RSName = feature.properties.nama.toLowerCase();
        if (RSName.includes(searchTerm)) {
          var coordinates = feature.geometry.coordinates;
          map.setView([coordinates[1], coordinates[0]], 18);
          L.popup()
            .setLatLng([coordinates[1], coordinates[0]])
            .setContent(feature.properties.nama)
            .openOn(map);
          found = true;
        }
      }
    });
  }
  if (!found) {
    alert('Rumah Sakit tidak ditemukan.');
  }
}

function showRumahsakitList(data) {
  var RSNames = data.features.map(feature => feature.properties.nama);
  var column1 = document.getElementById('column1');
  var column2 = document.getElementById('column2');
  var column1HTML = '';
  var column2HTML = '';
  RSNames.forEach((name, index) => {
    if (index % 2 === 0) {
      column1HTML += `<div><a href="#" class="rumahsakit-link" data-name="${name}">${name}</a></div>`;
    } else {
      column2HTML += `<div><a href="#" class="rumahsakit-link" data-name="${name}">${name}</a></div>`;
    }
  });
  column1.innerHTML = column1HTML;
  column2.innerHTML = column2HTML;

  var rsLinks = document.getElementsByClassName('rumahsakit-link');
  Array.from(rsLinks).forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      var RSName = this.getAttribute('data-name');
      zoomToRumahsakit(RSName);
    });
  });
}

function zoomToRumahsakit(RSName) {
  var rsFeature = rsGeojson.features.find(feature => feature.properties.nama === RSName);

  if (rsFeature) {
    var coordinates = rsFeature.geometry.coordinates;
    map.setView([coordinates[1], coordinates[0]], 15, { animate: true, duration: 1 });
  }
}
