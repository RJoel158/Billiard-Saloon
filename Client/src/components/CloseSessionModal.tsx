import { useState } from 'react';
import { Button, Input, Modal } from '../components/ui';
import type { Session } from '../types';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import './CloseSessionModal.css';

interface CloseSessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tableCode: string;
}

export function CloseSessionModal({ session, isOpen, onClose, onSuccess, tableCode }: CloseSessionModalProps) {
  const [penalties, setPenalties] = useState<Array<{ amount: string; reason: string }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<number>(1); // 1=cash
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [closing, setClosing] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<any>(null);
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [newPenalty, setNewPenalty] = useState({ amount: '', reason: '' });

  const handleAddPenalty = () => {
    if (newPenalty.amount && newPenalty.reason) {
      setPenalties([...penalties, { ...newPenalty }]);
      setNewPenalty({ amount: '', reason: '' });
      setShowPenaltyForm(false);
    }
  };

  const handleRemovePenalty = (index: number) => {
    setPenalties(penalties.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;

    if (!receiptFile) {
      alert('Debe adjuntar el comprobante de pago');
      return;
    }

    try {
      setClosing(true);

      // Close the session first
      const closeResponse = await api.post(`/sessions/${session.id}/close`, {
        end_time: new Date().toISOString(),
      });

      setPricingInfo(closeResponse.data);

      // Add penalties if any
      if (penalties.length > 0) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        for (const penalty of penalties) {
          await api.post('/penalties', {
            session_id: session.id,
            amount: parseFloat(penalty.amount),
            reason: penalty.reason,
            applied_by: currentUser.id,
          });
        }
      }

      // Calculate total with penalties
      const totalPenalties = penalties.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const finalAmount = closeResponse.data.finalCost + totalPenalties;

      // Upload receipt and create payment
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('session_id', session.id.toString());
      formData.append('amount', finalAmount.toString());
      formData.append('method', paymentMethod.toString());

      // For now, we'll store the base64 image in the payment record
      // In production, you should upload to a file server/cloud storage
      await api.post('/payments', {
        session_id: session.id,
        amount: finalAmount,
        method: paymentMethod,
        receipt_image: receiptPreview,
      });

      alert(`Sesión cerrada exitosamente.\nTotal: ${formatCurrency(finalAmount)}`);
      onSuccess();
      handleReset();
    } catch (error: any) {
      console.error('Error closing session:', error);
      alert(error.response?.data?.message || 'Error al cerrar la sesión');
    } finally {
      setClosing(false);
    }
  };

  const handleReset = () => {
    setPenalties([]);
    setPaymentMethod(1);
    setReceiptFile(null);
    setReceiptPreview('');
    setPricingInfo(null);
    setShowPenaltyForm(false);
    setNewPenalty({ amount: '', reason: '' });
    onClose();
  };

  if (!session) return null;

  const totalPenalties = penalties.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title={`Cerrar Sesión - ${tableCode}`}>
      <div className="close-session-modal">
        <div className="session-summary">
          <div className="summary-item">
            <span className="label">Hora de Inicio:</span>
            <span className="value">{new Date(session.start_time).toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="label">Hora de Cierre:</span>
            <span className="value">{new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className="penalties-section">
          <div className="section-header">
            <h4>Multas y Cargos Adicionales</h4>
            <Button size="sm" onClick={() => setShowPenaltyForm(!showPenaltyForm)}>
              {showPenaltyForm ? 'Cancelar' : '+ Agregar Multa'}
            </Button>
          </div>

          {showPenaltyForm && (
            <div className="penalty-form">
              <Input
                type="number"
                label="Monto (Bs)"
                value={newPenalty.amount}
                onChange={(e) => setNewPenalty({ ...newPenalty, amount: e.target.value })}
                placeholder="0.00"
              />
              <Input
                label="Motivo"
                value={newPenalty.reason}
                onChange={(e) => setNewPenalty({ ...newPenalty, reason: e.target.value })}
                placeholder="Ej: Daño en taco, bola perdida, etc."
              />
              <Button size="sm" onClick={handleAddPenalty}>Agregar</Button>
            </div>
          )}

          {penalties.length > 0 && (
            <div className="penalties-list">
              {penalties.map((penalty, index) => (
                <div key={index} className="penalty-item">
                  <div className="penalty-info">
                    <span className="penalty-reason">{penalty.reason}</span>
                    <span className="penalty-amount">{formatCurrency(parseFloat(penalty.amount))}</span>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemovePenalty(index)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="payment-section">
          <h4>Método de Pago</h4>
          <div className="payment-methods">
            <label className={`method-option ${paymentMethod === 1 ? 'selected' : ''}`}>
              <input
                type="radio"
                name="method"
                value="1"
                checked={paymentMethod === 1}
                onChange={() => setPaymentMethod(1)}
              />
              <span>Efectivo</span>
            </label>
            <label className={`method-option ${paymentMethod === 2 ? 'selected' : ''}`}>
              <input
                type="radio"
                name="method"
                value="2"
                checked={paymentMethod === 2}
                onChange={() => setPaymentMethod(2)}
              />
              <span>Tarjeta</span>
            </label>
            <label className={`method-option ${paymentMethod === 3 ? 'selected' : ''}`}>
              <input
                type="radio"
                name="method"
                value="3"
                checked={paymentMethod === 3}
                onChange={() => setPaymentMethod(3)}
              />
              <span>QR</span>
            </label>
          </div>
        </div>

        <div className="receipt-section">
          <h4>Comprobante de Pago *</h4>
          <div className="file-upload">
            <input
              type="file"
              id="receipt-upload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="receipt-upload" className="upload-label">
              {receiptPreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
            </label>
            {receiptPreview && (
              <div className="image-preview">
                <img src={receiptPreview} alt="Comprobante" />
              </div>
            )}
          </div>
        </div>

        {pricingInfo && (
          <div className="pricing-summary">
            <div className="price-item">
              <span>Subtotal Sesión:</span>
              <span>{formatCurrency(pricingInfo.pricing.finalPrice)}</span>
            </div>
            <div className="price-item">
              <span>Multas:</span>
              <span>{formatCurrency(totalPenalties)}</span>
            </div>
            <div className="price-item total">
              <span>Total a Pagar:</span>
              <span>{formatCurrency(pricingInfo.pricing.finalPrice + totalPenalties)}</span>
            </div>
          </div>
        )}

        <div className="total-preview">
          <div className="total-label">Total Estimado:</div>
          <div className="total-value">{formatCurrency(totalPenalties)}</div>
          <div className="total-note">+ Costo de sesión (se calculará al cerrar)</div>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={handleReset} disabled={closing}>
            Cancelar
          </Button>
          <Button onClick={handleCloseSession} disabled={closing || !receiptFile}>
            {closing ? 'Procesando...' : 'Cerrar Sesión'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
