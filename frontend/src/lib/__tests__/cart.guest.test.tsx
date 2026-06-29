import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart, type ProductInfo } from '../cart'
import { AuthProvider } from '../auth'

// In guest mode (no token) CartProvider never calls the API, but the module
// must still resolve — stub it to prevent axios initialisation side-effects.
vi.mock('../api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
  },
}))

const P1: ProductInfo & { productId: string } = {
  productId: 'prod-1', name: 'Widget', price: 1000, imageUrl: 'w.jpg',
}
const P2: ProductInfo & { productId: string } = {
  productId: 'prod-2', name: 'Gadget', price: 2500, imageUrl: 'g.jpg',
}

function CartSpy() {
  const { items, orderTotal, itemCount, addItem, removeItem, updateItem } = useCart()
  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="total">{orderTotal}</span>
      <span data-testid="items">{JSON.stringify(items)}</span>
      <button onClick={() => addItem(P1.productId, 1, P1)}>add-p1</button>
      <button onClick={() => addItem(P1.productId, 2, P1)}>add-p1-more</button>
      <button onClick={() => addItem(P2.productId, 1, P2)}>add-p2</button>
      <button onClick={() => removeItem(P1.productId)}>remove-p1</button>
      <button onClick={() => updateItem(P1.productId, 5)}>update-p1-qty5</button>
      <button onClick={() => updateItem(P1.productId, 0)}>update-p1-qty0</button>
    </div>
  )
}

// Renders without a logged-in user → guest mode, all operations hit localStorage only
function Wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider><CartProvider>{children}</CartProvider></AuthProvider>
}

function getItems() {
  return JSON.parse(screen.getByTestId('items').textContent!) as typeof items
}

// Silence the `items` type — just use any for test assertions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type items = any[]

describe('Guest cart (no auth token)', () => {
  beforeEach(() => localStorage.clear())

  it('addItem creates a new item with the correct lineTotal', async () => {
    const user = userEvent.setup()
    render(<Wrapper><CartSpy /></Wrapper>)

    await user.click(screen.getByText('add-p1'))

    const items = getItems()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ productId: 'prod-1', quantity: 1, lineTotal: 1000 })
  })

  it('addItem with an existing product increments quantity and recalculates lineTotal', async () => {
    const user = userEvent.setup()
    render(<Wrapper><CartSpy /></Wrapper>)

    await user.click(screen.getByText('add-p1'))      // qty 1 → lineTotal 1000
    await user.click(screen.getByText('add-p1-more')) // qty +2 → qty 3, lineTotal 3000

    const items = getItems()
    expect(items[0].quantity).toBe(3)
    expect(items[0].lineTotal).toBe(3000)
  })

  it('orderTotal is the sum of all lineTotals', async () => {
    const user = userEvent.setup()
    render(<Wrapper><CartSpy /></Wrapper>)

    await user.click(screen.getByText('add-p1')) // 1000
    await user.click(screen.getByText('add-p2')) // 2500

    expect(screen.getByTestId('total').textContent).toBe('3500')
  })

  it('itemCount is the sum of all item quantities', async () => {
    const user = userEvent.setup()
    render(<Wrapper><CartSpy /></Wrapper>)

    await user.click(screen.getByText('add-p1'))      // qty 1
    await user.click(screen.getByText('add-p1-more')) // qty 3
    await user.click(screen.getByText('add-p2'))      // qty 1 → total 4

    expect(screen.getByTestId('count').textContent).toBe('4')
  })

  it('removeItem removes the correct product and updates orderTotal', async () => {
    const user = userEvent.setup()
    render(<Wrapper><CartSpy /></Wrapper>)

    await user.click(screen.getByText('add-p1'))
    await user.click(screen.getByText('add-p2'))
    await user.click(screen.getByText('remove-p1'))

    const items = getItems()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('prod-2')
    expect(screen.getByTestId('total').textContent).toBe('2500')
  })

  it('updateItem changes quantity and recalculates lineTotal', async () => {
    const user = userEvent.setup()
    render(<Wrapper><CartSpy /></Wrapper>)

    await user.click(screen.getByText('add-p1'))
    await user.click(screen.getByText('update-p1-qty5'))

    const items = getItems()
    expect(items[0].quantity).toBe(5)
    expect(items[0].lineTotal).toBe(5000)
  })

  it('updateItem with quantity 0 removes the item', async () => {
    const user = userEvent.setup()
    render(<Wrapper><CartSpy /></Wrapper>)

    await user.click(screen.getByText('add-p1'))
    await user.click(screen.getByText('update-p1-qty0'))

    expect(getItems()).toHaveLength(0)
    expect(screen.getByTestId('total').textContent).toBe('0')
  })
})
