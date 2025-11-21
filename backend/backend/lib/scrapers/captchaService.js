import axios from 'axios';

/**
 * CAPTCHA solving service with multiple providers
 */
export class CaptchaService {
  constructor() {
    this.providers = {
      '2captcha': {
        apiKey: process.env.CAPTCHA_2CAPTCHA_KEY || 'YOUR_2CAPTCHA_KEY',
        submitUrl: 'http://2captcha.com/in.php',
        resultUrl: 'http://2captcha.com/res.php'
      },
      'anticaptcha': {
        apiKey: process.env.CAPTCHA_ANTICAPTCHA_KEY || 'YOUR_ANTICAPTCHA_KEY',
        submitUrl: 'https://api.anti-captcha.com/createTask',
        resultUrl: 'https://api.anti-captcha.com/getTaskResult'
      }
    };
    this.currentProvider = '2captcha';
  }

  /**
   * Solve reCAPTCHA v2
   */
  async solveRecaptchaV2(page, siteKey, pageUrl) {
    try {
      console.log('🤖 Solving reCAPTCHA v2...');
      
      const taskId = await this.submitRecaptchaTask(siteKey, pageUrl);
      const solution = await this.waitForSolution(taskId);
      
      // Inject solution into page
      await page.evaluate((solution) => {
        const textarea = document.querySelector('textarea[name="g-recaptcha-response"]');
        if (textarea) {
          textarea.value = solution;
          textarea.style.display = 'block';
        }
        
        // Trigger callback if exists
        if (window.grecaptcha && window.grecaptcha.getResponse) {
          window.grecaptcha.getResponse = () => solution;
        }
      }, solution);

      console.log('✅ reCAPTCHA v2 solved successfully');
      return solution;
    } catch (error) {
      console.error('❌ reCAPTCHA v2 solving failed:', error.message);
      throw error;
    }
  }

  /**
   * Solve hCaptcha
   */
  async solveHcaptcha(page, siteKey, pageUrl) {
    try {
      console.log('🤖 Solving hCaptcha...');
      
      const taskId = await this.submitHcaptchaTask(siteKey, pageUrl);
      const solution = await this.waitForSolution(taskId);
      
      // Inject solution into page
      await page.evaluate((solution) => {
        const textarea = document.querySelector('textarea[name="h-captcha-response"]');
        if (textarea) {
          textarea.value = solution;
          textarea.style.display = 'block';
        }
      }, solution);

      console.log('✅ hCaptcha solved successfully');
      return solution;
    } catch (error) {
      console.error('❌ hCaptcha solving failed:', error.message);
      throw error;
    }
  }

  /**
   * Submit reCAPTCHA task to provider
   */
  async submitRecaptchaTask(siteKey, pageUrl) {
    const provider = this.providers[this.currentProvider];
    
    if (this.currentProvider === '2captcha') {
      const response = await axios.post(provider.submitUrl, null, {
        params: {
          key: provider.apiKey,
          method: 'userrecaptcha',
          googlekey: siteKey,
          pageurl: pageUrl,
          json: 1
        }
      });
      
      if (response.data.status === 1) {
        return response.data.request;
      } else {
        throw new Error(`2captcha submit failed: ${response.data.error_text}`);
      }
    }
    
    if (this.currentProvider === 'anticaptcha') {
      const response = await axios.post(provider.submitUrl, {
        clientKey: provider.apiKey,
        task: {
          type: 'NoCaptchaTaskProxyless',
          websiteURL: pageUrl,
          websiteKey: siteKey
        }
      });
      
      if (response.data.errorId === 0) {
        return response.data.taskId;
      } else {
        throw new Error(`AntiCaptcha submit failed: ${response.data.errorDescription}`);
      }
    }
  }

  /**
   * Submit hCaptcha task to provider
   */
  async submitHcaptchaTask(siteKey, pageUrl) {
    const provider = this.providers[this.currentProvider];
    
    if (this.currentProvider === '2captcha') {
      const response = await axios.post(provider.submitUrl, null, {
        params: {
          key: provider.apiKey,
          method: 'hcaptcha',
          sitekey: siteKey,
          pageurl: pageUrl,
          json: 1
        }
      });
      
      if (response.data.status === 1) {
        return response.data.request;
      } else {
        throw new Error(`2captcha hCaptcha submit failed: ${response.data.error_text}`);
      }
    }
    
    if (this.currentProvider === 'anticaptcha') {
      const response = await axios.post(provider.submitUrl, {
        clientKey: provider.apiKey,
        task: {
          type: 'HCaptchaTaskProxyless',
          websiteURL: pageUrl,
          websiteKey: siteKey
        }
      });
      
      if (response.data.errorId === 0) {
        return response.data.taskId;
      } else {
        throw new Error(`AntiCaptcha hCaptcha submit failed: ${response.data.errorDescription}`);
      }
    }
  }

  /**
   * Wait for CAPTCHA solution
   */
  async waitForSolution(taskId, maxWaitTime = 120000) {
    const provider = this.providers[this.currentProvider];
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        if (this.currentProvider === '2captcha') {
          const response = await axios.get(provider.resultUrl, {
            params: {
              key: provider.apiKey,
              action: 'get',
              id: taskId,
              json: 1
            }
          });
          
          if (response.data.status === 1) {
            return response.data.request;
          } else if (response.data.error_text) {
            throw new Error(`2captcha result failed: ${response.data.error_text}`);
          }
        }
        
        if (this.currentProvider === 'anticaptcha') {
          const response = await axios.post(provider.resultUrl, {
            clientKey: provider.apiKey,
            taskId: taskId
          });
          
          if (response.data.status === 'ready') {
            return response.data.solution.gRecaptchaResponse;
          } else if (response.data.errorDescription) {
            throw new Error(`AntiCaptcha result failed: ${response.data.errorDescription}`);
          }
        }
      } catch (error) {
        console.log(`Waiting for CAPTCHA solution... (${Math.floor((Date.now() - startTime) / 1000)}s)`);
      }
    }
    
    throw new Error('CAPTCHA solving timeout');
  }

  /**
   * Switch to alternative provider
   */
  switchProvider() {
    const providers = Object.keys(this.providers);
    const currentIndex = providers.indexOf(this.currentProvider);
    this.currentProvider = providers[(currentIndex + 1) % providers.length];
    console.log(`🔄 Switched to ${this.currentProvider} provider`);
  }

  /**
   * Check if CAPTCHA is present on page
   */
  async detectCaptcha(page) {
    const captchaTypes = await page.evaluate(() => {
      const types = [];
      
      // Check for reCAPTCHA v2
      if (document.querySelector('.g-recaptcha') || document.querySelector('iframe[src*="recaptcha"]')) {
        types.push('recaptcha-v2');
      }
      
      // Check for reCAPTCHA v3
      if (document.querySelector('script[src*="recaptcha"]')) {
        types.push('recaptcha-v3');
      }
      
      // Check for hCaptcha
      if (document.querySelector('.h-captcha') || document.querySelector('iframe[src*="hcaptcha"]')) {
        types.push('hcaptcha');
      }
      
      // Check for generic CAPTCHA
      if (document.querySelector('#captcha, .captcha, [class*="captcha"]')) {
        types.push('generic');
      }
      
      return types;
    });
    
    return captchaTypes;
  }

  /**
   * Get provider statistics
   */
  getProviderStats() {
    return {
      current: this.currentProvider,
      available: Object.keys(this.providers),
      configured: Object.keys(this.providers).filter(provider => 
        this.providers[provider].apiKey && 
        !this.providers[provider].apiKey.includes('YOUR_')
      )
    };
  }
}

// Export singleton instance
export const captchaService = new CaptchaService();
