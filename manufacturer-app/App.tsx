import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ManufacturerProvider } from './src/context/ManufacturerContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ManufacturerProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </ManufacturerProvider>
    </SafeAreaProvider>
  );
}
