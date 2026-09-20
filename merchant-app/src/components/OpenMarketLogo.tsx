import { Image, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  variant?: 'full' | 'icon';
  style?: ViewStyle;
};

export function OpenMarketLogo({ variant = 'full', style }: Props) {
  const isFull = variant === 'full';
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={require('../../assets/logo.png')}
        style={isFull ? styles.full : styles.icon}
        resizeMode="contain"
        accessibilityLabel="OpenMarket logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start' },
  full: { width: 240, height: 64 },
  icon: { width: 56, height: 56 },
});
