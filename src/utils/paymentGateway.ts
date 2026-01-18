// ==========================================
// NEPAL PAYMENT GATEWAY INTEGRATION
// Supports: eSewa & FonePay
// ==========================================

// ==========================================
// ESEWA PAYMENT GATEWAY
// ==========================================

interface EsewaConfig {
  merchantId: string;
  secretKey: string;
  successUrl: string;
  failureUrl: string;
  environment: 'production' | 'test';
}

interface EsewaPaymentData {
  amount: number;
  taxAmount: number;
  totalAmount: number;
  transactionId: string;
  productName: string;
  productDeliveryCharge: number;
  productServiceCharge: number;
}

export const ESEWA_CONFIG: EsewaConfig = {
  // Test credentials - Replace with production credentials
  merchantId: 'EPAYTEST',
  secretKey: '8gBm/:&EnhH.1/q',
  successUrl: `${window.location.origin}/payment-success`,
  failureUrl: `${window.location.origin}/payment-failure`,
  environment: 'test' // Change to 'production' for live
};

export const ESEWA_URLS = {
  test: 'https://uat.esewa.com.np/epay/main',
  production: 'https://esewa.com.np/epay/main'
};

/**
 * Initiate eSewa payment
 */
export function initiateEsewaPayment(data: EsewaPaymentData): void {
  const { amount, taxAmount, totalAmount, transactionId, productName, productDeliveryCharge, productServiceCharge } = data;
  
  // Create form dynamically
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = ESEWA_CONFIG.environment === 'production' 
    ? ESEWA_URLS.production 
    : ESEWA_URLS.test;
  
  // Add form fields
  const fields = {
    amt: amount.toString(),
    psc: productServiceCharge.toString(),
    pdc: productDeliveryCharge.toString(),
    txAmt: taxAmount.toString(),
    tAmt: totalAmount.toString(),
    pid: transactionId,
    scd: ESEWA_CONFIG.merchantId,
    su: ESEWA_CONFIG.successUrl,
    fu: ESEWA_CONFIG.failureUrl
  };
  
  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  
  // Submit form
  document.body.appendChild(form);
  form.submit();
}

/**
 * Verify eSewa payment after redirect
 */
export async function verifyEsewaPayment(
  transactionId: string, 
  totalAmount: number,
  refId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const verifyUrl = ESEWA_CONFIG.environment === 'production'
      ? 'https://esewa.com.np/epay/transrec'
      : 'https://uat.esewa.com.np/epay/transrec';
    
    const params = new URLSearchParams({
      amt: totalAmount.toString(),
      rid: refId,
      pid: transactionId,
      scd: ESEWA_CONFIG.merchantId
    });
    
    // Note: In production, this verification should be done on the backend
    const response = await fetch(`${verifyUrl}?${params.toString()}`);
    const xmlText = await response.text();
    
    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const responseCode = xmlDoc.getElementsByTagName('response_code')[0]?.textContent;
    
    if (responseCode === 'Success') {
      return {
        success: true,
        message: 'Payment verified successfully',
        data: {
          transactionId,
          refId,
          amount: totalAmount,
          verifiedAt: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        message: 'Payment verification failed'
      };
    }
  } catch (error: any) {
    console.error('eSewa verification error:', error);
    return {
      success: false,
      message: error.message || 'Payment verification failed'
    };
  }
}

// ==========================================
// FONEPAY PAYMENT GATEWAY
// ==========================================

interface FonepayConfig {
  merchantCode: string;
  secretKey: string;
  returnUrl: string;
  environment: 'production' | 'test';
}

interface FonepayPaymentData {
  amount: number;
  remarks: string;
  transactionId: string;
}

export const FONEPAY_CONFIG: FonepayConfig = {
  // Test credentials - Replace with production credentials
  merchantCode: 'MERCHANT_TEST',
  secretKey: 'test_secret_key',
  returnUrl: `${window.location.origin}/payment-callback`,
  environment: 'test' // Change to 'production' for live
};

export const FONEPAY_URLS = {
  test: 'https://dev-clientapi.fonepay.com/api/merchantRequest',
  production: 'https://clientapi.fonepay.com/api/merchantRequest'
};

/**
 * Generate FonePay hash/signature
 */
function generateFonepayHash(data: string, secretKey: string): string {
  // This is a simplified version. In production, use proper HMAC-SHA256
  // You'll need to implement this based on FonePay's documentation
  return btoa(data + secretKey);
}

/**
 * Initiate FonePay payment
 */
export async function initiateFonepayPayment(data: FonepayPaymentData): Promise<void> {
  const { amount, remarks, transactionId } = data;
  
  const paymentData = {
    PID: FONEPAY_CONFIG.merchantCode,
    MD: 'P',
    AMT: amount.toString(),
    CRN: 'NPR',
    DT: new Date().toISOString().split('T')[0],
    R1: remarks,
    R2: transactionId,
    DV: '', // Will be set with hash
    RU: FONEPAY_CONFIG.returnUrl,
    PRN: transactionId
  };
  
  // Generate hash
  const hashString = `${FONEPAY_CONFIG.merchantCode},${paymentData.MD},${paymentData.PRN},${paymentData.AMT},${paymentData.CRN},${paymentData.DT},${paymentData.R1},${paymentData.R2}`;
  paymentData.DV = generateFonepayHash(hashString, FONEPAY_CONFIG.secretKey);
  
  // Create form and submit
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = FONEPAY_CONFIG.environment === 'production' 
    ? FONEPAY_URLS.production 
    : FONEPAY_URLS.test;
  
  Object.entries(paymentData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
}

/**
 * Verify FonePay payment after callback
 */
export async function verifyFonepayPayment(
  responseData: any
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Verify the hash from FonePay response
    const hashString = `${responseData.PRN},${responseData.AMT},${responseData.CRN},${responseData.DT},${responseData.R1},${responseData.R2}`;
    const expectedHash = generateFonepayHash(hashString, FONEPAY_CONFIG.secretKey);
    
    if (responseData.DV === expectedHash && responseData.success === true) {
      return {
        success: true,
        message: 'Payment verified successfully',
        data: {
          transactionId: responseData.PRN,
          transactionCode: responseData.TC,
          amount: parseFloat(responseData.AMT),
          verifiedAt: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        message: 'Payment verification failed'
      };
    }
  } catch (error: any) {
    console.error('FonePay verification error:', error);
    return {
      success: false,
      message: error.message || 'Payment verification failed'
    };
  }
}

// ==========================================
// UNIFIED PAYMENT INTERFACE
// ==========================================

export interface PaymentRequest {
  gateway: 'esewa' | 'fonepay';
  amount: number;
  transactionId: string;
  productName: string;
  remarks?: string;
}

/**
 * Initiate payment with selected gateway
 */
export function initiatePayment(request: PaymentRequest): void {
  const { gateway, amount, transactionId, productName, remarks } = request;
  
  console.log(`💳 Initiating ${gateway.toUpperCase()} payment:`, {
    amount,
    transactionId,
    productName
  });
  
  if (gateway === 'esewa') {
    initiateEsewaPayment({
      amount: amount,
      taxAmount: 0,
      totalAmount: amount,
      transactionId: transactionId,
      productName: productName,
      productDeliveryCharge: 0,
      productServiceCharge: 0
    });
  } else if (gateway === 'fonepay') {
    initiateFonepayPayment({
      amount: amount,
      remarks: remarks || productName,
      transactionId: transactionId
    });
  }
}

/**
 * Handle payment callback/redirect
 */
export async function handlePaymentCallback(
  gateway: 'esewa' | 'fonepay',
  params: URLSearchParams
): Promise<{ success: boolean; message: string; data?: any }> {
  if (gateway === 'esewa') {
    const refId = params.get('refId') || '';
    const oid = params.get('oid') || '';
    const amt = parseFloat(params.get('amt') || '0');
    
    if (!refId || !oid) {
      return {
        success: false,
        message: 'Invalid payment response'
      };
    }
    
    return await verifyEsewaPayment(oid, amt, refId);
  } else if (gateway === 'fonepay') {
    const responseData = {
      PRN: params.get('PRN'),
      AMT: params.get('AMT'),
      CRN: params.get('CRN'),
      DT: params.get('DT'),
      R1: params.get('R1'),
      R2: params.get('R2'),
      DV: params.get('DV'),
      TC: params.get('TC'),
      success: params.get('success') === 'true'
    };
    
    return await verifyFonepayPayment(responseData);
  }
  
  return {
    success: false,
    message: 'Unknown payment gateway'
  };
}

// ==========================================
// MOCK PAYMENT FOR TESTING
// ==========================================

/**
 * Simulate payment success for testing (REMOVE IN PRODUCTION)
 */
export function mockPaymentSuccess(
  gateway: 'esewa' | 'fonepay',
  transactionId: string,
  amount: number
): { success: boolean; message: string; data: any } {
  console.warn('⚠️ Using MOCK payment - This should ONLY be used for testing!');
  
  return {
    success: true,
    message: 'Payment successful (MOCK)',
    data: {
      gateway,
      transactionId,
      amount,
      refId: `MOCK_${Date.now()}`,
      paymentId: `${gateway.toUpperCase()}_${transactionId}`,
      verifiedAt: new Date().toISOString(),
      isMock: true
    }
  };
}
