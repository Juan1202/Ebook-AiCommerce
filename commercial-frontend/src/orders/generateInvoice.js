import jsPDF from 'jspdf'

export function generateInvoice(order) {
  const doc = new jsPDF()

  doc.setFontSize(22)

  doc.text('BookFlow', 20, 20)

  doc.setFontSize(14)

  doc.text(
    `Factura Pedido #${order.orderNumber}`,
    20,
    35
  )

  doc.text(
    `Fecha: ${order.date}`,
    20,
    45
  )

  doc.text(
    `Cliente: ${order.fullName}`,
    20,
    55
  )

  doc.text(
    `Ciudad: ${order.city}`,
    20,
    65
  )

  doc.text(
    `Dirección: ${order.address}`,
    20,
    75
  )

  doc.text(
    `Método pago: ${order.paymentMethod}`,
    20,
    85
  )

  doc.line(20, 95, 190, 95)

  let y = 110

  order.items.forEach((item) => {
    doc.text(
      `${item.title} x${item.quantity}`,
      20,
      y
    )

    doc.text(
      `${(
        item.unitPrice *
        item.quantity
      ).toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      })}`,
      150,
      y
    )

    y += 12
  })

  doc.line(20, y, 190, y)

  y += 15

  doc.setFontSize(16)

  doc.text(
    `Total: ${order.total}`,
    20,
    y
  )

  doc.save(
    `factura-${order.orderNumber}.pdf`
  )
}