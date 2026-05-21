import { generateInvoice } from '../orders/generateInvoice'

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderData,
}) {
  if (!isOpen || !orderData) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.icon}>
          ✓
        </div>

        <h2 style={styles.title}>
          ¡Compra realizada!
        </h2>

        <p style={styles.subtitle}>
          Tu pedido fue confirmado exitosamente
        </p>

        <div style={styles.section}>
          <div style={styles.row}>
            <span>Número pedido</span>

            <strong>
              #{orderData.orderNumber}
            </strong>
          </div>

          <div style={styles.row}>
            <span>Cliente</span>

            <strong>
              {orderData.fullName}
            </strong>
          </div>

          <div style={styles.row}>
            <span>Ciudad</span>

            <strong>
              {orderData.city}
            </strong>
          </div>

          <div style={styles.row}>
            <span>Dirección</span>

            <strong>
              {orderData.address}
            </strong>
          </div>

          <div style={styles.row}>
            <span>Pago</span>

            <strong>
              {orderData.paymentMethod}
            </strong>
          </div>
        </div>

        <div style={styles.products}>
          {orderData.items.map((item) => (
            <div
              key={item.bookId}
              style={styles.product}
            >
              <span>
                {item.title} x{item.quantity}
              </span>

              <strong>
                {(item.unitPrice *
                  item.quantity).toLocaleString(
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
          Total pagado:
          {' '}
          {orderData.total}
        </div>

        <div style={styles.actions}>
          <button
            style={styles.pdfButton}
            onClick={() =>
              generateInvoice(orderData)
            }
          >
            Descargar factura PDF
          </button>

          <button
            style={styles.button}
            onClick={onClose}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '20px',
  },

  modal: {
    width: '100%',
    maxWidth: '600px',
    background: '#fff',
    borderRadius: '24px',
    padding: '32px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },

  icon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#DCFCE7',
    color: '#16A34A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '42px',
    margin: '0 auto 20px',
    fontWeight: 'bold',
  },

  title: {
    textAlign: 'center',
    marginBottom: '8px',
    fontSize: '30px',
  },

  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: '28px',
    fontSize: '15px',
  },

  section: {
    background: '#F9FAFB',
    padding: '18px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },

  products: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
  },

  product: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '10px',
    gap: '20px',
  },

  total: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: '24px',
    color: '#7C3AED',
  },

  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  pdfButton: {
    width: '100%',
    padding: '16px',
    border: '2px solid #7C3AED',
    borderRadius: '12px',
    background: '#fff',
    color: '#7C3AED',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
  },

  button: {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    background: '#7C3AED',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
  },
}