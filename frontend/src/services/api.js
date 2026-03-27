// Get the API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper function to make API calls
 * This function handles all the repetitive fetch logic
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/tasks')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Returns the JSON response from the API
 */
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options, // Spread the additional options (method, body, etc.)
    });

    // If the response status is not OK (200-299), throw an error
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    // Log error for debugging
    console.error('API Error:', error);
    // Re-throw the error so the component can handle it
    throw error;
  }
};

/**
 * Fetch all tasks
 * GET /api/tasks
 */
export const getTasks = async () => {
  return apiCall('/tasks');
};

/**
 * Fetch a single task by ID
 * GET /api/tasks/:id
 */
export const getTask = async (id) => {
  return apiCall(`/tasks/${id}`);
};

/**
 * Create a new task
 * POST /api/tasks
 * 
 * @param {string} title - Task title
 * @param {number} duration - Duration in minutes (1-1440)
 */
export const createTask = async (title, duration) => {
  return apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, duration }),
  });
};

/**
 * Update a task
 * PATCH /api/tasks/:id
 * 
 * @param {string} id - Task ID
 * @param {object} updates - Object with fields to update (completed, duration)
 */
export const updateTask = async (id, updates) => {
  return apiCall(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

/**
 * Delete a single task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (id) => {
  return apiCall(`/tasks/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Delete all tasks
 * DELETE /api/tasks
 */
export const deleteAllTasks = async () => {
  return apiCall('/tasks', {
    method: 'DELETE',
  });
};

/**
 * Check for expired tasks and delete them
 * DELETE /api/tasks/expires
 */
export const checkExpiredTasks = async () => {
  return apiCall('/tasks/expires', {
    method: 'DELETE',
  });
};
