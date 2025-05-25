'use client';
import apiService from '@/config/apiService';

// Función de prueba
export async function testLogin() {
  try {
    const response = await apiService.auth.login({
      username: "admin.superate",
      password: "adminJosue123"
    });
    console.log('Login successful:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
