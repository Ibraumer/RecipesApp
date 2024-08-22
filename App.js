import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import FilteredResultsScreen from './FilteredResultsScreen';
import RecipeDetailsScreen from './RecipeDetailsScreen';
import { TouchableOpacity, TextInput, View, StyleSheet, Animated, TouchableWithoutFeedback, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerTitle: 'RecipeFindeaaaaaar',
          headerStyle: { backgroundColor: '#e0ffff' }, 
          headerTintColor: '#8b008b', 
          headerTitleStyle: { fontWeight: 'bold' }, 
          headerRight: () => (
            <SearchComponent navigation={navigation} />
          ),
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Recipe Finder' }} />
        <Stack.Screen name="FilteredResults" component={FilteredResultsScreen} options={{ title: 'Filtered Results' }} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsScreen} options={{ title: 'Recipe Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const SearchComponent = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const handleBackPress = () => {
      if (searchVisible) {
        handleTouchOutside();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [searchVisible]);

  const handleSearch = () => {
    if (query.trim()) {
      navigation.navigate('FilteredResults', { filterType: 'Search', filterValue: query });
    }
  };

  const toggleSearch = () => {
    if (searchVisible) {
      // Hide the search input with animation
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setSearchVisible(false));
    } else {
      // Show the search input with animation
      setSearchVisible(true);
      Animated.timing(animatedWidth, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleTouchOutside = () => {
    if (searchVisible) {
      // Hide the search input when tapping outside
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setSearchVisible(false));
    }
  };

  return (
    <GestureHandlerRootView>
      <TouchableWithoutFeedback onPress={handleTouchOutside}>
        <View style={styles.searchContainer}>
          {searchVisible && (
            <Animated.View style={[styles.animatedContainer, { width: animatedWidth }]}>
              <TextInput
                style={styles.input}
                placeholder="Search"
                placeholderTextColor="#d1c4e9"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch}>
                <Icon name="search" size={24} color="#8b008b" style={styles.icon} />
              </TouchableOpacity>
            </Animated.View>
          )}
          <TouchableOpacity onPress={toggleSearch} style={styles.iconContainer}>
            <Icon name={searchVisible ? 'close' : 'search'} size={24} color="#8b008b" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
    marginTop:8,
    
    justifyContent: 'flex-end',
  },
  animatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8b008b',
    overflow: 'hidden',
  },
  input: {
    height: 40,
    color: '#8b008b',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    flex: 1,
  },
  icon: {
    padding: 4,
    marginBottom: 4, // Adjust this value to align the icon with the title
  },
  iconContainer: {
    marginLeft: 0,
  },
});

export default App;
