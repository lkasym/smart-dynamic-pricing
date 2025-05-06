import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const DataGenerationPage: React.FC<{
  onDataGenerated: () => void;
}> = ({ onDataGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataExists, setDataExists] = useState(false);

  // Check if data already exists
  useEffect(() => {
    const checkForExistingData = async () => {
      try {
        const products = await apiClient.getProducts();
        if (Array.isArray(products) && products.length > 0) {
          setDataExists(true);
        }
      } catch (err) {
        console.error('Error checking for existing data:', err);
        // Don't set error here, just assume no data exists
      }
    };

    checkForExistingData();
  }, []);

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await apiClient.generateSampleData();
      
      if (response && response.products && response.products.length > 0) {
        setDataExists(true);
        // Wait a moment to show the success state before proceeding
        setTimeout(() => {
          onDataGenerated();
        }, 1000);
      } else {
        setError('No products returned from the server. Please try again.');
      }
    } catch (err) {
      console.error('Error generating sample data:', err);
      setError('Failed to generate sample data. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    onDataGenerated();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full animate-fade-in shadow-lg">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Smart Dynamic Pricing System
          </h1>
          
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              Welcome to the Smart Dynamic Pricing System! Before you can use the dashboard, you need to generate sample data.
            </p>
            <p className="text-gray-600 mb-4">
              This will create product data that the AI will use to optimize pricing strategies.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
          
          {dataExists ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
              Data has been successfully generated! You can now proceed to the dashboard.
            </div>
          ) : null}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {dataExists ? (
              <Button 
                onClick={handleContinue}
                variant="primary"
                size="large"
                className="w-full sm:w-auto"
              >
                Continue to Dashboard
              </Button>
            ) : (
              <Button 
                onClick={handleGenerateData}
                disabled={isGenerating}
                variant="primary"
                size="large"
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Generating...</span>
                  </span>
                ) : (
                  'Generate Sample Data'
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataGenerationPage;
