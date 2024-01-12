'use script'
// prettier-ignore

// Workout class
class Workout {

    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;   //in km
        this.duration = duration;   //in min
        this.clacPace();
    }
}


/////////////////////////////////////////////////////////
// Running class inhering workout class
class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
    }

    clacPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}


////////////////////////////////////////////////////////
// Cycling class inherting workout class
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.classSpeed();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}


////////////////////////////////////////////////////////
const months = ['January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const form = document.querySelector('.form');
const containerWorkwouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const inputDuration = document.querySelector('.form__input--duration');

///////////////////////////////////////////////////////
// App class (how app works)
class App {
    #map;
    #mapEvent;
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevation);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert(`Couldn't fetch the location`);   // if failed
            }
            )
        }
    }

    _loadMap(position) {
        // .getCurrentPosition function takes 2 callback func as input 
        // console.log("hi");
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        console.log(latitude, longitude);
        console.log(`https://www.google.com/maps/@{latitude},{longitude}`);

        const coords = [latitude, longitude]

        // LeafLet library

        this.#map = L.map('map').setView(coords, 15);  // setView method accepts an array as well as 2nd argument of zoom level

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevation() {
        // closest is method which selects the parents not the children (inverse of querySelector)
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();

        const validateInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        // !Number.isFinite(distance) || 
        // !Number.isFinite(duration) || 
        // !Number.isFinite(elevation)
        // to check number is positive or not
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        //1) fetch data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        // 2) if workout running create running object
        if (type === "running") {
            const cadence = +inputCadence.value;
            if (!validateInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert("Enter a valid number");
            }
        }
        // 3) if workout cycling create cycling object
        if (type === "cycling") {
            const elevation = +inputElevation.value;
            if (!validateInputs(distance, duration, elevation) || !allPositive(distance, duration)) {
                return alert("Enter a valid number");
            }
        }
        // 4) add new object to workout array
        // 5) render workout on map as marker
        const { lat, lng } = this.#mapEvent.latlng;
        //Adding marker
        inputType
        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup('Home', {
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `running-popup`,
            })
            .openPopup();
        // 6)clear the values
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';

        console.log(this.#mapEvent);

    }
}

// creating object of app class

const app = new App();
// app._getPosition();

// navigator.geolocation check wheather geolocation exist on browser or not

// new event listining :- change