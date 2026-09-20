import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AffiliateProvider } from './src/context/AffiliateContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AffiliateProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </AffiliateProvider>
    </SafeAreaProvider>
  );
}
