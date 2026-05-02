import React from 'react';

export default function PricingBreakdown({
  nights,
  basePrice,
  discountAmount,
  totalPrice,
  promotionCode,
}) {
  return (
    <div className="pricing-breakdown">
      <div className="pricing-title">Pricing Details</div>
      <div className="pricing-row">
        <span className="label">{nights} night{nights !== 1 ? 's' : ''}</span>
        <span className="value">${basePrice.toFixed(2)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="pricing-row discount">
          <span className="label">
            Discount {promotionCode && `(${promotionCode})`}
          </span>
          <span className="value">-${discountAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="pricing-row total">
        <span className="label">Total</span>
        <span className="value">${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
