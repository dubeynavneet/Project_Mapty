'use script'
// prettier-ignore

// Workout class
class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;   //in km
        this.duration = duration;   //in min
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.decsription = `${this.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} 
        ${this.date.getDate()}`;                        // {emoji} 🚴‍♂️🏃‍♂️Running on April 14
    }

    click() {
        this.clicks++;
    }
}


/////////////////////////////////////////////////////////
// Running class inhering workout class
class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.clacPace();
        this._setDescription();
    }

    clacPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}


////////////////////////////////////////////////////////
// Cycling class inherting workout class
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.clacSpeed();
        this._setDescription();
    }

    clacSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}


////////////////////////////////////////////////////////

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
    #mapZoomLevel = 13;
    #mapEvent;
    #workouts = [];
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevation);
        containerWorkwouts.addEventListener('click',this._moveToPopup.bind(this));
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

        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);  // setView method accepts an array as well as 2nd argument of zoom level

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

    _hideFrom(){
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=>{
            form.style.display = 'grid';
        },1000);
    }
    _toggleElevation() {
        // closest is method which selects the parents not the children (inverse of querySelector)
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();
        const { lat, lng } = this.#mapEvent.latlng;
        const validateInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        // to check number is positive or not
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        //1) fetch data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        let workout;
        // 2) if workout running create running object
        if (type === "running") {
            const cadence = +inputCadence.value;
            if (!validateInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert("Enter a valid number");
            }
            workout = new Running([lat, lng], distance, duration, cadence);
        }
        // 3) if workout cycling create cycling object
        if (type === "cycling") {
            const elevation = +inputElevation.value;
            if (!validateInputs(distance, duration, elevation) || !allPositive(distance, duration)) {
                return alert("Enter a valid number");
            }
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        // 4) add new object to workout array
        this.#workouts.push(workout);
        console.log(workout);
        // 5) render workout on map as marker
        this._addMarker(workout);
        this._renderWorkout(workout);
        // 6)clear the values
        
        console.log("Hi");

        console.log(this.#mapEvent);

    }

    _addMarker(workout) {
        inputType
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(workout.decsription, {
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            })
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.decsription}</h2>
          <div class="workout__details">
            <span class="workout__icon">
            ${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}
            </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `
        if (workout.type === 'running') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `
        }
        if (workout.type === "cycling"){
           html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
            `
        }
        form.insertAdjacentHTML('afterend',html);
        this._hideFrom();
    }

    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout')
        // console.log(workoutEl);

        if(!workoutEl) return;

        const workout = this.#workouts.find(
            work => work.id === workoutEl.dataset.id
        );

        this.#map.setView(workout.coords,this.#mapZoomLevel,{
            animate: true,
            pan: {
                duration: 1,
            },   
        });

        workout.click();
        // console.log(workout.clicks);
    }
}

// creating object of app class

const app = new App();
// app._getPosition();

// navigator.geolocation check wheather geolocation exist on browser or not

// new event listining :- change