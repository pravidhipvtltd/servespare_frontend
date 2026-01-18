import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, Upload, Camera, FileImage, X, 
  ChevronRight, ChevronLeft, CheckCircle, AlertCircle
} from 'lucide-react';

interface ReturnRequestFlowProps {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    sku: string;
    image: string;
    price: number;
  }>;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export const ReturnRequestFlow: React.FC<ReturnRequestFlowProps> = ({
  orderId,
  items,
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; url: string; name: string }>>([]);

  const returnReasons = [
    { value: 'defective', label: 'Defective/Not Working', icon: AlertCircle },
    { value: 'wrong-item', label: 'Wrong Item Received', icon: AlertCircle },
    { value: 'damaged', label: 'Damaged in Transit', icon: AlertCircle },
    { value: 'not-as-described', label: 'Not as Described', icon: AlertCircle },
    { value: 'quality-issues', label: 'Quality Issues', icon: AlertCircle },
    { value: 'other', label: 'Other Reason', icon: AlertCircle }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage = {
            id: Math.random().toString(36).substr(2, 9),
            url: event.target?.result as string,
            name: file.name
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    const returnData = {
      orderId,
      selectedItems,
      reason: returnReason,
      description,
      images: uploadedImages
    };
    onSubmit?.(returnData);
  };

  const steps = [
    { number: 1, title: 'Select Items', description: 'Choose items to return' },
    { number: 2, title: 'Reason', description: 'Why are you returning?' },
    { number: 3, title: 'Upload Images', description: 'Provide visual proof' },
    { number: 4, title: 'Review', description: 'Confirm your request' }
  ];

  const isStepValid = () => {
    if (currentStep === 1) return selectedItems.length > 0;
    if (currentStep === 2) return returnReason !== '';
    if (currentStep === 3) return true; // Images are optional
    if (currentStep === 4) return true;
    return false;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl text-white">Return Request</h2>
              <p className="text-sm text-slate-400">Order #{orderId}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all
                    ${currentStep >= step.number
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <p className={`text-xs mt-2 hidden sm:block ${currentStep >= step.number ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-slate-800 rounded-full overflow-hidden">
                  {currentStep > step.number && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Items */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg text-white mb-4">Select items you want to return</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <label
                    key={item.id}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedItems.includes(item.id)
                        ? 'bg-orange-500/10 border-orange-500/50'
                        : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
                      className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                    />
                    <div className="w-16 h-16 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white mb-1">{item.name}</h4>
                      <p className="text-sm text-slate-400">SKU: {item.sku}</p>
                    </div>
                    <p className="text-white">NPR {item.price.toLocaleString()}</p>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Return Reason */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg text-white mb-4">Why are you returning this item?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {returnReasons.map(reason => {
                  const Icon = reason.icon;
                  return (
                    <button
                      key={reason.value}
                      onClick={() => setReturnReason(reason.value)}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all
                        ${returnReason === reason.value
                          ? 'bg-orange-500/10 border-orange-500/50'
                          : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${returnReason === reason.value ? 'text-orange-400' : 'text-slate-400'}`} />
                      <span className={returnReason === reason.value ? 'text-white' : 'text-slate-300'}>
                        {reason.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Additional Details (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide more details about the issue..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Upload Images */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg text-white mb-2">Upload Images</h3>
              <p className="text-sm text-slate-400 mb-6">
                Upload photos showing the issue (Optional but recommended)
              </p>

              {/* Upload Area */}
              <label className="block border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white mb-1">Click to upload images</p>
                    <p className="text-sm text-slate-400">PNG, JPG up to 10MB each</p>
                  </div>
                </div>
              </label>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {uploadedImages.map(image => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-lg bg-slate-800 overflow-hidden">
                        <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      <p className="text-xs text-slate-400 mt-1 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg text-white mb-6">Review Your Return Request</h3>
              
              <div className="space-y-4">
                {/* Selected Items */}
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <h4 className="text-sm text-slate-400 mb-3">Items to Return</h4>
                  {items.filter(item => selectedItems.includes(item.id)).map(item => (
                    <div key={item.id} className="flex items-center gap-3 mb-2 last:mb-0">
                      <div className="w-12 h-12 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-white text-sm flex-1">{item.name}</p>
                      <p className="text-white text-sm">NPR {item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Return Reason */}
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <h4 className="text-sm text-slate-400 mb-2">Return Reason</h4>
                  <p className="text-white">
                    {returnReasons.find(r => r.value === returnReason)?.label}
                  </p>
                  {description && (
                    <p className="text-sm text-slate-300 mt-2">{description}</p>
                  )}
                </div>

                {/* Images */}
                {uploadedImages.length > 0 && (
                  <div className="p-4 bg-slate-800/30 rounded-lg">
                    <h4 className="text-sm text-slate-400 mb-3">Uploaded Images</h4>
                    <div className="flex gap-2 flex-wrap">
                      {uploadedImages.map(image => (
                        <div key={image.id} className="w-16 h-16 rounded bg-slate-800 overflow-hidden">
                          <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Once submitted, our team will review your return request within 24-48 hours. 
                    You'll receive an email with further instructions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-800 p-6 flex items-center justify-between bg-slate-900/50">
        <button
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
        </button>

        <div className="text-sm text-slate-400">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-lg transition-all
              ${isStepValid()
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit Request</span>
          </button>
        )}
      </div>
    </div>
  );
};
