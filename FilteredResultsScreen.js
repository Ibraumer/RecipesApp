import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const FilteredResultsScreen = ({ route, navigation }) => {
  const { filterType, filterValue } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => navigation.navigate('RecipeDetails', { id: item.idMeal })}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
      <Text style={styles.recipeTitle}>{item.strMeal}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results for {filterType}: {filterValue}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#8b008b" />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.idMeal.toString()}
          numColumns={2}
        />
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
  title: {
    fontSize: 24,
    color: '#8b008b',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
  recipeTitle: {
    fontSize: 16,
    color: '#8b008b',
    padding: 8,
    textAlign: 'center',
  },
});

export default FilteredResultsScreen;
