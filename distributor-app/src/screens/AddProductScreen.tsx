import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useDistributor } from '../context/DistributorContext';
import { MainStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'AddProduct'>;

export function AddProductScreen({ navigation }: Props) {
  const { addCatalogItem } = useDistributor();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('');
  const [priceNgn, setPriceNgn] = useState('');
  const [quantity, setQuantity] = useState('');

  const canSave =
    name.trim().length >= 2 &&
    sku.trim().length >= 2 &&
    unit.trim().length >= 1 &&
    Number(priceNgn) > 0 &&
    Number(quantity) >= 0;

  const save = () => {
    const id = `item-${sku.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    addCatalogItem({
      id,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      unit: unit.trim(),
      priceNgn: Number(priceNgn),
      quantityOnHand: Number(quantity),
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add to VWL</Text>
        <Text style={styles.subtitle}>
          Record stock the platform can route to merchants. Smart routing uses SKU, quantity on
          hand, and your coverage areas.
        </Text>
        <View style={styles.form}>
          <TextField label="Product name" value={name} onChangeText={setName} placeholder="Dangote Sugar" />
          <TextField label="SKU" value={sku} onChangeText={setSku} placeholder="DG-SUG-50" autoCapitalize="characters" />
          <TextField label="Unit" value={unit} onChangeText={setUnit} placeholder="50kg Bag" />
          <TextField
            label="Wholesale price (₦)"
            value={priceNgn}
            onChangeText={setPriceNgn}
            placeholder="85000"
            keyboardType="numeric"
          />
          <TextField
            label="Quantity on hand"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="100"
            keyboardType="numeric"
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Save to ledger" disabled={!canSave} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, gap: spacing.md },
  title: { ...typography.title, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  form: { gap: spacing.lg, marginTop: spacing.sm },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
