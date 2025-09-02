import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Form validation state and methods
 */
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field
   * @param {string} name - Field name
   * @param {any} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    // If rule is a function, call it with the value and all form values
    if (typeof rule === 'function') {
      return rule(value, values);
    }

    // If rule is an object with a validate function
    if (rule.validate && typeof rule.validate === 'function') {
      return rule.validate(value, values);
    }

    // If rule is a regex
    if (rule instanceof RegExp) {
      return rule.test(value) ? null : 'Invalid format';
    }

    return null;
  }, [validationRules, values]);

  /**
   * Validate all form fields
   * @returns {Object} Validation errors
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [validateField, validationRules, values]);

  /**
   * Handle field change
   * @param {Event|string} event - Change event or field name
   * @param {any} [value] - Field value (if name is provided directly)
   */
  const handleChange = useCallback((event, value) => {
    const name = typeof event === 'string' ? event : event.target.name;
    const newValue = typeof event === 'string' ? value : event.target.value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // If field has been touched, validate it
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);

  /**
   * Handle field blur
   * @param {Event|string} event - Blur event or field name
   */
  const handleBlur = useCallback((event) => {
    const name = typeof event === 'string' ? event : event.target.name;

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field
    const error = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField, values]);

  /**
   * Handle form submission
   * @param {Function} onSubmit - Submit callback
   * @returns {Function} Submit handler
   */
  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      if (event) {
        event.preventDefault();
      }

      setIsSubmitting(true);
      
      // Validate all fields
      const { isValid, errors } = validateForm();
      
      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      
      setTouched(allTouched);

      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    };
  }, [validateForm, validationRules, values]);

  /**
   * Reset form to initial values
   * @param {Object} [newInitialValues] - New initial values
   */
  const resetForm = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Set a specific field value
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // If field has been touched, validate it
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);

  /**
   * Set multiple field values
   * @param {Object} newValues - New field values
   */
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));

    // Validate touched fields
    const newErrors = { ...errors };
    Object.keys(newValues).forEach(name => {
      if (touched[name]) {
        newErrors[name] = validateField(name, newValues[name]);
      }
    });

    setErrors(newErrors);
  }, [errors, touched, validateField]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setMultipleValues,
    validateForm,
    validateField
  };
};

export default useFormValidation;

