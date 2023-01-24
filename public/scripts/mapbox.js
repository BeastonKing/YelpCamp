mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
    center: campgroundJSON.geometry.coordinates, // starting position [lng, lat]
    zoom: 12, // starting zoom
});
map.addControl(new mapboxgl.NavigationControl({
    showCompass: false,
}))
new mapboxgl.Marker()
    .setLngLat(campgroundJSON.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campgroundJSON.title}</h3><p>${campgroundJSON.location}</p>`
        )
    )
    .addTo(map);