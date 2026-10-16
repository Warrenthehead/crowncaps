import CartView from '@/components/cart/CartView';

export const metadata = {
  title: 'Votre panier',
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-shop py-10 md:py-14">
      <CartView />
    </div>
  );
}
