import CartSlider from "./shared/cart-components/CartSlider";
import Header from "./shared/widgets/header";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <Header/>
      <CartSlider />
      <main>{children}</main>

    </section>
  );
}