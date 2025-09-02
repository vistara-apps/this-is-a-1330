import React from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

/**
 * Transaction status component for displaying transaction state
 * @param {Object} props - Component props
 * @param {string} props.status - Transaction status (pending, success, error)
 * @param {string} [props.message] - Optional status message
 * @param {string} [props.txSignature] - Transaction signature for explorer link
 * @param {Function} [props.onClose] - Optional close handler
 * @returns {JSX.Element} Transaction status component
 */
export const TransactionStatus = ({ 
  status, 
  message, 
  txSignature,
  onClose
}) => {
  // Status configuration
  const statusConfig = {
    pending: {
      icon: <Clock className="w-5 h-5 text-warning" />,
      title: 'Transaction Pending',
      color: 'bg-warning/10 border-warning/20',
      textColor: 'text-warning'
    },
    success: {
      icon: <CheckCircle className="w-5 h-5 text-success" />,
      title: 'Transaction Successful',
      color: 'bg-success/10 border-success/20',
      textColor: 'text-success'
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-error" />,
      title: 'Transaction Failed',
      color: 'bg-error/10 border-error/20',
      textColor: 'text-error'
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  // Generate Solana explorer link
  const getExplorerLink = (signature) => {
    // Use devnet for demo purposes
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  };
  
  return (
    <div className={`${config.color} border rounded-lg p-4 animate-fade-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          
          {message && (
            <p className="mt-1 text-sm text-textSecondary">
              {message}
            </p>
          )}
          
          {txSignature && (
            <a 
              href={getExplorerLink(txSignature)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
            >
              View on Explorer
              <ExternalLink className="ml-1 w-3 h-3" />
            </a>
          )}
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-textMuted hover:text-textPrimary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;

