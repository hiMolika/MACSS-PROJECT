import axios from 'axios';

const API_URL = 'http://localhost:8001';

export const sendChatMessage = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, {
      text: message,
      sender: 'user'
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getConversation = async (conversationId) => {
  try {
    const response = await axios.get(`${API_URL}/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    throw error;
  }
};