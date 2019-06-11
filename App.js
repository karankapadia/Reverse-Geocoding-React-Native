import React from 'react';
import { ActivityIndicator, Text, Button, Platform, StyleSheet, View, TouchableHighlight, Alert } from 'react-native';
import Touchable from 'react-native-platform-touchable';

import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import MapView, { Marker,Callout } from 'react-native-maps';

export default class GeocodingScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedExample: [],
      result: '',
      inProgress: false,
      markers: []
    };

   this.handlePress = this.handlePress.bind(this);
   this._attemptReverseGeocodeAsync = this._attemptReverseGeocodeAsync.bind(this);
  }
  componentDidMount() {
    Permissions.askAsync(Permissions.LOCATION);
  }

   handlePress(e) {
    this.setState({
      markers: [
          ...this.state.markers,
        {
          coordinate : e.nativeEvent.coordinate,
        }
      ]
    })
    console.log('Coord: ', e.nativeEvent.coordinate);

  }

  render() {
    let { selectedExample } = this.state

    return (
      <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Select a location</Text>
            </View>

        <MapView
            style={styles.Map}
            initialRegion={{
              latitude: 51.1657,
              longitude: 10.4515,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            zoomEnabled = {true}
            scrollEnabled = {true}
            showsScale = {true}
            onPress={this.handlePress}
        >
         {this.state.markers.map((marker,index) => {
            return (
                <Marker key = {index} {...marker} onPress = {(e) => this._attemptReverseGeocodeAsync(e)}>

                </Marker>
            )
          })}

        </MapView>

        <View style={styles.result}>

          {this._maybeRenderResult()}

        </View>

      </View>
    );
  }

  _attemptReverseGeocodeAsync = async (e) => {
    console.log("inside");
    this.setState({ inProgress: true });
    try {
      let result = await Location.reverseGeocodeAsync(
        e.nativeEvent.coordinate
      );
      this.setState({ result });
    } catch (e) {
      this.setState({ error: e });
    } finally {
      this.setState({ inProgress: false });
    }
  };


  _maybeRenderResult = () => {
    let { selectedExample } = this.state.markers;
    let text = typeof selectedExample === 'string'
        ? selectedExample
        : JSON.stringify(selectedExample);

    if (this.state.inProgress) {
      return <ActivityIndicator style={{ marginTop: 10 }} />;
    } else if (this.state.result) {
      return (
        <Text style={styles.resultText}>
          {text} City: {JSON.stringify(this.state.result)}
        </Text>
      );
    } else if (this.state.error) {
      return (
        <Text style={styles.errorResultText}>
          {text} cannot resolve: {JSON.stringify(this.state.error)}
        </Text>
      );
    }
  };

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  result: {
    bottom: 5,
    padding: 20,
  },
  resultText:{
    fontSize: 18,
  },

  errorResultText: {
    padding: 20,
    color: 'red',
  },
  Map: {
  flex: 1,
  bottom: 70,
  },
});