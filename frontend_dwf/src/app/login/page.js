import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import styles from '../styles/login.css'; 

const Login = () => {
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
            
            <form className="login-form">
              <div className="form-group">
                <label htmlFor="usuario">Usuario:</label>
                <input 
                  type="text" 
                  id="usuario" 
                  name="usuario" 
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contrasena">Contraseña:</label>
                <input 
                  type="password" 
                  id="contrasena" 
                  name="contrasena" 
                  className="form-control"
                />
              </div>
              
              <button type="submit" className="ingresar-btn">
                INGRESAR
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;