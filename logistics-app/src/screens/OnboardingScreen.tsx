import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useLogistics } from '../context/LogisticsContext';
import { colors, spacing, typography } from '../theme/tokens';

export function OnboardingScreen() {
  const { completeOnboarding } = useLogistics();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [corridors, setCorridors] = useState('');
  const [fleet, setFleet] = useState('');
  const [license, setLicense] = useState('');
  const [insurance, setInsurance] = useState('full');
  const [crossBorder, setCrossBorder] = useState('yes');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Logistics partner</Text>
      <Text style={styles.subtitle}>Licensed carriers on verified wholesale corridors.</Text>
      <View style={styles.form}>
        <TextField label="Company name" value={companyName} onChangeText={setCompanyName} />
        <TextField label="Contact name" value={contactName} onChangeText={setContactName} />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextField label="Corridors served" value={corridors} onChangeText={setCorridors} />
        <TextField label="Fleet description" value={fleet} onChangeText={setFleet} />
        <TextField label="Operating license" value={license} onChangeText={setLicense} />
      </View>
      <PrimaryButton
        label="Join partner network"
        onPress={() =>
          completeOnboarding({
            companyName,
            contactName,
            phone,
            email,
            corridors,
            fleet,
            license,
            insurance,
            crossBorder,
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
