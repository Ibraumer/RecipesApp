import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons'; // Importing AntDesign icons
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importing AsyncStorage

const RecipeDetailsScreen = ({ route }) => {
  const { id } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false); // State to track if the recipe is a favorite

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        setRecipe(response.data.meals[0]);

        // Check if the recipe is already in favorites
        const currentFavorites = await AsyncStorage.getItem('favorites');
        const favoritesArray = currentFavorites ? JSON.parse(currentFavorites) : [];
        const isAlreadyFavorite = favoritesArray.some((fav) => fav.idMeal === response.data.meals[0].idMeal);
        setIsFavorite(isAlreadyFavorite);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#8b008b" />;
  }

  if (!recipe) {
    return <Text>No recipe found</Text>;
  }

  const handleAddToFavorites = async () => {
    try {
      const currentFavorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = currentFavorites ? JSON.parse(currentFavorites) : [];

      // Check if the recipe is already in favorites
      const isAlreadyFavorite = favoritesArray.some((fav) => fav.idMeal === recipe.idMeal);

      if (isAlreadyFavorite) {
        Alert.alert('Already in Favorites', 'This recipe is already in your favorites.');
      } else {
        favoritesArray.push(recipe);
        await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
        setIsFavorite(true); // Update the state to indicate the recipe is now a favorite
        Alert.alert('Added to Favorites', 'This recipe has been added to your favorites.');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'There was a problem adding the recipe to your favorites.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.strMealThumb }}
            style={styles.image}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.strMeal}</Text>
        </View>
        <Text style={styles.subtitle}>Category: {recipe.strCategory}</Text>
        <Text style={styles.subtitle}>Area: {recipe.strArea}</Text>

        <View style={styles.favoritesContainer}>
          <TouchableOpacity style={styles.favoritesButton} onPress={handleAddToFavorites}>
            <AntDesign name="heart" size={24} color="red" />
            <Text style={styles.favoritesText}>
              {isFavorite ? 'In Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructions}>{recipe.strInstructions}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e5f5',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  imageContainer: {
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 20,
    borderColor: '#ff6347',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 10,
  },
  image: {
    width: '100%',
    height: 250,
  },
  titleContainer: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 20,
    marginBottom: 8,
    marginTop: 8,
    marginHorizontal: 30,
    alignItems: 'center',
    elevation: 10,
    borderColor: '#ff6347',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'sans-serif-condensed', // Sharp font style
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    marginLeft: 20,
    color: '#8b008b',
    textAlign: 'left',
    fontFamily: 'sans-serif',
  },
  favoritesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    padding: 8,
    borderColor: '#8b008b',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#e6e6fa',
    elevation: 2,
    marginHorizontal: 80,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoritesText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8b008b',
  },
  instructionsContainer: {
    marginTop: 16,
    padding: 16,
    borderColor: '#8b008b',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
    marginHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#8b008b',
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'sans-serif',
  },
});

export default RecipeDetailsScreen;
