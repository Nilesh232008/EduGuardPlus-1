// App.js
import React from 'react';
import { AuthProvider } from './src/services/AuthContext';
import RootNavigator   from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
<<<<<<< HEAD

=======
>>>>>>> ad5e2e914137cb9e65a21b183f8e9ad6903c1530
