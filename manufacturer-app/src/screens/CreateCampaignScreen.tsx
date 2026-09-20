import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useManufacturer } from '../context/ManufacturerContext';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateCampaign'>;

export function CreateCampaignScreen({ navigation }: Props) {
  const { profile, launchCampaign } = useManufacturer();
  const [title, setTitle] = useState('');
  const [marketCluster, setMarketCluster] = useState('');
  const [category, setCategory] = useState(profile?.category ?? '');
  const [discountNgn, setDiscountNgn] = useState('500');
  const [skuPattern, setSkuPattern] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>SmartSubsidy campaign</Text>
      <Text style={styles.subtitle}>48-hour trade promotion routed to merchants in the target cluster.</Text>

      <TextField label="Campaign title" value={title} onChangeText={setTitle} />
      <TextField label="Market cluster" value={marketCluster} onChangeText={setMarketCluster} placeholder="e.g. Lagos Island" />
      <TextField label="Category" value={category} onChangeText={setCategory} />
      <TextField
        label="Discount per unit (₦)"
        value={discountNgn}
        onChangeText={setDiscountNgn}
        keyboardType="numeric"
      />
      <TextField label="SKU pattern (optional)" value={skuPattern} onChangeText={setSkuPattern} placeholder="e.g. DG-" />

      <PrimaryButton
        label="Launch campaign"
        onPress={async () => {
          await launchCampaign({
            title,
            marketCluster,
            category,
            discountNgn: Number(discountNgn) || 0,
            skuPattern,
          });
          navigation.goBack();
        }}
      />
      <PrimaryButton label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
});
