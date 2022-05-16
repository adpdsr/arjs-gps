window.onload = () => {
    // if you want to dynamically add places, de-comment following line
    // let method = 'dynamic';

    let method = 'static';

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    if (method === 'static') {


        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log(position.coords);

                let places = staticLoadPlaces(position.coords);

                console.log(places);

                renderPlaces(places);
            },
            function(err) {
                console.error('Error in retrieving position', err);
            },
            options
        );

    }

    if (method !== 'static') {

        // first get current user location
        return navigator.geolocation.getCurrentPosition(
            function(position) {
                dynamicLoadPlaces(position.coords)
                    .then((places) => {
                        renderPlaces(places);
                    })
            },
            function (err) {
                console.error('Error in retrieving position', err);
            },
            options
        );
    }
};

function staticLoadPlaces(position) {
    return [
        {
            name: 'Place 1',
            location: {
                lat: position.latitude + 0.00002,
                lng: position.longitude + 0.00003,
            }
        },
        {
            name: 'Place 2',
            location: {
                lat: position.latitude + 0.00004,
                lng: position.longitude + 0.00001,
            }
        },
        {
            name: 'Place 3',
            location: {
                lat: position.latitude + 0.00007,
                lng: position.longitude + 0.00004,
            }
        },
        {
            name: 'Place 4',
            location: {
                lat: position.latitude - 0.00002,
                lng: position.longitude + 0.00005,
            }
        },
        {
            name: 'Place 5',
            location: {
                lat: position.latitude - 0.00004,
                lng: position.longitude - 0.00003,
            }
        }
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'HZIJGI4COHQ4AI45QXKCDFJWFJ1SFHYDFCCWKPIJDWHLVQVZ',   // add your credentials here
        clientSecret: '',   // add your credentials here
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        const latitude = place.location.lat;
        const longitude = place.location.lng;

        // add place icon
        const icon = document.createElement('a-image');
        icon.setAttribute('gps-projected-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        icon.setAttribute('name', place.name);
        icon.setAttribute('src', './assets/map-marker.png');

        // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
        icon.setAttribute('scale', '3, 3');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

        const clickListener = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();

            const name = ev.target.getAttribute('name');

            const el = ev.detail.intersection && ev.detail.intersection.object.el;

            if (el && el === ev.target) {
                const label = document.createElement('span');
                const container = document.createElement('div');
                container.setAttribute('id', 'place-label');
                label.innerText = name;
                container.appendChild(label);
                document.getElementById("scene").appendChild(container);

                setTimeout(() => {
                    container.parentElement.removeChild(container);
                }, 1500);
            }
        };

        icon.addEventListener('click', clickListener);

        scene.appendChild(icon);
    });
}
