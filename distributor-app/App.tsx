import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DistributorProvider } from './src/context/DistributorContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DistributorProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </DistributorProvider>
    </SafeAreaProvider>
  );
}
