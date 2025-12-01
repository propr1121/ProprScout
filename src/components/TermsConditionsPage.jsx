/**
 * Terms & Conditions Page
 * Comprehensive terms of service for ProprScout
 */

import React, { useEffect } from 'react';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';

export default function TermsConditionsPage({ onBack }) {
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
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-heading">Terms & Conditions</h1>
                <p className="text-gray-600">Last updated: {lastUpdated}</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              These Terms and Conditions ("Terms") govern your access to and use of ProprScout,
              a property intelligence platform. ProprScout is a ProprHome product developed by
              Hothouse Innovation LDA ("we," "us," or "our"). By accessing or using ProprScout,
              you agree to be bound by these Terms.
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 sm:p-12 space-y-10">

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By creating an account, accessing, or using ProprScout, you acknowledge that you have read,
                understood, and agree to be bound by these Terms, our Privacy Policy, and our Acceptable
                Use Policy. If you do not agree to these Terms, you must not use our service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be notified
                via email or prominent notice on our platform. Your continued use after such changes
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use ProprScout, you must:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using the service under applicable laws</li>
                <li>During the beta period, possess a valid invite code</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                If you are using ProprScout on behalf of an organization, you represent that you have
                the authority to bind that organization to these Terms.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To access ProprScout's features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide accurate, current, and complete registration information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or
                contain false or misleading information.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Description</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ProprScout provides property intelligence services including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Property analysis and valuation insights</li>
                <li>Photo-based location identification and geolocation services</li>
                <li>Market intelligence and trend analysis</li>
                <li>AI-powered property assessments</li>
                <li>Investment analysis and risk scoring</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                <strong>Important:</strong> ProprScout provides informational insights only. Our analyses
                and reports should not be considered as professional valuation, legal, financial, or
                investment advice. Always consult qualified professionals before making property decisions.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription and Payments</h2>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.1 Pricing and Billing</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                ProprScout offers various subscription plans. Current pricing is displayed on our website.
                By subscribing, you agree to pay the applicable fees according to the selected plan.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.2 Propr Points (Credits)</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Certain features require Propr Points. Points are consumed when you use specific services
                such as property analyses. Points are non-refundable and expire according to your plan terms.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.3 Payment Processing</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Payments are processed securely through Stripe. By providing payment information, you
                authorize us to charge your payment method for subscription fees and any applicable taxes.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.4 Refunds</h3>
              <p className="text-gray-600 leading-relaxed">
                Subscription fees are generally non-refundable. However, we may provide refunds at our
                discretion in cases of service issues or billing errors. Contact support@proprscout.com
                for refund inquiries.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.1 Our Intellectual Property</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                ProprScout, including its software, algorithms, design, logos, content, and documentation,
                is protected by intellectual property laws. We retain all rights, title, and interest in
                our intellectual property. You are granted a limited, non-exclusive, non-transferable
                license to use ProprScout for its intended purposes.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.2 Your Content</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You retain ownership of content you submit (photos, property data, etc.). By submitting
                content, you grant us a non-exclusive, worldwide, royalty-free license to use, process,
                and store such content to provide our services.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.3 Feedback</h3>
              <p className="text-gray-600 leading-relaxed">
                Any feedback, suggestions, or ideas you provide may be used by us without compensation
                or attribution to you.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Conduct</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Use ProprScout for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Reverse engineer, decompile, or disassemble our software</li>
                <li>Scrape, harvest, or collect data from our platform without authorization</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated tools or bots without our express permission</li>
                <li>Share your account credentials or allow others to access your account</li>
                <li>Resell, redistribute, or commercially exploit our service without authorization</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Violate our Acceptable Use Policy</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data and Privacy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your use of ProprScout is also governed by our Privacy Policy, which describes how we
                collect, use, and protect your personal data. By using our service, you consent to
                such processing and warrant that all data provided is accurate.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You are responsible for ensuring you have the right to submit any property photos or
                data to our service.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-amber-800 font-medium">
                  PROPRSCOUT IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                  EITHER EXPRESS OR IMPLIED.
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We specifically disclaim:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Any warranty that the service will be uninterrupted, error-free, or secure</li>
                <li>Any warranty regarding the accuracy, completeness, or reliability of property analyses</li>
                <li>Any warranty of merchantability or fitness for a particular purpose</li>
                <li>Any warranty regarding third-party content or data sources</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                <strong>ProprScout's analyses are for informational purposes only and do not constitute
                professional valuation, legal, financial, or investment advice.</strong>
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>We shall not be liable for any indirect, incidental, special, consequential, or
                    punitive damages arising from your use of ProprScout</li>
                <li>Our total liability for any claims arising from these Terms shall not exceed the
                    amount you paid to us in the 12 months preceding the claim</li>
                <li>We are not liable for any decisions made based on ProprScout's analyses or reports</li>
                <li>We are not liable for any loss of profits, data, business opportunities, or goodwill</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of
                liability, so some of the above may not apply to you.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify, defend, and hold harmless ProprScout, ProprHome, Hothouse Innovation LDA,
                and their officers, directors, employees, and agents from any claims, damages, losses, liabilities,
                and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-4">
                <li>Your use of ProprScout</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you submit to the service</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>By You:</strong> You may terminate your account at any time through your account
                settings or by contacting support. Termination does not entitle you to a refund of
                prepaid fees.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>By Us:</strong> We may suspend or terminate your account immediately if you
                violate these Terms, engage in fraudulent activity, or for any reason at our discretion
                with notice where practicable.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your right to use ProprScout ceases immediately. Sections relating to
                intellectual property, disclaimers, limitation of liability, and governing law survive
                termination.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Beta Services</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                During the beta period, ProprScout may offer features that are experimental or incomplete.
                Beta features:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>May be modified, suspended, or discontinued at any time without notice</li>
                <li>May contain bugs or errors</li>
                <li>Are provided for testing and feedback purposes</li>
                <li>May have limited support</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                By using beta features, you acknowledge these limitations and agree to provide feedback
                to help improve our service.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law and Disputes</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                These Terms are governed by and construed in accordance with the laws of Ireland,
                without regard to conflict of law principles.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Any disputes arising from these Terms or your use of ProprScout shall be resolved through:
              </p>
              <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
                <li>Good faith negotiation between the parties</li>
                <li>If negotiation fails, mediation administered by an agreed-upon mediator</li>
                <li>If mediation fails, binding arbitration or court proceedings in Ireland</li>
              </ol>
              <p className="text-gray-600 leading-relaxed mt-4">
                You agree to waive any right to participate in a class action lawsuit or class-wide
                arbitration against us.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. General Provisions</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
                <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and
                    Acceptable Use Policy, constitute the entire agreement between you and ProprScout.</li>
                <li><strong>Severability:</strong> If any provision is found invalid or unenforceable,
                    the remaining provisions will continue in full force.</li>
                <li><strong>No Waiver:</strong> Our failure to enforce any right does not waive that right.</li>
                <li><strong>Assignment:</strong> You may not assign these Terms without our consent. We may
                    assign our rights and obligations freely.</li>
                <li><strong>Force Majeure:</strong> We are not liable for delays or failures due to
                    circumstances beyond our reasonable control.</li>
              </ul>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700"><strong>ProprScout</strong></p>
                <p className="text-gray-600">A ProprHome product developed by Hothouse Innovation LDA</p>
                <p className="text-gray-600 mt-2">Email: legal@proprscout.com</p>
                <p className="text-gray-600">Support: support@proprscout.com</p>
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
