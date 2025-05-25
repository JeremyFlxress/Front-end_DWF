'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import apiService from '@/config/apiService';
import styles from '../styles/login.css'; 

const Login = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Intentando login con:', credentials);
      const response = await apiService.auth.login(credentials);
      console.log('Respuesta del servidor:', response);
      
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        console.log('Token guardado, redirigiendo...');
        router.push('/dashboard');
      } else {
        console.error('Respuesta sin token:', response);
        setError('Error en la autenticación: No se recibió el token');
      }
    } catch (err) {
      console.error('Error detallado:', err);
      const errorMessage = err.response?.data?.message || 
                         (err.code === 'ECONNABORTED' ? 'Tiempo de espera agotado' : 
                          err.message === 'Network Error' ? 'No se puede conectar al servidor' : 
                          'Error al intentar iniciar sesión');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - ¡SUPÉRATE!</title>
        <meta name="description" content="Login para sistema ¡SUPÉRATE!" />
      </Head>
      <div className="login-container">
        <div className="login-left">
          <div className="background-image">
            <img 
              src="/superate1.jpg" 
              alt="Estudiantes del programa ¡SUPÉRATE!" 
              className="student-image"
            />
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-form-container">
            <div className="logo-container">
              <img 
                src="/logosuperate.png" 
                alt="Logo ¡SUPÉRATE!" 
                className="superete-logo"
              />
            </div>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Usuario:</label>
                <input 
                  type="text" 
                  id="username" 
                  name="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    username: e.target.value
                  })}
                  className="form-control"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    password: e.target.value
                  })}
                  className="form-control"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                type="submit" 
                className="ingresar-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'INGRESAR'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;