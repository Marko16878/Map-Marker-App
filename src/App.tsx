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
  lat: -3.745,
  lng: -38.523
};

function App() {

  const [markers, setMarkers] = useState<MarkerModel[]>([])
  const [text, setText] = useState<string>("")
  const [errors, setErrors] = useState<string[]>([])

  const handleAddMarkerOnClick = (e: any) => {
    var newMarker = new MarkerModel({ lat: e.latLng.lat(), lng: e.latLng.lng() }, "red")
    setMarkers(markers => [...markers, newMarker]);
  }

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

  const handleAddMarkerFromString = () => {
    var lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      var parts = line.split(",")
      if (!isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
        var newMarker = new MarkerModel({ lat: Number(parts[0]), lng: Number(parts[1]) }, colors.indexOf(parts[2], 0) !== -1 ? parts[2] : "red")
        setMarkers(markers => [...markers, newMarker])
      }
      else {
        setErrors(errors => [...errors, "Line " + (index + 1).toString() + ": " + line]);
        setTimeout(() => setErrors([]), 3000)
      }
    })
  }

  const handleDeleteMarker = (markerIndex: number) => {
    var newArray: MarkerModel[] = []
    markers.forEach((marker, index) => {
      if (index !== markerIndex) {
        newArray.push(marker)
      }
    })
    if(markers.length === 1)
      localStorage.setItem('markers', JSON.stringify([]));
    setMarkers(newArray);
  }

  const handleGetLocalStorage = () => {
    const storedMarkers = JSON.parse(localStorage.getItem('markers') || "[]");
    if (storedMarkers) {
      setMarkers(storedMarkers);
    }
  }

  useEffect(() => {
    if (markers.length !== 0)
      localStorage.setItem('markers', JSON.stringify(markers));
  }, [markers]);

  return (
    <div className="App">
      <LoadScript googleMapsApiKey="AIzaSyBTgU1Rpxkp7GbjcgAaYAvTHFDEagwN9hA">
        <GoogleMap
          onTilesLoaded={handleGetLocalStorage}
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={(e) => { handleAddMarkerOnClick(e) }}
        >
          {markers.length > 0 && <Markers markers={markers} handleChangeColor={handleChangeColor} handleDeleteMarker={handleDeleteMarker} />}
        </GoogleMap>
      </LoadScript>
      <div className="add-markers-container">
        <b>Add markers</b>
        <textarea value={text} onChange={(event) => { setText(event.target.value) }} />
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
