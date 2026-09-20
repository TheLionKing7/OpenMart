import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAffiliate } from '../context/AffiliateContext';
import { CommissionsScreen } from '../screens/CommissionsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReferralsScreen } from '../screens/ReferralsScreen';
import { OnboardingProfileScreen } from '../screens/onboarding/OnboardingProfileScreen';
import { OnboardingReadyScreen } from '../screens/onboarding/OnboardingReadyScreen';
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
      <OnboardingStack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
      <OnboardingStack.Screen name="OnboardingReady" component={OnboardingReadyScreen} options={{ headerShown: true, title: 'Your code' }} />
    </OnboardingStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
      <MainStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Affiliate' }} />
      <MainStack.Screen name="Referrals" component={ReferralsScreen} options={{ title: 'Referrals' }} />
      <MainStack.Screen name="Commissions" component={CommissionsScreen} options={{ title: 'Commissions' }} />
      <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { loading, onboardingComplete } = useAffiliate();

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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
