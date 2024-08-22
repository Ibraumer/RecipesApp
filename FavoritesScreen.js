import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoriteRecipesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const favoriteRecipes = await AsyncStorage.getItem('favorites');
      setFavorites(favoriteRecipes ? JSON.parse(favoriteRecipes) : []);
    };

    loadFavorites();
  }, []);

  const removeFavorite = async (idMeal) => {
    const updatedFavorites = favorites.filter(recipe => recipe.idMeal !== idMeal);
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={item => item.idMeal.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeItem}>
            <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
            <Text style={styles.recipeTitle}>{item.strMeal}</Text>
            <TouchableOpacity onPress={() => removeFavorite(item.idMeal)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  recipeItem: {
    marginBottom: 16,
    backgroundColor: '#f3e5f5',
    padding: 8,
    borderRadius: 8,
  },
  recipeImage: {
    width: '100%',
    height: 150,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeText: {
    color: 'red',
    marginTop: 8,
  },
});

export default FavoriteRecipesScreen;
