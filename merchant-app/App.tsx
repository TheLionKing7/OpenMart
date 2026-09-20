import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { MerchantProvider } from './src/context/MerchantContext';
import { PlatformProvider } from './src/context/PlatformContext';
import { SyncProvider } from './src/context/SyncContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PlatformProvider>
        <MerchantProvider>
          <SyncProvider>
            <CartProvider>
              <AppNavigator />
              <StatusBar style="dark" />
            </CartProvider>
          </SyncProvider>
        </MerchantProvider>
      </PlatformProvider>
    </SafeAreaProvider>
  );
}
