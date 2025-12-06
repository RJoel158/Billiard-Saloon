import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn pagination-btn-prev"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} />
        <span>Anterior</span>
      </button>

      <div className="pagination-info">
        <span className="pagination-badge">
          {currentPage}
        </span>
        <span className="pagination-separator">de</span>
        <span className="pagination-total">{totalPages}</span>
      </div>

      <button
        className="pagination-btn pagination-btn-next"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <span>Siguiente</span>
        <ChevronRight size={20} />
      </button>

      <style>{`
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e9ecef;
          background: #ffffff;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border: 2px solid #6366f1;
          background: white;
          color: #6366f1;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 110px;
          justify-content: center;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #6366f1;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .pagination-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: #cbd5e1;
          color: #94a3b8;
        }

        .pagination-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1rem;
          font-size: 0.95rem;
        }

        .pagination-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 0.75rem;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
        }

        .pagination-separator {
          color: #64748b;
          font-weight: 500;
        }

        .pagination-total {
          color: #475569;
          font-weight: 600;
          font-size: 1rem;
        }

        @media (max-width: 576px) {
          .pagination-container {
            gap: 0.5rem;
          }
          
          .pagination-btn span {
            display: none;
          }
          
          .pagination-btn {
            min-width: auto;
            padding: 0.625rem;
          }
        }
      `}</style>
    </div>
  );
}
