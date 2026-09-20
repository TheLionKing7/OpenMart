import { StyleSheet, Text, View } from 'react-native';
import { Product } from '../data/products';
import { formatNgn } from '../utils/format';
import { colors, spacing, typography } from '../theme/tokens';
import { QuantityStepper } from './QuantityStepper';

type Props = {
  product: Product;
  quantity: number;
  onQuantityChange: (qty: number) => void;
};

export function SkuListRow({ product, quantity, onQuantityChange }: Props) {
  const outOfStock = product.stock === 0;

  return (
    <View style={[styles.row, outOfStock && styles.rowDisabled]}>
      <View style={styles.main}>
        <Text style={styles.name}>
          {product.name} ({product.unit})
        </Text>
        <Text style={styles.meta}>
          SKU: {product.sku} · Stock: {outOfStock ? 'Out of stock' : `${product.stock} available`}
        </Text>
        {product.manufacturerSubsidyNgn ? (
          <View style={styles.subsidyBadge}>
            <Text style={styles.subsidyText}>
              Sponsored by {product.manufacturerName} — {formatNgn(product.manufacturerSubsidyNgn)} off
            </Text>
          </View>
        ) : null}
        <Text
          style={[styles.price, product.priceShiftedRecently && styles.priceShifted]}
          accessibilityLabel={`Price ${formatNgn(product.priceNgn)} per unit${product.priceShiftedRecently ? ', updated recently' : ''}`}
        >
          {formatNgn(product.priceNgn)} / unit
          {product.priceShiftedRecently ? ' · Updated < 1 hr' : ''}
        </Text>
      </View>
      {!outOfStock ? (
        <QuantityStepper
          value={quantity}
          onChange={onQuantityChange}
          max={product.stock}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  main: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.label,
    color: colors.ink,
    fontSize: 16,
  },
  meta: {
    ...typography.caption,
    color: colors.muted,
  },
  price: {
    ...typography.label,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  priceShifted: {
    color: colors.warning,
  },
  subsidyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.subsidyBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
  subsidyText: {
    ...typography.caption,
    color: colors.subsidy,
    fontWeight: '600',
  },
});
