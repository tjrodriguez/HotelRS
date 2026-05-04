import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../services/apiClient';

const PAYMENT_METHODS = [
  {
    value: 'gcash',
    label: 'GCash',
    helper: 'Mobile wallet transfer',
    details: 'Use GCash to send the amount and keep the reference number for confirmation.',
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    helper: 'Direct bank deposit',
    details: 'Transfer from your bank app or over-the-counter and add the receipt reference below.',
  },
  {
    value: 'maya',
    label: 'Maya',
    helper: 'Digital wallet transfer',
    details: 'Top up through Maya and note the transaction number.',
  },
  {
    value: 'cash_deposit',
    label: 'Cash Deposit',
    helper: 'Over-the-counter deposit',
    details: 'Deposit cash at a payment center and enter the teller reference.',
  },
];

export default function Wallet() {
  const STORAGE_KEY = 'guest_wallet_balance';
  const [balance, setBalance] = useState(0);
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('gcash');
  const [accountName, setAccountName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMode, setServerMode] = useState(false);
  const [label, setLabel] = useState('Balance');

  const selectedMethod = useMemo(
    () => PAYMENT_METHODS.find((item) => item.value === method) || PAYMENT_METHODS[0],
    [method],
  );

  useEffect(() => {
    let mounted = true;

    const fetchWallet = async () => {
      try {
        const data = await apiClient.getWallet();
        if (!mounted) {
          return;
        }

        setBalance(parseFloat(data.balance));
        setServerMode(true);
        setLabel('Available balance');
      } catch (e) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const nextBalance = parseFloat(raw);
          if (!Number.isNaN(nextBalance)) {
            setBalance(nextBalance);
          }
        }

        setServerMode(false);
        setLabel('Saved balance');
      }
    };

    fetchWallet();

    const syncTimer = setInterval(() => {
      if (serverMode) {
        fetchWallet();
      }
    }, 12000);

    return () => {
      mounted = false;
      clearInterval(syncTimer);
    };
  }, [serverMode]);

  useEffect(() => {
    const handleOpenTopUp = (event) => {
      const suggestedAmount = parseFloat(event?.detail?.suggestedAmount || '');
      if (!Number.isNaN(suggestedAmount) && suggestedAmount > 0) {
        setAmount(suggestedAmount.toFixed(2));
      }

      if (event?.detail?.method) {
        setMethod(event.detail.method);
      }

      setShowTopUp(true);
      setError('');
      setSuccess('');
    };

    const handleWalletUpdated = (event) => {
      if (event?.detail?.balance !== undefined) {
        setBalance(parseFloat(event.detail.balance));
      }

      if (event?.detail?.serverMode !== undefined) {
        setServerMode(Boolean(event.detail.serverMode));
      }
    };

    window.addEventListener('wallet:openTopUp', handleOpenTopUp);
    window.addEventListener('wallet:updated', handleWalletUpdated);

    return () => {
      window.removeEventListener('wallet:openTopUp', handleOpenTopUp);
      window.removeEventListener('wallet:updated', handleWalletUpdated);
    };
  }, []);

  const persist = (nextBalance) => {
    localStorage.setItem(STORAGE_KEY, String(nextBalance));
    setBalance(nextBalance);
    window.dispatchEvent(new CustomEvent('wallet:updated', {
      detail: { balance: nextBalance, serverMode: false },
    }));
  };

  const handleTopUp = async () => {
    setError('');
    setSuccess('');

    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      setError('Enter a valid top-up amount.');
      return;
    }

    if (!accountName.trim() || !referenceNumber.trim() || !contactNumber.trim()) {
      setError('Fill in your name, contact number, and reference number.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (serverMode) {
        const data = await apiClient.topUpWallet(value);
        const nextBalance = parseFloat(data.balance);
        setBalance(nextBalance);
        window.dispatchEvent(new CustomEvent('wallet:updated', {
          detail: { balance: nextBalance, serverMode: true },
        }));
      } else {
        const nextBalance = parseFloat((balance + value).toFixed(2));
        persist(nextBalance);
      }

      setSuccess(`Top-up submitted via ${selectedMethod.label}.`);
      setAmount('');
      setAccountName('');
      setReferenceNumber('');
      setContactNumber('');
      setShowTopUp(false);
    } catch (e) {
      setError('Top-up failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wallet-widget">
      <div className="wallet-widget__card">
        <div className="wallet-widget__badge">{serverMode ? 'Live wallet' : 'Local wallet'}</div>
        <div className="wallet-widget__label">{label}</div>
        <div className="wallet-widget__balance">${balance.toFixed(2)}</div>
        <div className="wallet-widget__actions">
          <button type="button" onClick={() => setShowTopUp(true)} className="btn btn-small wallet-widget__button">
            Top up
          </button>
        </div>
      </div>

      {success && (
        <div className="wallet-widget__notice wallet-widget__notice--success" role="status">
          {success}
        </div>
      )}

      {error && (
        <div className="wallet-widget__notice wallet-widget__notice--error" role="alert">
          {error}
        </div>
      )}

      {showTopUp && (
        <div className="wallet-widget__modal" role="dialog" aria-modal="true" aria-labelledby="wallet-topup-title">
          <div className="wallet-widget__modal-header">
            <div>
              <div className="wallet-widget__eyebrow">Top up your wallet</div>
              <h3 id="wallet-topup-title" className="wallet-widget__title">Add funds to continue booking</h3>
            </div>
            <button
              type="button"
              className="wallet-widget__close"
              onClick={() => {
                setShowTopUp(false);
                setError('');
                setSuccess('');
              }}
              aria-label="Close top up form"
            >
              ×
            </button>
          </div>

          <p className="wallet-widget__description">
            Choose a funding option and enter the details required for your top-up request.
          </p>

          <div className="wallet-widget__methods" role="list">
            {PAYMENT_METHODS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`wallet-widget__method ${method === item.value ? 'is-active' : ''}`}
                onClick={() => setMethod(item.value)}
              >
                <span className="wallet-widget__method-label">{item.label}</span>
                <span className="wallet-widget__method-helper">{item.helper}</span>
              </button>
            ))}
          </div>

          <div className="wallet-widget__hint">{selectedMethod.details}</div>

          <div className="wallet-widget__form-grid">
            <label className="wallet-widget__field">
              <span>Amount</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>

            <label className="wallet-widget__field">
              <span>Full name</span>
              <input
                type="text"
                placeholder="Account holder name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </label>

            <label className="wallet-widget__field">
              <span>Contact number</span>
              <input
                type="tel"
                placeholder="09xx xxx xxxx"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </label>

            <label className="wallet-widget__field">
              <span>Reference number</span>
              <input
                type="text"
                placeholder="Transaction reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </label>
          </div>

          <div className="wallet-widget__summary">
            Required details: amount, sender name, contact number, and transaction reference.
          </div>

          <div className="wallet-widget__modal-actions">
            <button type="button" onClick={handleTopUp} className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Confirm top up'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTopUp(false);
                setError('');
                setSuccess('');
              }}
              className="btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
