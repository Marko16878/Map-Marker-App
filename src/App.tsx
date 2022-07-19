import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { MarkerModel } from './models/MarkerModel';
import './App.css';
import Markers from './components/Markers/Markers';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 45,
  lng: 15
};

function App() {

  const [markers, setMarkers] = useState<MarkerModel[]>([])
  const [text, setText] = useState<string>("")
  const [errors, setErrors] = useState<string[]>([])

  //Click to add. When the user clicks on the map, add a marker for the latitude & longitude where clicked.
  const handleAddMarkerOnClick = (e: any) => {
    console.log(e.latLng.lat(), e.latLng.lng())
    var newMarker = new MarkerModel({ lat: e.latLng.lat(), lng: e.latLng.lng() }, "red")
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
  const colors = ["red", "green", "blue", "orange", "black", "yellow", "pink"]

  const handleChangeColor = (markerIndex: number, color: string) => {
    var newArray: MarkerModel[] = []
    markers.forEach((marker, index) => {
      if (index === markerIndex) {
        var colorIndex = colors.indexOf(marker.color, 0)
        var newMarker = new MarkerModel(marker.position, colors[colorIndex + 1])
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
    var lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      var parts = line.split(",")
      if (!isNaN(Number(parts[0])) && Number(parts[0]) > -90 && Number(parts[0]) < 90 && !isNaN(Number(parts[1])) && Number(parts[1]) > -180 && Number(parts[1]) < 180) {
        var newMarker = new MarkerModel({ lat: Number(parts[0]), lng: Number(parts[1]) }, colors.indexOf(parts[2], 0) !== -1 ? parts[2] : colors[0])
        setMarkers(markers => [...markers, newMarker])
      }
      else {
        setErrors(errors => [...errors, "Line " + (index + 1).toString() + ": " + line]);
        setTimeout(() => setErrors([]), 3000)
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
    if(markers.length === 1)
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

  return (
    <div className="App">
      <LoadScript googleMapsApiKey="AIzaSyBTgU1Rpxkp7GbjcgAaYAvTHFDEagwN9hA">
        <GoogleMap
          onTilesLoaded={handleGetLocalStorage}
          mapContainerStyle={containerStyle}
          center={center}
          zoom={5}
          onClick={(e) => { handleAddMarkerOnClick(e) }}
        >
          {markers.length > 0 && <Markers markers={markers} handleChangeColor={handleChangeColor} handleDeleteMarker={handleDeleteMarker} />}
        </GoogleMap>
      </LoadScript>
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
