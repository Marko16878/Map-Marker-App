import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { MarkerModel } from './models/MarkerModel';
import './App.css';
import Markers from './components/Markers/Markers';

const colors = ["red", "green", "blue", "orange", "black", "yellow", "pink"]

const containerStyle = {
  width: '100%',
  height: '100%'
};

function App() {

  const [markers, setMarkers] = useState<MarkerModel[]>([])
  const [text, setText] = useState<string>("")
  const [errors, setErrors] = useState<string[]>([])
  const [endTime, setEndTime] = useState<number>(0)
  const [timer, setTimer] = useState<number>(0)
  const [center, setCenter] = useState<{ lat: number, lng: number }>()
  const [zoom, setZoom] = useState<number>()

  //Click to add. When the user clicks on the map, add a marker for the latitude & longitude where clicked.
  const handleAddMarkerOnClick = (e: any) => {
    var newMarker = new MarkerModel({ lat: e.latLng.lat(), lng: e.latLng.lng() }, colors[0])
    setMarkers(markers => [...markers, newMarker]);
  }

  /*Batch add. For batch add, the user inputs a multiline text. Each line of text represents a separate marker. Each marker is given as latitude and longitude, separated by comma.
  const handleAddMarkerFromString = () => {
    var lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      var parts = line.split(",")
      if (!isNaN(Number(parts[0])) && Number(parts[0]) > -90 && Number(parts[0]) < 90 && !isNaN(Number(parts[1])) && Number(parts[1]) > -180 && Number(parts[1]) < 180) {
        var newMarker = new MarkerModel({ lat: Number(parts[0]), lng: Number(parts[1]) }, colors[0])
        setMarkers(markers => [...markers, newMarker])
      }
      else {
        setErrors(errors => [...errors, "Line " + (index + 1).toString() + ": " + line]);
        setTimeout(() => setErrors([]), 3000)
      }
    })
  }*/

  //Click to change color. Click on an existing marker should change its color (for example, use predefined colors and cycle through).
  const handleChangeColor = (markerIndex: number, color: string) => {
    var newArray: MarkerModel[] = []
    markers.forEach((marker, index) => {
      if (index === markerIndex) {
        var colorIndex = colors.indexOf(marker.color, 0)
        var newMarker = new MarkerModel(marker.position, colors[colorIndex === colors.length - 1 ? 0 : colorIndex + 1])
        newArray.push(newMarker)
      }
      else {
        newArray.push(marker)
      }
    })
    setMarkers(newArray);
  }

  //Support color for batch add. For batch add, if there is a third component on the line, it should be treated as color.
  const handleAddMarkerFromString = () => {
    setErrors([])
    setEndTime(Number(timer) + 3)
    var lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      var parts = line.split(",")
      if (!isNaN(Number(parts[0])) && Number(parts[0]) > -90 && Number(parts[0]) < 90 && !isNaN(Number(parts[1])) && Number(parts[1]) > -180 && Number(parts[1]) < 180) {
        var newMarker = new MarkerModel({ lat: Number(parts[0]), lng: Number(parts[1]) }, colors.indexOf(parts[2], 0) !== -1 ? parts[2] : colors[0])
        setMarkers(markers => [...markers, newMarker])
      }
      else {
        setErrors(errors => [...errors, "Line " + (index + 1).toString() + ": " + line]);
      }
    })
  }

  //Right click to delete. When right clicked on an existing marker, delete it.
  const handleDeleteMarker = (markerIndex: number) => {
    var newArray: MarkerModel[] = []
    markers.forEach((marker, index) => {
      if (index !== markerIndex) {
        newArray.push(marker)
      }
    })
    if (markers.length === 1)
      localStorage.removeItem('markers');
    setMarkers(newArray);
  }

  // Save locally. Save data to local storage
  useEffect(() => {
    if (markers.length !== 0)
      localStorage.setItem('markers', JSON.stringify(markers));
  }, [markers]);

  //. If the user visits the app again, read data from local storage. Try to restore both markers and the current viewport.
  const handleGetLocalStorage = () => {
    const storedMarkers = JSON.parse(localStorage.getItem('markers') || "[]");
    if (storedMarkers) {
      setMarkers(storedMarkers);
    }
  }

  //timer to display message about wrong input
  useEffect(() => {
    if (timer < endTime)
      setTimeout(() => { setTimer(Number(timer) + 1) }, 1000)
    if (timer === endTime) {
      setTimer(0)
      setEndTime(0)
      setErrors([])
    }
  }, [timer, endTime])

  //determining the position of the center of the map, the location that is placed 
  //in the local storage has the highest priority, if the location is not entered in 
  //the local storage (the application is launched for the first time), then the center 
  //of the map is determined using geolocation, it is necessary to allow the application 
  //to access the geolocation of the device and if the user does not allow access 
  //map center will be in coordinates (0,0)
  useEffect(() => {
    if (center === undefined) {
      var centerIsSet = false
      var storedLocation = JSON.parse(localStorage.getItem('mapCenter') || "[]")
      if (storedLocation?.lat && storedLocation?.lng && storedLocation.zoom) {
        setCenter({ lat: storedLocation.lat, lng: storedLocation.lng })
        setZoom(storedLocation.zoom)
        centerIsSet = true
      }
      else {
        navigator?.geolocation.getCurrentPosition(
          ({ coords: { latitude: lat, longitude: lng } }) => {
            setCenter({ lat: lat, lng: lng })
            setZoom(10)
            centerIsSet = true
          }
        )
      }
      if (!centerIsSet) {
        setCenter({ lat: 0, lng: 0 })
        setZoom(2)
      }
    }
  }, [center])

  //function to write the current location to local storage every time the map is moved
  const onMapLoad = (map: any) => {
    google.maps.event.addListener(map, "bounds_changed", () => {
      var lat = map.getCenter().lat()
      var lng = map.getCenter().lng()
      var zoom = map.getZoom()
      localStorage.setItem('mapCenter', JSON.stringify({ lat: lat, lng: lng, zoom: zoom }));
    });
  };

  return (
    <div className="App">
      {center && zoom &&
        <LoadScript googleMapsApiKey="AIzaSyBTgU1Rpxkp7GbjcgAaYAvTHFDEagwN9hA">
          <GoogleMap
            onTilesLoaded={handleGetLocalStorage}
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onClick={(e) => { handleAddMarkerOnClick(e) }}
            onLoad={map => onMapLoad(map)}
          >
            {markers.length > 0 && <Markers markers={markers} handleChangeColor={handleChangeColor} handleDeleteMarker={handleDeleteMarker} />}
          </GoogleMap>
        </LoadScript>
      }

      <div className="add-markers-container">
        <b>Add markers</b>
        <textarea value={text} onChange={(event) => { setText(event.target.value) }} placeholder={"latitude,longitude,color(optional)"} />
        <button disabled={text === ""} onClick={handleAddMarkerFromString}>Add</button>
        {
          errors.length > 0 &&
          <div className="errors">
            Errors:
            {
              errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))
            }
          </div>
        }
      </div>
    </div>
  );
}

export default App;
