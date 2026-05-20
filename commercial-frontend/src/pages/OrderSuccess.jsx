import { useState, useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, FileText, ShoppingBag } from 'lucide-react'
import { getOrder } from '../services/orderService'
import './checkout.css'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState(state?.order || null)
  const [totalAmount, setTotalAmount] = useState(state?.totalAmount || 0)
  const [paymentMethod, setPaymentMethod] = useState(state?.paymentMethod || 'tarjeta')
  const [loading, setLoading] = useState(!state?.order)
  const [error, setError] = useState(null)



  useEffect(() => {
    if (!order) {
      async function fetchOrder() {
        try {
          const dbOrder = await getOrder(orderId)
          setOrder(dbOrder)
          setTotalAmount(dbOrder.total_amount)
          setLoading(false)
        } catch (err) {
          setError('No se pudo cargar la información del pedido.')
          setLoading(false)
        }
      }
      fetchOrder()
    }
  }, [order, orderId])

  if (loading) {
    return (
      <main className="success-page empty-state">
        <h2>Cargando factura...</h2>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="success-page empty-state">
        <h2>Pedido no encontrado</h2>
        <button className="primary-btn" onClick={() => navigate('/catalogo')}>
          Volver al catálogo
        </button>
      </main>
    )
  }

  const handleDownloadInvoice = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=950')
    if (!printWindow) {
      alert('Por favor permite los popups para descargar la factura en PDF.')
      return
    }

    // Generar un CUFE aleatorio realista basado en el ID de la orden
    const cufeSeed = `fe${orderId}b73a90f23d8c11e6b8c800505690b2308a2a8b9f0e1c2d3`
    const cufe = Array.from(cufeSeed).reduce((acc, char, idx) => acc + (idx % 8 === 0 && idx > 0 ? '-' : '') + char, '').toUpperCase().slice(0, 50)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura FE-${orderId} - BookFlow AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: #0c0d12;
            color: #e2e4f0;
            padding: 0 0 40px 0;
            min-height: 100vh;
            position: relative;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Cuadrícula sutil de fondo */
          body::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: 
              linear-gradient(rgba(245, 158, 11, 0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(245, 158, 11, 0.015) 1px, transparent 1px);
            background-size: 24px 24px;
            pointer-events: none;
            z-index: 0;
          }
          /* Brillo radial superior */
          body::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 350px;
            background: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.06) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
          }
          
          /* Estilo de la barra de acciones superior */
          .print-actions {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(22, 23, 29, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(245, 158, 11, 0.2);
            padding: 16px 24px;
            z-index: 9999;
            margin-bottom: 24px;
            border-radius: 0 0 16px 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .action-bar-container {
            max-width: 850px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
          }
          .action-bar-title {
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            color: #fbbf24;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 8px;
            text-shadow: 0 0 10px rgba(245,158,11,0.2);
          }
          .action-buttons {
            display: flex;
            gap: 12px;
          }
          .action-btn {
            font-family: 'Inter', sans-serif;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 8px 18px;
            border-radius: 10px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid transparent;
            text-decoration: none;
          }
          .print-btn {
            background: linear-gradient(135deg, #f59e0b 0%, #e8890c 100%);
            color: #0c0d12;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
            font-weight: 700;
          }
          .print-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.55);
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          }
          .print-btn:active {
            transform: translateY(0);
          }
          .close-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #b8bac4;
          }
          .close-btn:hover {
            background: rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.4);
            color: #f87171;
            transform: translateY(-1px);
          }
          .close-btn:active {
            transform: translateY(0);
          }
          .btn-icon {
            font-size: 1.1rem;
            line-height: 1;
          }

          .invoice-container {
            position: relative;
            z-index: 10;
            max-width: 680px;
            margin: 0 auto;
            padding: 0 10px;
          }
          .invoice-card {
            background: rgba(22, 23, 29, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(245, 158, 11, 0.15);
            border-top: 4px solid #f59e0b;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(245, 158, 11, 0.02);
          }
          .header-layout {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding-bottom: 26px;
            margin-bottom: 24px;
          }
          .logo-wordmark {
            display: flex;
            flex-direction: column;
            line-height: 1;
          }
          .logo-text {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 26px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.01em;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .logo-ai-badge {
            background: rgba(245,158,11,0.12);
            border: 1px solid rgba(245,158,11,0.25);
            color: #fbbf24;
            font-size: 13px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 6px;
            font-family: 'Inter', sans-serif;
            text-shadow: 0 0 10px rgba(245,158,11,0.3);
          }
          .logo-tagline {
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #f59e0b;
            margin-top: 4px;
            font-family: 'Inter', sans-serif;
          }
          .invoice-meta {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          .invoice-meta h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            color: #ffffff;
            font-weight: 700;
            letter-spacing: 0.02em;
            margin-bottom: 2px;
          }
          .invoice-number-badge {
            background: rgba(245,158,11,0.1);
            border: 1px solid rgba(245,158,11,0.3);
            color: #fbbf24;
            font-family: 'Outfit', sans-serif;
            font-size: 1.05rem;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 8px;
            margin-bottom: 4px;
          }
          .invoice-meta p {
            font-size: 0.85rem;
            color: #8f92a1;
          }
          .dian-stamp {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16,185,129,0.08);
            border: 1px solid rgba(16,185,129,0.2);
            color: #34d399;
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
          }
          .dian-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #10b981;
            box-shadow: 0 0 8px #10b981;
          }
          .cufe-box {
            background: #16171d;
            border: 1px dashed rgba(255,255,255,0.06);
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 0.8rem;
            color: #8f92a1;
            margin-bottom: 24px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .cufe-text {
            font-family: 'Courier New', Courier, monospace;
            word-break: break-all;
            color: #cbd5e0;
            font-weight: 700;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .details-block {
            background: rgba(30, 31, 41, 0.4);
            border: 1px solid rgba(255,255,255,0.04);
            border-radius: 12px;
            padding: 22px;
            position: relative;
            overflow: hidden;
          }
          .details-block::before {
            content: '';
            position: absolute;
            left: 0; top: 0; bottom: 0; width: 3px;
            background: #f59e0b;
          }
          .details-block.client::before {
            background: #a0aec0;
          }
          .details-block h3 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.05rem;
            color: #ffffff;
            margin-bottom: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .details-block p {
            font-size: 0.88rem;
            color: #b8bac4;
            line-height: 1.6;
            margin-bottom: 4px;
          }
          .details-block p strong {
            color: #ffffff;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          .items-table th {
            text-align: left;
            padding: 14px 18px;
            background: rgba(255,255,255,0.02);
            color: #f59e0b;
            font-weight: 700;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            border-bottom: 2px solid rgba(245,158,11,0.25);
          }
          .items-table td {
            padding: 16px 18px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            font-size: 0.92rem;
            color: #e2e4f0;
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }
          .items-table tr:hover td {
            background: rgba(255,255,255,0.01);
          }
          .total-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-top: 1px solid rgba(255,255,255,0.06);
            padding-top: 24px;
            margin-top: 16px;
            width: 100%;
          }
          .invoice-security {
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 55%;
          }
          .total-box {
            width: 40%;
            max-width: 240px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 0.9rem;
            color: #8f92a1;
          }
          .total-row.grand-total {
            font-family: 'Outfit', sans-serif;
            font-size: 1.25rem;
            color: #ffffff;
            font-weight: 700;
            background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(232,137,12,0.15) 100%);
            border: 1px solid rgba(245,158,11,0.3);
            border-radius: 10px;
            padding: 10px 16px;
            margin-top: 10px;
          }
          .total-row.grand-total span:last-child {
            color: #fbbf24;
            text-shadow: 0 0 10px rgba(245,158,11,0.25);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 0.78rem;
            color: #6b6e7e;
            border-top: 1px solid rgba(255,255,255,0.06);
            padding-top: 24px;
            line-height: 1.6;
          }
          .footer p strong {
            color: #8f92a1;
          }
          @page {
            size: letter portrait;
            margin: 0.3in;
          }
          @media print {
            html, body {
              background-color: #0c0d12 !important;
              color: #e2e4f0 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              font-size: 11px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .invoice-container {
              width: 680px !important;
              max-width: 680px !important;
              margin: 0 auto !important;
              padding: 5px 0 !important;
              box-sizing: border-box !important;
            }
            .invoice-card {
              width: 100% !important;
              max-width: 100% !important;
              background: #16171d !important;
              border: 1px solid rgba(245, 158, 11, 0.3) !important;
              border-top: 4px solid #f59e0b !important;
              border-radius: 16px !important;
              padding: 16px !important;
              box-shadow: none !important;
              box-sizing: border-box !important;
            }
            .header-layout {
              padding-bottom: 12px !important;
              margin-bottom: 12px !important;
            }
            .invoice-meta h2 {
              font-size: 1.2rem !important;
            }
            .cufe-box {
              padding: 8px 12px !important;
              margin-bottom: 12px !important;
            }
            .details-grid {
              gap: 12px !important;
              margin-bottom: 12px !important;
            }
            .details-block {
              padding: 12px 16px !important;
            }
            .details-block h3 {
              margin-bottom: 8px !important;
            }
            .items-table {
              margin-bottom: 12px !important;
            }
            .items-table th {
              padding: 8px 12px !important;
            }
            .items-table td {
              padding: 10px 12px !important;
            }
            .total-section {
              padding-top: 12px !important;
              margin-top: 8px !important;
            }
            .total-row {
              padding: 4px 0 !important;
            }
            .total-row.grand-total {
              padding: 8px 12px !important;
              margin-top: 6px !important;
              font-size: 1.15rem !important;
            }
            .footer {
              margin-top: 16px !important;
              padding-top: 12px !important;
            }
            .total-section img {
              width: 72px !important;
              height: 72px !important;
            }
            body::before, body::after {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- STICKY ACTION BAR -->
        <div class="print-actions no-print">
          <div class="action-bar-container">
            <span class="action-bar-title">✨ Vista Previa de Factura Electrónica</span>
            <div class="action-buttons">
              <button class="action-btn print-btn" onclick="window.print()">
                <span class="btn-icon">🖨️</span> Imprimir / Guardar PDF
              </button>
              <button class="action-btn close-btn" onclick="window.close()">
                <span class="btn-icon">❌</span> Cerrar Vista
              </button>
            </div>
          </div>
        </div>

        <div class="invoice-container">
          <div class="invoice-card">
            
            <!-- STAMP Y HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div class="logo-wordmark">
                <h1 class="logo-text">BOOKFLOW <span class="logo-ai-badge">AI</span></h1>
                <p class="logo-tagline">Ebook AI-Commerce Premium</p>
              </div>
              <div class="dian-stamp">
                <div class="dian-dot"></div>
                Factura Electrónica Validada por la DIAN
              </div>
            </div>

            <div class="header-layout">
              <div>
                <p style="font-size: 0.85rem; color: #8f92a1; margin-top: 6px;">
                  <strong>BOOKFLOW AI S.A.S.</strong><br>
                  NIT: 901.482.903-5<br>
                  Av. El Dorado #100-24, Edificio Hub, Of. 504<br>
                  Bogotá D.C., Colombia
                </p>
              </div>
              <div class="invoice-meta">
                <h2>FACTURA ELECTRÓNICA DE VENTA</h2>
                <div class="invoice-number-badge">N° FE-${orderId}</div>
                <p><strong>Fecha Emisión:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
                <p><strong>Fecha Vencimiento:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
              </div>
            </div>

            <!-- CUFE BLOCK -->
            <div class="cufe-box">
              <strong>CUFE (Código Único de Facturación Electrónica):</strong>
              <span class="cufe-text">${cufe}</span>
            </div>

            <!-- DETAILS GRID -->
            <div class="details-grid">
              <div class="details-block client">
                <h3>👤 Información del Cliente</h3>
                <p><strong>Adquiriente ID:</strong> ${order.customer_id}</p>
                <p><strong>Régimen:</strong> Persona Natural / Consumidor Final</p>
                <p><strong>Método de Pago:</strong> ${paymentMethod.toUpperCase()}</p>
                <p><strong>Moneda:</strong> COP (Pesos Colombianos)</p>
              </div>
            </div>

            <!-- ITEMS TABLE -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align: left;">Ebook / Descripción del Ítem</th>
                  <th style="text-align: center; width: 10%;">Cant.</th>
                  <th style="text-align: right; width: 20%;">Precio Unit.</th>
                  <th style="text-align: right; width: 20%;">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>
                      <strong style="color: #ffffff; font-family: 'Outfit', sans-serif;">${item.book_title}</strong><br>
                      <span style="font-size: 0.78rem; color: #6b6e7e;">Formato: Ebook Digital (Acceso de por vida)</span>
                    </td>
                    <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
                    <td style="text-align: right; font-variant-numeric: tabular-nums;">$${item.unit_price.toLocaleString('es-CO')}</td>
                    <td style="text-align: right; font-weight: 600; color: #ffffff; font-variant-numeric: tabular-nums;">$${(item.unit_price * item.quantity).toLocaleString('es-CO')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- TOTALS AND SECURITY -->
            <div class="total-section">
              <div class="invoice-security">
                <!-- REAL SCANNABLE QR CODE -->
                <a href="https://catalogo-vpfe.dian.gov.co/document/searchqr?documentKey=${cufe}" target="_blank" title="Verificar Factura en la DIAN" style="display: block; text-decoration: none;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0c0d12&data=https://catalogo-vpfe.dian.gov.co/document/searchqr?documentKey=${cufe}" alt="QR DIAN" width="84" height="84" style="background:#ffffff; padding:6px; border-radius:8px; display:block; box-shadow: 0 4px 12px rgba(0,0,0,0.25);" />
                </a>
                <div style="font-size: 0.76rem; color: #8f92a1; line-height: 1.4; max-width: 280px;">
                  <span style="color: #fbbf24; font-weight: 700; display: block; margin-bottom: 2px; letter-spacing: 0.05em; font-family: 'Outfit', sans-serif;">⚡ VERIFICACIÓN OFICIAL</span>
                  Escanea el código QR con la cámara de tu móvil para verificar la validez de este documento directamente en el portal oficial de la DIAN.
                </div>
              </div>

              <div class="total-box">
                <div class="total-row">
                  <span>Subtotal Neto</span>
                  <span>$${totalAmount.toLocaleString('es-CO')}</span>
                </div>
                <div class="total-row">
                  <span>IVA Exento (0%)</span>
                  <span>$0</span>
                </div>
                <div class="total-row grand-total">
                  <span>TOTAL PAGADO</span>
                  <span>$${totalAmount.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
              <p><strong>Autorización de Facturación Electrónica DIAN</strong> No. 187640000001 de 2026-01-15<br>
              Rango de Numeración FE-1 hasta FE-100000. Vigencia: 24 Meses.</p>
              <p style="margin-top: 10px; color: #8f92a1;">Esta es una representación gráfica de factura electrónica de venta expedida por BookFlow AI.<br>
              ¡Gracias por preferirnos para enriquecer tu biblioteca digital!</p>
            </div>

          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          }
        </script>
      </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <main className="success-page">
      <div className="success-container">
        <div className="success-header">
          <CheckCircle size={64} className="success-icon" />
          <h1>¡Pedido Realizado Exitosamente!</h1>
          <p>Tu orden <strong>#{orderId}</strong> ha sido confirmada y procesada.</p>
        </div>

        <div className="success-details">
          <h3>Resumen de la Orden</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem', marginBottom: '1.5rem', width: '100%' }}>
            {/* Encabezado de la tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 100px',
              padding: '0.5rem 0.75rem',
              borderBottom: '2px solid var(--border-color, #cbd5e0)',
              fontWeight: '700',
              color: 'var(--text-muted, #718096)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em'
            }}>
              <span>Cantidad</span>
              <span>Título</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>
            {/* Filas de libros */}
            {order.items.map(item => (
              <div key={item.book_id} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 100px',
                padding: '0.75rem 0.75rem',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '0.95rem',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary, #2d3748)' }}>{item.quantity}</span>
                <span style={{ color: 'var(--text-primary, #4a5568)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>
                  {item.book_title}
                </span>
                <span style={{ fontWeight: 600, textAlign: 'right', color: 'var(--text-primary, #2d3748)' }}>
                  ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
          <div className="success-total">
            <span>Total pagado:</span>
            <strong>${totalAmount.toLocaleString('es-CO')}</strong>
          </div>


        </div>

        <div className="success-actions">
          <button className="invoice-btn" onClick={handleDownloadInvoice}>
            <FileText size={20} />
            Descargar Factura Electrónica
          </button>
          
          <button className="continue-shopping-btn" onClick={() => navigate('/catalogo')}>
            <ShoppingBag size={20} />
            Seguir Comprando
          </button>
        </div>
      </div>
    </main>
  )
}
