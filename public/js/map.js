
const mapKey = MAP_API_KEY;
maptilersdk.config.apiKey = mapKey;

const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${mapKey}`,
    center: listing.geometry.coordinates,
    zoom: 10
});

map.addControl(new maplibregl.NavigationControl());

// ✅ Wait for map to load before adding marker
map.on("load", () => {
    console.log("Coordinates: ", listing.geometry.coordinates);

    const el = document.createElement('div');
    el.innerHTML = '🏠';
    el.style.fontSize = '30px';
    el.style.cursor = 'pointer';
    
    new maplibregl.Marker({ color: "red" , element: el })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new maplibregl.Popup({offset: 25})
        .setHTML(`<h5>${listing.title}</h5><p>Exact location will be provided after booking</p>`))
        .addTo(map);
});