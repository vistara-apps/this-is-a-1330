import React, { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { 
  validateMarketName, 
  validateMarketDescription, 
  validateMarketOutcomes, 
  validateMarketOdds,
  validateDate,
  validateFeePercentage
} from '../utils/validation';
import { X, Plus, Calendar, Clock, Tag, Percent } from 'lucide-react';

/**
 * Admin form for creating and editing markets
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {Object} [props.initialValues] - Initial form values for editing
 * @param {boolean} [props.isSubmitting=false] - Whether form is submitting
 * @returns {JSX.Element} Admin market form component
 */
export const AdminMarketForm = ({ 
  onSubmit, 
  onCancel, 
  initialValues = null,
  isSubmitting = false
}) => {
  const isEditing = !!initialValues;
  
  // Default values
  const defaultValues = {
    name: '',
    description: '',
    category: 'crypto',
    outcomes: ['', ''],
    odds: [1.5, 2.5],
    startDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // 1 hour from now
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),  // 24 hours from now
    settlementDate: new Date(Date.now() + 90000000).toISOString().slice(0, 16), // 25 hours from now
    feePercentage: 3
  };
  
  // Merge initial values with defaults
  const formInitialValues = initialValues ? { ...defaultValues, ...initialValues } : defaultValues;
  
  // Validation rules
  const validationRules = {
    name: (value) => {
      const result = validateMarketName(value);
      return result.isValid ? null : result.error;
    },
    description: (value) => {
      const result = validateMarketDescription(value);
      return result.isValid ? null : result.error;
    },
    category: (value) => {
      return value ? null : 'Category is required';
    },
    outcomes: (value) => {
      const result = validateMarketOutcomes(value);
      return result.isValid ? null : result.error;
    },
    odds: (value, allValues) => {
      const result = validateMarketOdds(value, allValues.outcomes.length);
      return result.isValid ? null : result.error;
    },
    startDate: (value) => {
      const result = validateDate(value, new Date());
      return result.isValid ? null : result.error;
    },
    endDate: (value, allValues) => {
      const result = validateDate(value, new Date(allValues.startDate));
      return result.isValid ? null : result.error;
    },
    settlementDate: (value, allValues) => {
      const result = validateDate(value, new Date(allValues.endDate));
      return result.isValid ? null : result.error;
    },
    feePercentage: (value) => {
      const result = validateFeePercentage(value);
      return result.isValid ? null : result.error;
    }
  };
  
  // Available categories
  const categories = [
    { id: 'crypto', name: 'Cryptocurrency' },
    { id: 'esports', name: 'Esports' },
    { id: 'sports', name: 'Sports' },
    { id: 'politics', name: 'Politics' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'other', name: 'Other' }
  ];
  
  // Form validation hook
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue
  } = useFormValidation(formInitialValues, validationRules);
  
  // Add outcome
  const addOutcome = () => {
    if (values.outcomes.length >= 10) {
      return; // Maximum 10 outcomes
    }
    
    const newOutcomes = [...values.outcomes, ''];
    const newOdds = [...values.odds, 2.0]; // Default odds
    
    setFieldValue('outcomes', newOutcomes);
    setFieldValue('odds', newOdds);
  };
  
  // Remove outcome
  const removeOutcome = (index) => {
    if (values.outcomes.length <= 2) {
      return; // Minimum 2 outcomes
    }
    
    const newOutcomes = values.outcomes.filter((_, i) => i !== index);
    const newOdds = values.odds.filter((_, i) => i !== index);
    
    setFieldValue('outcomes', newOutcomes);
    setFieldValue('odds', newOdds);
  };
  
  // Update outcome
  const updateOutcome = (index, value) => {
    const newOutcomes = [...values.outcomes];
    newOutcomes[index] = value;
    setFieldValue('outcomes', newOutcomes);
  };
  
  // Update odds
  const updateOdds = (index, value) => {
    const newOdds = [...values.odds];
    newOdds[index] = parseFloat(value) || 1.0;
    setFieldValue('odds', newOdds);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-textPrimary">
          {isEditing ? 'Edit Market' : 'Create New Market'}
        </h2>
        
        {/* Market Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-textSecondary mb-1">
            Market Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., SOL Price Prediction"
            className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 ${
              touched.name && errors.name 
                ? 'border-error focus:ring-error/50' 
                : 'border-surfaceLight focus:ring-primary/50'
            }`}
            disabled={isSubmitting}
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-error">{errors.name}</p>
          )}
        </div>
        
        {/* Market Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-textSecondary mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Describe what this market is about..."
            rows={3}
            className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 ${
              touched.description && errors.description 
                ? 'border-error focus:ring-error/50' 
                : 'border-surfaceLight focus:ring-primary/50'
            }`}
            disabled={isSubmitting}
          />
          {touched.description && errors.description && (
            <p className="mt-1 text-sm text-error">{errors.description}</p>
          )}
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-textSecondary mb-1">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Category</span>
            </div>
          </label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 ${
              touched.category && errors.category 
                ? 'border-error focus:ring-error/50' 
                : 'border-surfaceLight focus:ring-primary/50'
            }`}
            disabled={isSubmitting}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {touched.category && errors.category && (
            <p className="mt-1 text-sm text-error">{errors.category}</p>
          )}
        </div>
        
        {/* Outcomes and Odds */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            Outcomes and Odds
          </label>
          
          <div className="space-y-3">
            {values.outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => updateOutcome(index, e.target.value)}
                    onBlur={() => handleBlur('outcomes')}
                    placeholder={`Outcome ${index + 1}`}
                    className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 ${
                      touched.outcomes && errors.outcomes 
                        ? 'border-error focus:ring-error/50' 
                        : 'border-surfaceLight focus:ring-primary/50'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="w-24">
                  <input
                    type="number"
                    value={values.odds[index]}
                    onChange={(e) => updateOdds(index, e.target.value)}
                    onBlur={() => handleBlur('odds')}
                    placeholder="Odds"
                    min="1.0"
                    step="0.1"
                    className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 ${
                      touched.odds && errors.odds 
                        ? 'border-error focus:ring-error/50' 
                        : 'border-surfaceLight focus:ring-primary/50'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                
                {values.outcomes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOutcome(index)}
                    className="text-textMuted hover:text-error transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            {values.outcomes.length < 10 && (
              <button
                type="button"
                onClick={addOutcome}
                className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4" />
                <span>Add Outcome</span>
              </button>
            )}
          </div>
          
          {touched.outcomes && errors.outcomes && (
            <p className="mt-1 text-sm text-error">{errors.outcomes}</p>
          )}
          
          {touched.odds && errors.odds && (
            <p className="mt-1 text-sm text-error">{errors.odds}</p>
          )}
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-textSecondary mb-1">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Start Date</span>
              </div>
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={values.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 ${
                touched.startDate && errors.startDate 
                  ? 'border-error focus:ring-error/50' 
                  : 'border-surfaceLight focus:ring-primary/50'
              }`}
              disabled={isSubmitting}
            />
            {touched.startDate && errors.startDate && (
              <p className="mt-1 text-sm text-error">{errors.startDate}</p>
            )}
          </div>
          
          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-textSecondary mb-1">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>End Date</span>
              </div>
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={values.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 ${
                touched.endDate && errors.endDate 
                  ? 'border-error focus:ring-error/50' 
                  : 'border-surfaceLight focus:ring-primary/50'
              }`}
              disabled={isSubmitting}
            />
            {touched.endDate && errors.endDate && (
              <p className="mt-1 text-sm text-error">{errors.endDate}</p>
            )}
          </div>
          
          {/* Settlement Date */}
          <div>
            <label htmlFor="settlementDate" className="block text-sm font-medium text-textSecondary mb-1">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Settlement Date</span>
              </div>
            </label>
            <input
              type="datetime-local"
              id="settlementDate"
              name="settlementDate"
              value={values.settlementDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 ${
                touched.settlementDate && errors.settlementDate 
                  ? 'border-error focus:ring-error/50' 
                  : 'border-surfaceLight focus:ring-primary/50'
              }`}
              disabled={isSubmitting}
            />
            {touched.settlementDate && errors.settlementDate && (
              <p className="mt-1 text-sm text-error">{errors.settlementDate}</p>
            )}
          </div>
        </div>
        
        {/* Fee Percentage */}
        <div>
          <label htmlFor="feePercentage" className="block text-sm font-medium text-textSecondary mb-1">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4" />
              <span>Platform Fee Percentage</span>
            </div>
          </label>
          <div className="relative">
            <input
              type="number"
              id="feePercentage"
              name="feePercentage"
              value={values.feePercentage}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              max="10"
              step="0.1"
              className={`w-full bg-surfaceLight border rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 ${
                touched.feePercentage && errors.feePercentage 
                  ? 'border-error focus:ring-error/50' 
                  : 'border-surfaceLight focus:ring-primary/50'
              }`}
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="text-textMuted">%</span>
            </div>
          </div>
          {touched.feePercentage && errors.feePercentage && (
            <p className="mt-1 text-sm text-error">{errors.feePercentage}</p>
          )}
          <p className="mt-1 text-xs text-textMuted">
            Platform fee is taken from winning payouts. Maximum 10%.
          </p>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : isEditing ? 'Update Market' : 'Create Market'}
        </button>
      </div>
    </form>
  );
};

export default AdminMarketForm;

