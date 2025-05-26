import { UserProvider } from './context/UserContext';
import './styles/global.css';
import './styles/login.css';
import './styles/dashboard.css';
import './styles/prestamos.css';
import './styles/librosactivos.css';
import './styles/registroGeneral.css';
import './styles/reportes.css';
import './styles/renovar.css';
import './styles/detalles.css';
import './styles/pagination.css';

export const metadata = {
  title: 'Sistema ¡SUPÉRATE!',
  description: 'Aplicación del programa ¡SUPÉRATE!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}