import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useMerchant } from '../context/MerchantContext';
import { CatalogScreen } from '../screens/CatalogScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { DistributorSelectScreen } from '../screens/DistributorSelectScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { RecordSalesScreen } from '../screens/RecordSalesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettlementScreen } from '../screens/SettlementScreen';
import { OnboardingDistributorScreen } from '../screens/onboarding/OnboardingDistributorScreen';
import { OnboardingPhoneScreen } from '../screens/onboarding/OnboardingPhoneScreen';
import { OnboardingReadyScreen } from '../screens/onboarding/OnboardingReadyScreen';
import { OnboardingShopScreen } from '../screens/onboarding/OnboardingShopScreen';
import { OnboardingWelcomeScreen } from '../screens/onboarding/OnboardingWelcomeScreen';
import { colors } from '../theme/tokens';
import { MainStackParamList, OnboardingStackParamList } from './types';

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTitleStyle: { color: colors.ink, fontWeight: '600' as const },
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <OnboardingStack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <OnboardingStack.Screen name="OnboardingShop" component={OnboardingShopScreen} />
      <OnboardingStack.Screen name="OnboardingDistributor" component={OnboardingDistributorScreen} />
      <OnboardingStack.Screen name="OnboardingPhone" component={OnboardingPhoneScreen} />
      <OnboardingStack.Screen name="OnboardingReady" component={OnboardingReadyScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <MainStack.Screen name="Home" component={HomeScreen} options={{ title: 'OpenMarket' }} />
      <MainStack.Screen
        name="DistributorSelect"
        component={DistributorSelectScreen}
        options={{ title: 'Change distributor' }}
      />
      <MainStack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Restock' }} />
      <MainStack.Screen name="Cart" component={CartScreen} options={{ title: 'Your cart' }} />
      <MainStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <MainStack.Screen name="Settlement" component={SettlementScreen} options={{ title: 'Settlement' }} />
      <MainStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'Orders' }} />
      <MainStack.Screen name="RecordSales" component={RecordSalesScreen} options={{ title: 'Record sales' }} />
      <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { loading, onboardingComplete } = useMerchant();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {onboardingComplete ? <MainNavigator /> : <OnboardingNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
