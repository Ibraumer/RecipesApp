import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Dimensions, Image, Alert } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import axios from 'axios';
import CountryFlag from 'react-native-country-flag';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const HomeScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'categories', title: 'Categories' },
    { key: 'area', title: 'Area' },
    { key: 'ingredients', title: 'Ingredients' },
  ]);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Fetch favorites whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        setLoadingFavorites(true);
        try {
          const currentFavorites = await AsyncStorage.getItem('favorites');
          const favoritesArray = currentFavorites ? JSON.parse(currentFavorites) : [];
          // Fetch detailed info for each favorite to get images
          const detailedFavorites = await Promise.all(favoritesArray.map(async (item) => {
            const response = await axios.get(`${API_BASE_URL}/lookup.php?i=${item.idMeal}`);
            return response.data.meals[0];
          }));
          setFavorites(detailedFavorites);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setLoadingFavorites(false);
        }
      };

      fetchFavorites();
    }, [])
  );

  const handleRemoveFavorite = async (idMeal) => {
    try {
      const currentFavorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = currentFavorites ? JSON.parse(currentFavorites) : [];
      favoritesArray = favoritesArray.filter(item => item.idMeal !== idMeal);
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      // Update the state to reflect removal
      const updatedFavorites = favorites.filter(item => item.idMeal !== idMeal);
      setFavorites(updatedFavorites);
      Alert.alert('Removed from Favorites', 'The item has been removed from favorites.', [
        { text: 'OK', style: 'default' },
      ]);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (loadingFavorites) {
    return <ActivityIndicator size="large" color="#8b008b" />;
  }

  const FavoritesSection = () => {
    if (loadingFavorites) {
      return <ActivityIndicator size="large" color="#8b008b" />;
    }

    return (
      <View style={styles.favoritesContainer}>
        <Text style={styles.favoritesHeading}>
          <AntDesign name="heart" size={24} color="#ff6347" /> Favorites
        </Text>
        <AntDesign name="heart" size={16} color="orange" style={styles.favoriteIcon} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={favorites}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.favoritesTile}
              onPress={() => navigation.navigate('RecipeDetails', { id: item.idMeal })}
            >
              <AntDesign name="heart" size={16} color="orange" style={styles.favoriteIcon} />
              <Image source={{ uri: item.strMealThumb }} style={styles.favoritesTileImage} />
              <Text style={styles.favoritesTileText}>{item.strMeal}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item.idMeal)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const CategoriesRoute = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/categories.php`);
          setData(response.data.categories);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    }, []);

    if (loading) {
      return <ActivityIndicator size="large" color="#8b008b" />;
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.idCategory}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('FilteredResults', { filterType: 'Category', filterValue: item.strCategory })}
          >
            <Text style={styles.itemText}>{item.strCategory}</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  const AreaRoute = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCountryCode = (area) => {
      const areaMap = {
        'American': 'US',
        'British': 'GB',
        'Canadian': 'CA',
        'Chinese': 'CN',
        'Croatian': 'HR',
        'Dutch': 'NL',
        'Egyptian': 'EG',
        'Filipino': 'PH',
        'French': 'FR',
        'Greek': 'GR',
        'Indian': 'IN',
        'Irish': 'IE',
        'Italian': 'IT',
        'Jamaican': 'JM',
        'Japanese': 'JP',
        'Kenyan': 'KE',
        'Malaysian': 'MY',
        'Mexican': 'MX',
        'Moroccan': 'MA',
        'Polish': 'PL',
        'Portuguese': 'PT',
        'Russian': 'RU',
        'Spanish': 'ES',
        'Thai': 'TH',
        'Tunisian': 'TN',
        'Turkish': 'TR',
        'Unknown': 'UN',
        'Vietnamese': 'VN',
      };
      return areaMap[area] || 'UN';
    };

    useEffect(() => {
      const fetchAreas = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/list.php?a=list`);
          setData(response.data.meals);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchAreas();
    }, []);

    if (loading) {
      return <ActivityIndicator size="large" color="#8b008b" />;
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.strArea}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('FilteredResults', { filterType: 'Area', filterValue: item.strArea })}
          >
            <CountryFlag isoCode={getCountryCode(item.strArea)} size={20} />
            <Text style={styles.itemText}>{item.strArea}</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  const IngredientsRoute = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchIngredients = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/list.php?i=list`);
          setData(response.data.meals);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchIngredients();
    }, []);

    if (loading) {
      return <ActivityIndicator size="large" color="#8b008b" />;
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.idIngredient}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('FilteredResults', { filterType: 'Ingredient', filterValue: item.strIngredient })}
          >
            <Text style={styles.itemText}>{item.strIngredient}</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  const renderScene = SceneMap({
    categories: CategoriesRoute,
    area: AreaRoute,
    ingredients: IngredientsRoute,
  });

  return (
    <View style={styles.background}>
      <FavoritesSection />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#8b008b' }}
            style={{ backgroundColor: '#ffffff' }}
            activeColor="#8b008b"
            inactiveColor="#d1c4e9"
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#d1c4e9',
      borderWidth: 2,
      borderRadius: 8,
      borderColor: '#8b008b',
      marginVertical: 4,
      marginHorizontal:8,
      backgroundColor: '#e0ffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    itemText: {
      fontSize: 16,
      color: '#8b008b',
      marginLeft: 8,
    },
    favoritesContainer: {
      padding: 16,
      backgroundColor: '#f0f8ff',
      borderBottomWidth: 1,
      borderBottomColor: '#8b008b',
    },
    favoritesHeading: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#8b008b',
      marginBottom: 8,
    },
    favoritesTile: {
      marginRight: 16,
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#e0ffff',
      borderColor: '#8b008b',
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      width: 150,
      position: 'relative',
    },
    favoritesTileImage: {
      width: '100%',
      height: 100,
      borderRadius: 8,
    },
    favoritesTileText: {
      fontSize: 16,
      color: '#8b008b',
      marginTop: 8,
    },
    removeButton: {
      marginTop: 8,
      padding: 8,
      backgroundColor: '#ff6347',
      borderRadius: 8,
      alignSelf: 'center',
    },
    removeButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    favoriteIcon: {
      position: 'absolute',
      top: 8,
      left: 8,
    },
  });
  



export default HomeScreen;
