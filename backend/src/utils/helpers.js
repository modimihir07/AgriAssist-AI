export const formatDiagnosis = (data) => {
  return {
    ...data,
    timestamp: new Date().toISOString()
  };
};

export const validateImage = (base64) => {
  // Basic check for base64 image
  return base64 && base64.length > 100;
};
