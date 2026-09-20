import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogisticsProvider } from './src/context/LogisticsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LogisticsProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </LogisticsProvider>
    </SafeAreaProvider>
  );
}
