import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider, useCart } from "./CartContext";

function CartHarness() {
  const { addToCart, incrementQuantity, items, cartCount } = useCart();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          addToCart({ id: 7, titre: "Test", prix: 10, stock: 2 }, 1)
        }
      >
        add
      </button>
      <button type="button" onClick={() => incrementQuantity(7)}>
        increment
      </button>
      <span data-testid="qty">{items[0]?.quantity ?? 0}</span>
      <span data-testid="count">{cartCount}</span>
    </div>
  );
}

describe("CartContext", () => {
  it("caps quantity to available stock", () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("increment"));
    fireEvent.click(screen.getByText("increment"));

    expect(screen.getByTestId("qty")).toHaveTextContent("2");
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });
});
