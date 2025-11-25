import { useCart } from "../context/CartContext.jsx";

function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
  } = useCart();

  const handleQuantityChange = (id, val) => {
    const qty = parseInt(val || "0", 10);
    updateQuantity(id, qty);
  };

  return (
    <div className="container">
      <h1 className="mb-4">Mon panier</h1>

      {!items.length ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          <div className="table-responsive mb-3">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Ouvrage</th>
                  <th className="text-center">Prix</th>
                  <th className="text-center">Quantité</th>
                  <th className="text-end">Sous-total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const prix = parseFloat(item.prix || 0);
                  const subtotal = prix * item.quantity;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.titre}
                              style={{
                                width: "50px",
                                height: "70px",
                                objectFit: "cover",
                                marginRight: "0.75rem",
                              }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">{item.titre}</div>
                            <div className="text-muted small">
                              {item.auteur}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        {prix.toFixed(2)} $
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          min={1}
                          className="form-control d-inline-block"
                          style={{ width: "80px" }}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                        />
                      </td>
                      <td className="text-end">
                        {subtotal.toFixed(2)} $
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-secondary"
              onClick={clearCart}
            >
              Vider le panier
            </button>

            <div className="text-end">
              <div className="fs-5 fw-bold">
                Total : {cartTotal.toFixed(2)} $
              </div>
              <button className="btn btn-success mt-2" disabled>
                Passer la commande (à implémenter)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
