import * as React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const FirstRoute = () => (
  <View style={[styles.scene, { backgroundColor: "#ff4081" }]}>
    <Text style={styles.text}>First Route</Text>
  </View>
);

const SecondRoute = () => (
  <View style={[styles.scene, { backgroundColor: "#673ab7" }]}>
    <Text style={styles.text}>Second Route</Text>
  </View>
);

const initialLayout = {
  width: Dimensions.get('window').width,
};

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

const renderTabBar = (props) => (
  <TabBar
    {...props}
    renderLabel={({ route, focused }) => (
      <Text style={{ 
        color: focused ? 'white' : 'rgba(255, 255, 255, 0.7)',
        margin: 8,
      }}>
        {route.title}
      </Text>
    )}
    indicatorStyle={{ backgroundColor: "white" }}
    style={{ backgroundColor: "black" }}
  />
);

export default function SnapTab() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "First" },
    { key: "second", title: "Second" },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
    />
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 30,
  },
});