/**
 * Privacy Policy Page
 * GDPR-compliant privacy policy for ProprScout
 */

import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';

export default function PrivacyPolicyPage({ onBack }) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = 'December 1, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={onBack}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 w-12 h-12 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 1200 750"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    display: 'block',
                    width: '48px',
                    height: '48px',
                    transform: 'scale(3)'
                  }}
                >
                  <g fill="#FFFFFF" stroke="none">
                    <path d="M669.6,407.4c0,2.6-2.1,4.8-4.8,4.8H600h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.8-64.8c1.9-1.9,4.9-1.9,6.8,0l64.8,64.8c0.9,0.9,1.4,2.1,1.4,3.4V407.4z" fill="#FFFFFF"/>
                    <path d="M600,342.6l-69.6,69.6l61.4,61.4c3,3,8.2,0.9,8.2-3.4V342.6z" fill="#FFFFFF"/>
                    <path d="M600,412.2h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.5-64.5c1.4-1.4,3.7-0.4,3.7,1.5V412.2z" fill="#FFFFFF"/>
                  </g>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ProprScout</h1>
                <p className="text-xs text-gray-600">Real Estate Intelligence</p>
              </div>
            </button>

            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Private Beta
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Page Header */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 sm:p-12 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-heading">Privacy Policy</h1>
                <p className="text-gray-600">Last updated: {lastUpdated}</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              At ProprScout, a ProprHome product developed by Hothouse Innovation LDA, we are committed to
              protecting your privacy and ensuring the security of your personal data. This Privacy Policy
              explains how we collect, use, store, and protect your information in compliance with the
              General Data Protection Regulation (GDPR) and other applicable data protection laws.
            </p>
          </div>

          {/* Policy Content */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 sm:p-12 space-y-10">

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Data Controller</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ProprScout is a ProprHome product developed by Hothouse Innovation LDA. For the purposes
                of GDPR, Hothouse Innovation LDA is the data controller responsible for your personal data.
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 font-medium">Contact Information:</p>
                <p className="text-gray-600">Company: Hothouse Innovation LDA</p>
                <p className="text-gray-600">Email: privacy@proprscout.com</p>
                <p className="text-gray-600">Data Protection Officer: dpo@proprscout.com</p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect and process the following categories of personal data:
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Account Information:</strong> Name, email address, password (encrypted), and profile details</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely via Stripe)</li>
                <li><strong>Property Data:</strong> Property addresses, photos, and analysis requests you submit</li>
                <li><strong>Communications:</strong> Messages, support requests, and feedback you send us</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Usage Data:</strong> Features used, analysis history, and interaction patterns</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
                <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies and analytics data (see Section 8)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>SSO Providers:</strong> If you sign in via Google or LinkedIn, we receive your name, email, and profile picture</li>
                <li><strong>Property Data Sources:</strong> Public property records and market data from licensed providers</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Legal Basis for Processing (GDPR)</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We process your personal data on the following legal bases:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Contract Performance:</strong> To provide our property intelligence services as agreed</li>
                <li><strong>Legitimate Interests:</strong> To improve our services, prevent fraud, and ensure security</li>
                <li><strong>Consent:</strong> For marketing communications and optional analytics (you may withdraw at any time)</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Providing and improving our property analysis and intelligence services</li>
                <li>Processing your transactions and managing your subscription</li>
                <li>Sending service-related communications (account updates, security alerts)</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Analyzing usage patterns to improve user experience</li>
                <li>Detecting and preventing fraud, abuse, and security threats</li>
                <li>Complying with legal obligations and enforcing our terms</li>
                <li>Sending marketing communications (with your consent)</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell your personal data. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Cloud hosting (MongoDB Atlas), payment processing (Stripe),
                    email services, and analytics providers who process data on our behalf</li>
                <li><strong>Professional Advisors:</strong> Lawyers, accountants, and auditors when necessary</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> For any other purpose you have specifically agreed to</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                All third-party service providers are contractually bound to protect your data and use it only
                for the specified purposes.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA).
                When we transfer data internationally, we ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions for countries with equivalent data protection standards</li>
                <li>Binding Corporate Rules where applicable</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes for which
                it was collected:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active, plus 30 days after deletion</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for tax and legal compliance</li>
                <li><strong>Analysis History:</strong> Retained for 2 years or until you request deletion</li>
                <li><strong>Support Communications:</strong> Retained for 3 years after resolution</li>
                <li><strong>Marketing Preferences:</strong> Retained until you withdraw consent</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function (authentication, security)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our service (with consent)</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can manage cookie preferences through your browser settings. Note that disabling essential
                cookies may affect the functionality of our service.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Rights Under GDPR</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                As a data subject, you have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Right of Access:</strong> Request a copy of your personal data we hold</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise any of these rights, please contact us at privacy@proprscout.com. We will respond
                within 30 days.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure password hashing using industry-standard algorithms</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication for all systems</li>
                <li>Employee training on data protection and security</li>
                <li>Incident response procedures for potential breaches</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                ProprScout is not intended for use by individuals under the age of 18. We do not knowingly
                collect personal data from children. If you believe a child has provided us with personal
                data, please contact us and we will delete it promptly.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or
                legal requirements. We will notify you of material changes by email or through a prominent
                notice on our website. Your continued use of ProprScout after such changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700"><strong>ProprScout</strong></p>
                <p className="text-gray-600">A ProprHome product developed by Hothouse Innovation LDA</p>
                <p className="text-gray-600 mt-2">Email: privacy@proprscout.com</p>
                <p className="text-gray-600">Data Protection Officer: dpo@proprscout.com</p>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Copyright © 2024 ProprScout, a ProprHome product developed by Hothouse Innovation LDA.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
