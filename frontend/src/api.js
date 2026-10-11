const API_BASE_URL = '/api';

// Check whether the backend is running
export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('Could not connect to the backend.');
  }

  return response.json();
}

// Get normal crop recommendations
export async function getCropRecommendations(farmDetails) {
  const response = await fetch(
    `${API_BASE_URL}/crops/recommendations`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(farmDetails),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get crop recommendations.');
  }

  return data;
}

// Get personalized soil-based recommendations
export async function getPersonalizedRecommendations(farmDetails) {
  const response = await fetch(
    `${API_BASE_URL}/crops/personalized`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(farmDetails),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to get personalized recommendations.'
    );
  }

  return data;
}
// Search for villages, towns, and cities
export async function searchWeatherLocations(location) {
  const response = await fetch(
    `/api/weather/search?location=${encodeURIComponent(location)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to search locations.");
  }

  return data.locations;
}

// Fetch weather for the selected location
export async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  const response = await fetch(`/api/weather?${params}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch weather.");
  }

  return data;
}