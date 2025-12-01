/**
 * Acceptable Use Policy Page
 * Guidelines for appropriate use of ProprScout
 */

import React, { useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Sparkles, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptableUsePage({ onBack }) {
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
                <AlertTriangle className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-heading">Acceptable Use Policy</h1>
                <p className="text-gray-600">Last updated: {lastUpdated}</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              This Acceptable Use Policy ("AUP") outlines the rules and guidelines for using ProprScout,
              a ProprHome product developed by Hothouse Innovation LDA. By using our service, you agree
              to comply with this policy. Violations may result in suspension or termination of your account.
            </p>
          </div>

          {/* Policy Content */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 sm:p-12 space-y-10">

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Purpose and Scope</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ProprScout is a property intelligence platform designed for legitimate real estate
                research, investment analysis, and market intelligence purposes. This policy applies
                to all users of ProprScout, including free and paid subscribers.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We are committed to maintaining a safe, ethical, and lawful environment for all users.
                This policy supplements our Terms and Conditions and should be read in conjunction with them.
              </p>
            </section>

            {/* Section 2 - Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ProprScout may be used for the following legitimate purposes:
              </p>
              <div className="space-y-3">
                {[
                  'Property research and due diligence for potential purchases or investments',
                  'Market analysis and trend research for real estate professionals',
                  'Portfolio analysis and management for property investors',
                  'Comparative market analysis for valuation purposes',
                  'Location intelligence for property identification',
                  'Academic or research purposes related to real estate markets',
                  'Business development and lead generation for real estate services'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3 - Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Prohibited Activities</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The following activities are strictly prohibited when using ProprScout:
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Illegal Activities</h3>
              <div className="space-y-3 mb-6">
                {[
                  'Using ProprScout for any purpose that violates applicable laws or regulations',
                  'Conducting surveillance, stalking, or harassment of individuals',
                  'Identity theft, fraud, or any form of financial crime',
                  'Money laundering or terrorist financing activities',
                  'Circumventing property ownership disclosure requirements',
                  'Any activity that violates privacy or data protection laws'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Privacy Violations</h3>
              <div className="space-y-3 mb-6">
                {[
                  'Tracking or monitoring individuals without their consent',
                  'Attempting to identify property owners for harassment purposes',
                  'Using geolocation features to locate or stalk individuals',
                  'Collecting or storing personal information about third parties without authorization',
                  'Sharing analysis results that could identify private individuals'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.3 System Abuse</h3>
              <div className="space-y-3 mb-6">
                {[
                  'Attempting to bypass rate limits, usage quotas, or access controls',
                  'Using automated tools, bots, or scripts without authorization',
                  'Scraping or bulk downloading data from our platform',
                  'Reverse engineering our algorithms or proprietary technology',
                  'Testing vulnerabilities or attempting to breach security measures',
                  'Overloading our systems with excessive requests'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.4 Commercial Misuse</h3>
              <div className="space-y-3">
                {[
                  'Reselling or redistributing ProprScout data or analyses without authorization',
                  'Creating competing products or services using our data',
                  'White-labeling our reports as your own work without permission',
                  'Using ProprScout outputs to train competing AI models',
                  'Sharing account credentials or access with unauthorized users'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4 - Photo Upload Guidelines */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Photo Upload Guidelines</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                When using our photo-based location and analysis features, you must:
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'Only upload photos you have the right to use (your own photos or authorized images)',
                  'Ensure photos do not contain personally identifiable information of individuals',
                  'Not upload photos taken without consent on private property',
                  'Blur or redact faces, license plates, and other identifying information',
                  'Comply with local laws regarding photography and privacy'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> Using our geolocation features to identify locations from
                  photos taken without proper authorization may violate privacy laws in your jurisdiction.
                </p>
              </div>
            </section>

            {/* Section 5 - Content Standards */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content Standards</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Any content you upload or share through ProprScout must not:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Contain illegal, harmful, threatening, abusive, or defamatory material</li>
                <li>Infringe on intellectual property rights of third parties</li>
                <li>Contain malware, viruses, or other harmful code</li>
                <li>Include sensitive personal information of third parties</li>
                <li>Violate the privacy or publicity rights of others</li>
                <li>Contain false or misleading information intended to deceive</li>
              </ul>
            </section>

            {/* Section 6 - API and Integration Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. API and Integration Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you access ProprScout through APIs or integrations, you must:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Comply with all API documentation and rate limits</li>
                <li>Securely store and protect API keys and credentials</li>
                <li>Not share API access with unauthorized parties</li>
                <li>Implement proper error handling to avoid excessive requests</li>
                <li>Clearly attribute ProprScout as the data source where required</li>
                <li>Not use API access for purposes outside the scope of your subscription</li>
              </ul>
            </section>

            {/* Section 7 - Data Usage and Attribution */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Usage and Attribution</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                When using ProprScout data and analyses:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>You may use results for your own internal business purposes</li>
                <li>Attribution to ProprScout is required when sharing analyses publicly</li>
                <li>Data may not be used to create derivative databases or products</li>
                <li>Results should not be presented as professional valuations unless you are qualified</li>
                <li>Historical data caching beyond 24 hours requires enterprise agreement</li>
              </ul>
            </section>

            {/* Section 8 - Reporting Violations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Reporting Violations</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you become aware of any violation of this policy, please report it to us immediately:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700"><strong>Report Abuse:</strong></p>
                <p className="text-gray-600 mt-2">Email: abuse@proprscout.com</p>
                <p className="text-gray-600">Security Issues: security@proprscout.com</p>
              </div>
              <p className="text-gray-600 leading-relaxed mt-4">
                We take all reports seriously and will investigate promptly. You may report anonymously,
                though providing contact information helps us follow up if needed.
              </p>
            </section>

            {/* Section 9 - Enforcement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Enforcement</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Violations of this policy may result in:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Warning:</strong> First-time minor violations may receive a warning</li>
                <li><strong>Temporary Suspension:</strong> Account access may be suspended pending investigation</li>
                <li><strong>Permanent Termination:</strong> Serious or repeated violations result in account termination</li>
                <li><strong>Legal Action:</strong> We may report illegal activities to law enforcement</li>
                <li><strong>Civil Remedies:</strong> We reserve the right to seek damages for policy violations</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We apply enforcement actions at our discretion based on the severity and nature of the
                violation. Users will be notified of enforcement actions where appropriate.
              </p>
            </section>

            {/* Section 10 - Cooperation with Authorities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cooperation with Authorities</h2>
              <p className="text-gray-600 leading-relaxed">
                We cooperate with law enforcement and regulatory authorities when legally required.
                This may include disclosing user information in response to valid legal requests,
                court orders, or to protect our rights and the safety of our users. We will notify
                affected users where legally permitted.
              </p>
            </section>

            {/* Section 11 - Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Acceptable Use Policy from time to time. Material changes will be
                communicated via email or prominent notice on our platform. Continued use of ProprScout
                after changes take effect constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 12 - Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Questions and Contact</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have questions about this policy or need clarification on whether a specific
                use case is permitted, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700"><strong>ProprScout</strong></p>
                <p className="text-gray-600">A ProprHome product developed by Hothouse Innovation LDA</p>
                <p className="text-gray-600 mt-2">Email: compliance@proprscout.com</p>
                <p className="text-gray-600">General Inquiries: support@proprscout.com</p>
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
