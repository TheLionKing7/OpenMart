import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { OnboardingDraftProvider } from '../context/OnboardingDraftContext';
import { useDistributor } from '../context/DistributorContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FulfillmentQueueScreen } from '../screens/FulfillmentQueueScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { PayoutsScreen } from '../screens/PayoutsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OnboardingBusinessScreen } from '../screens/onboarding/OnboardingBusinessScreen';
import { OnboardingCoverageScreen } from '../screens/onboarding/OnboardingCoverageScreen';
import { OnboardingReadyScreen } from '../screens/onboarding/OnboardingReadyScreen';
import { OnboardingTermsScreen } from '../screens/onboarding/OnboardingTermsScreen';
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
    <OnboardingDraftProvider>
      <OnboardingStack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
        <OnboardingStack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
        <OnboardingStack.Screen
          name="OnboardingBusiness"
          component={OnboardingBusinessScreen}
          options={{ headerShown: true, title: 'Business' }}
        />
        <OnboardingStack.Screen
          name="OnboardingCoverage"
          component={OnboardingCoverageScreen}
          options={{ headerShown: true, title: 'Coverage' }}
        />
        <OnboardingStack.Screen
          name="OnboardingTerms"
          component={OnboardingTermsScreen}
          options={{ headerShown: true, title: 'Ordering' }}
        />
        <OnboardingStack.Screen
          name="OnboardingReady"
          component={OnboardingReadyScreen}
          options={{ headerShown: true, title: 'Review' }}
        />
      </OnboardingStack.Navigator>
    </OnboardingDraftProvider>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
      <MainStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Fulfillment' }} />
      <MainStack.Screen
        name="FulfillmentQueue"
        component={FulfillmentQueueScreen}
        options={{ title: 'Queue' }}
      />
      <MainStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
      <MainStack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <MainStack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add product' }} />
      <MainStack.Screen name="Payouts" component={PayoutsScreen} options={{ title: 'Payouts' }} />
      <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { loading, onboardingComplete } = useDistributor();

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
