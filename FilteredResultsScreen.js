import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';  // Importing icon library

const FilteredResultsScreen = ({ route, navigation }) => {
  const { filterType, filterValue } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchFilteredRecipes = async () => {
      setLoading(true);
      try {
        let url = '';

        switch (filterType) {
          case 'Category':
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${filterValue}`;
            break;
          case 'Search':
            url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${filterValue}`;
            break;
          case 'Area':
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${filterValue}`;
            break;
          case 'Ingredient':
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${filterValue}`;
            break;
          default:
            break;
        }

        const response = await axios.get(url);
        setRecipes(response.data.meals);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredRecipes();
  }, [filterType, filterValue]);

  const isFavorite = (idMeal) => {
    return favorites.some((fav) => fav.idMeal === idMeal);
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => navigation.navigate('RecipeDetails', { id: item.idMeal })}
    >
      
      <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.strMeal}</Text>
        {isFavorite(item.idMeal) && (
          <FontAwesome name="heart" size={20} color="orange" style={styles.favoriteIcon} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Results for {filterType}: {filterValue}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#8b008b" />
      ) : (
        <View style={styles.tilesContainer}>
          <FlatList
            data={recipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.idMeal.toString()}
            numColumns={2}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3e5f5',
  },
  titleContainer: {
    backgroundColor: '#ffa07a',
    padding: 12,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'flex-start',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    textAlign: 'center',
  },
  tilesContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#8b008b',
    borderRadius: 15,
    padding: 8,
  },
  recipeItem: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recipeImage: {
    width: '100%',
    height: 150,
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  recipeTitle: {
    fontSize: 16,
    color: '#8b008b',
    flex: 1,
    textAlign: 'center',
  },
  favoriteIcon: {
    marginLeft: 8,
  },
});

export default FilteredResultsScreen;
