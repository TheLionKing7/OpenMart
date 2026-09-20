import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useManufacturer } from '../context/ManufacturerContext';
import { colors, spacing, typography } from '../theme/tokens';

export function OnboardingScreen() {
  const { completeOnboarding } = useManufacturer();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [interest, setInterest] = useState('all');
  const [targetMarkets, setTargetMarkets] = useState('');
  const [companySize, setCompanySize] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Manufacturer portal</Text>
      <Text style={styles.subtitle}>Demand telemetry and SmartSubsidy campaigns on verified trade lanes.</Text>
      <View style={styles.form}>
        <TextField label="Company name" value={companyName} onChangeText={setCompanyName} />
        <TextField label="Contact name" value={contactName} onChangeText={setContactName} />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextField label="Country" value={country} onChangeText={setCountry} />
        <TextField label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Beverages" />
        <TextField label="Target markets" value={targetMarkets} onChangeText={setTargetMarkets} />
        <TextField label="Company size" value={companySize} onChangeText={setCompanySize} placeholder="e.g. 50–200 staff" />
      </View>
      <PrimaryButton
        label="Join manufacturer network"
        onPress={() =>
          completeOnboarding({
            companyName,
            contactName,
            phone,
            email,
            country,
            category,
            interest,
            targetMarkets,
            companySize,
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, backgroundColor: colors.bg, flexGrow: 1 },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  form: { gap: spacing.md },
});
