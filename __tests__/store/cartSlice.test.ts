/**
 * __tests__/store/cartSlice.test.ts
 *
 * Unit tests for the cartSlice Redux module.
 *
 * Covers:
 *  - addItem (first add)
 *  - addItem duplicate → quantity accumulation (not duplication)
 *  - removeItem → removes correct item, leaves others intact
 *  - clearCart → resets items, totals, customer, paymentMethod
 *  - selectCartTotal selector → subtotal + NBT (2%) + VAT (18% on subtotal+NBT)
 *
 * Tax formula used:
 *   NBT   = subtotal × 0.02
 *   VAT   = (subtotal + NBT) × 0.18
 *   Total = subtotal + NBT + VAT
 *
 * Example for subtotal = 1000:
 *   NBT   = 20.00
 *   VAT   = 1020 × 0.18 = 183.60
 *   Total = 1000 + 20 + 183.60 = 1203.60
 */

import cartReducer, {
  addItem,
  removeItem,
  clearCart,
  selectSubtotal,
  selectNbt,
  selectVat,
  selectCartTotal,
  CartState,
} from '../../src/store/slices/cartSlice';

// ─── Mock product fixtures ────────────────────────────────────────────────────

const PVC_PIPE = {
  id: 'prod-pvc-001',
  name: 'PVC Pipe 12mm',
  price: 947,
};

const PAINT_ROLLER = {
  id: 'prod-paint-002',
  name: 'Paint Roller 9 inch',
  price: 450,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Empty cart state for use as initial state in tests. */
const EMPTY: CartState = {
  items: [],
  total: 0,
  customerId: null,
  paymentMethod: 'CASH',
};

/** Wrap a CartState so selectors can read `state.cart.*` */
const asRoot = (cartState: CartState) => ({ cart: cartState });

// ─── addItem ──────────────────────────────────────────────────────────────────

describe('addItem', () => {
  it('adds a new product to an empty cart with quantity 1', () => {
    const state = cartReducer(EMPTY, addItem(PVC_PIPE));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(PVC_PIPE.id);
    expect(state.items[0].name).toBe(PVC_PIPE.name);
    expect(state.items[0].quantity).toBe(1);
    expect(state.items[0].price).toBe(PVC_PIPE.price);
  });

  it('accumulates quantity (does NOT duplicate row) when the same product is added twice', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PVC_PIPE));

    expect(state.items).toHaveLength(1);            // still one row
    expect(state.items[0].quantity).toBe(2);        // quantity incremented
    expect(state.items[0].price).toBe(PVC_PIPE.price);
  });

  it('accumulates correctly when scanned 3 times', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PVC_PIPE));

    expect(state.items[0].quantity).toBe(3);
  });

  it('adds separate rows for different products', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PAINT_ROLLER));

    expect(state.items).toHaveLength(2);
    expect(state.items.find(i => i.id === PVC_PIPE.id)?.quantity).toBe(1);
    expect(state.items.find(i => i.id === PAINT_ROLLER.id)?.quantity).toBe(1);
  });

  it('updates the total field when adding items', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PAINT_ROLLER));

    const expectedSubtotal = PVC_PIPE.price + PAINT_ROLLER.price;
    expect(state.total).toBe(expectedSubtotal);
  });
});

// ─── removeItem ───────────────────────────────────────────────────────────────

describe('removeItem', () => {
  it('removes the specified product from the cart', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, removeItem(PVC_PIPE.id));

    expect(state.items).toHaveLength(0);
    expect(state.total).toBe(0);
  });

  it('leaves other items intact when one is removed', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PAINT_ROLLER));
    state     = cartReducer(state, removeItem(PVC_PIPE.id));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(PAINT_ROLLER.id);
    expect(state.total).toBe(PAINT_ROLLER.price);
  });

  it('is a no-op for a product id that is not in the cart', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, removeItem('non-existent-id'));

    expect(state.items).toHaveLength(1);
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────

describe('clearCart', () => {
  it('empties the items array', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PAINT_ROLLER));
    state     = cartReducer(state, clearCart());

    expect(state.items).toHaveLength(0);
  });

  it('resets total to 0', () => {
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, clearCart());

    expect(state.total).toBe(0);
  });

  it('resets customerId to null', () => {
    let state: CartState = { ...EMPTY, customerId: 'cust-abc-001' };
    state = cartReducer(state, clearCart());

    expect(state.customerId).toBeNull();
  });

  it('resets paymentMethod to CASH', () => {
    let state: CartState = { ...EMPTY, paymentMethod: 'CARD' };
    state = cartReducer(state, clearCart());

    expect(state.paymentMethod).toBe('CASH');
  });
});

// ─── selectCartTotal (Tax Engine) ─────────────────────────────────────────────

describe('selectCartTotal — Tax calculation', () => {
  /**
   * Tax formula:
   *   NBT   = subtotal × 0.02
   *   VAT   = (subtotal + NBT) × 0.18
   *   Total = subtotal + NBT + VAT
   */

  it('returns 0 for an empty cart', () => {
    const root = asRoot(EMPTY);

    expect(selectSubtotal(root)).toBe(0);
    expect(selectNbt(root)).toBe(0);
    expect(selectVat(root)).toBe(0);
    expect(selectCartTotal(root)).toBe(0);
  });

  it('calculates correct NBT (2%) for a Rs. 1000 subtotal', () => {
    // Build state with one product worth Rs. 1000
    const stateWith1000 = cartReducer(EMPTY, addItem({ id: 'prod-x', name: 'Test Product', price: 1000 }));
    const root          = asRoot(stateWith1000);

    expect(selectSubtotal(root)).toBe(1000);
    expect(selectNbt(root)).toBe(20);          // 1000 × 0.02 = 20.00
  });

  it('calculates correct VAT (18% on subtotal + NBT) for a Rs. 1000 subtotal', () => {
    const stateWith1000 = cartReducer(EMPTY, addItem({ id: 'prod-x', name: 'Test Product', price: 1000 }));
    const root          = asRoot(stateWith1000);

    // VAT = (1000 + 20) × 0.18 = 1020 × 0.18 = 183.60
    expect(selectVat(root)).toBeCloseTo(183.60, 2);
  });

  it('calculates the correct grand total (subtotal + NBT + VAT) for a Rs. 1000 subtotal', () => {
    const stateWith1000 = cartReducer(EMPTY, addItem({ id: 'prod-x', name: 'Test Product', price: 1000 }));
    const root          = asRoot(stateWith1000);

    // Total = 1000 + 20 + 183.60 = 1203.60
    expect(selectCartTotal(root)).toBeCloseTo(1203.60, 2);
  });

  it('calculates total correctly for a multi-item, multi-quantity cart', () => {
    // PVC_PIPE = Rs. 947 × 2 = Rs. 1894
    // PAINT_ROLLER = Rs. 450 × 1 = Rs. 450
    // Subtotal = 1894 + 450 = Rs. 2344
    let state = cartReducer(EMPTY, addItem(PVC_PIPE));
    state     = cartReducer(state, addItem(PVC_PIPE));          // qty 2
    state     = cartReducer(state, addItem(PAINT_ROLLER));      // qty 1

    const root      = asRoot(state);
    const subtotal  = 2344;                                     // expected subtotal
    const nbt       = subtotal * 0.02;                         // 46.88
    const vat       = (subtotal + nbt) * 0.18;                 // 2390.88 × 0.18 = 430.36
    const total     = subtotal + nbt + vat;

    expect(selectSubtotal(root)).toBe(subtotal);
    expect(selectNbt(root)).toBeCloseTo(nbt, 2);
    expect(selectVat(root)).toBeCloseTo(vat, 2);
    expect(selectCartTotal(root)).toBeCloseTo(total, 2);
  });
});
