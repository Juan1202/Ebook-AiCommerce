import { getOrders } from './orders.storage'

export default function OrdersPage() {
  const orders = getOrders()

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        Mis pedidos
      </h1>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          No tienes pedidos todavía
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={styles.card}
            >
              <div style={styles.header}>
                <div>
                  <h2 style={styles.orderNumber}>
                    Pedido #{order.orderNumber}
                  </h2>

                  <p style={styles.date}>
                    {order.date}
                  </p>
                </div>

                <span style={styles.status}>
                  {order.status}
                </span>
              </div>

              <div style={styles.info}>
                <p>
                  <strong>Cliente:</strong>{' '}
                  {order.fullName}
                </p>

                <p>
                  <strong>Ciudad:</strong>{' '}
                  {order.city}
                </p>

                <p>
                  <strong>Dirección:</strong>{' '}
                  {order.address}
                </p>

                <p>
                  <strong>Pago:</strong>{' '}
                  {order.paymentMethod}
                </p>
              </div>

              <div style={styles.products}>
                {order.items.map((item) => (
                  <div
                    key={item.bookId}
                    style={styles.product}
                  >
                    <span>
                      {item.title} x{item.quantity}
                    </span>

                    <strong>
                      {(item.unitPrice *
                        item.quantity
                      ).toLocaleString(
                        'es-CO',
                        {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        }
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={styles.total}>
                {order.total}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    padding: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
  },

  title: {
    fontSize: '36px',
    marginBottom: '30px',
  },

  empty: {
    padding: '40px',
    background: '#fff',
    borderRadius: '20px',
    textAlign: 'center',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    boxShadow:
      '0 4px 12px rgba(0,0,0,0.08)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },

  orderNumber: {
    margin: 0,
  },

  date: {
    color: '#6B7280',
    marginTop: '6px',
  },

  status: {
    background: '#FEF3C7',
    color: '#92400E',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: 'bold',
    height: 'fit-content',
  },

  info: {
    display: 'grid',
    gap: '8px',
    marginBottom: '24px',
  },

  products: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },

  product: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '10px',
  },

  total: {
    textAlign: 'right',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#7C3AED',
  },
}