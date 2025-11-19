"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function EmailReportsPage() {
  const [selectedDate, setSelectedDate] = useState('2024-01-01'); 
  const [generatedReports, setGeneratedReports] = useState<{ [formLevel: string]: any }>({}); 
  const [loading, setLoading] = useState(false); 
  const [showReports, setShowReports] = useState(false); 
  

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  }, []);

  const handleGenerateReports = async () => {
    setLoading(true);
    try {
      console.log(`Generating reports for date: ${selectedDate}`);
      const response = await fetch('/api/email-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', date: selectedDate })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate reports');
      }
      
      const data = await response.json();
      console.log(`Generated reports:`, data.reports);
      setGeneratedReports(data.reports);
      setShowReports(true);
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Error generating reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleRunScheduledReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scheduled' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to run scheduled reports');
      }
      
      const data = await response.json();
      setGeneratedReports(data.reports);
      setShowReports(true);
    } catch (error) {
      console.error('Error running scheduled reports:', error);
      alert('Error running scheduled reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (report: any) => {
    const emailText = `To: ${report.supervisorEmail}\nSubject: Daily Beadle Report - ${report.formLevel} - ${new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}\n\n${report.htmlContent}`;
    navigator.clipboard.writeText(emailText);
    alert('Email content copied to clipboard!');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/Campion_Logo.png"
              alt="Campion College Logo"
              width={150}
              height={150}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{color: '#B91C47'}}>Daily Email Reports</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{color: '#B91C47'}}>
            Generate comprehensive supervisor reports for beadle slip attendance data
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <p className="font-medium">Campion College</p>
            <p>Technology & Media Production Department</p>
          </div>
        </div>

        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" style={{color: '#B91C47'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1" style={{color: '#B91C47'}}>Manual Email Distribution</h3>
              <p className="text-sm text-red-700">
                Reports are generated for manual sending until integration with Campion's email system is complete.
                All emails are sent from: <span className="font-mono bg-red-100 px-2 py-1 rounded">beadleslip@campioncollege.com</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-6m0 0V7m0 6h.01" />
                </svg>
                <label htmlFor="reportDate" className="text-sm font-semibold" style={{color: '#B91C47'}}>
                  Report Date
                </label>
              </div>
              <input
                type="date"
                id="reportDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent shadow-sm"
                style={{'--tw-ring-color': '#B91C47'} as any}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateReports}
                disabled={loading}
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center space-x-2"
                style={{backgroundColor: loading ? '#9CA3AF' : '#B91C47'}}
                onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.backgroundColor = '#A01B3F')}
                onMouseLeave={(e) => !loading && ((e.target as HTMLElement).style.backgroundColor = '#B91C47')}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate Reports</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleRunScheduledReports}
                disabled={loading}
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center space-x-2"
                style={{backgroundColor: loading ? '#9CA3AF' : '#B91C47'}}
                onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.backgroundColor = '#A01B3F')}
                onMouseLeave={(e) => !loading && ((e.target as HTMLElement).style.backgroundColor = '#B91C47')}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Today's Reports</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Automatically scheduled for 4:00 PM daily</span>
            </div>
          </div>
        </div>

        {showReports && (
          <div className="space-y-8">
            <div className="text-center bg-white rounded-2xl shadow-lg p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Reports Generated Successfully
              </h2>
              <p className="text-lg text-gray-600">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="mt-4 inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {Object.keys(generatedReports).length} Form Reports
                </span>
              </div>
            </div>

            {Object.keys(generatedReports).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="text-gray-400 mb-6">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Generated</h3>
                <p className="text-gray-500 max-w-md mx-auto">Reports should generate for all 6 forms. Check browser console for debug information.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {Object.entries(generatedReports).map(([formLevel, report]) => {
                  const hasData = report.hasData;
                  return (
                    <div key={formLevel} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${hasData ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <h3 className="text-xl font-bold text-gray-900">{formLevel}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              hasData 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hasData ? 'Data Available' : 'No Submissions'}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(report)}
                            className="inline-flex items-center space-x-2 px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            style={{backgroundColor: '#B91C47'}}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#A01B3F'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C47'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy Email</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Email Preview</span>
                            <button
                              onClick={() => {
                                const previewWindow = window.open('', '_blank');
                                if (previewWindow) {
                                  previewWindow.document.write(report.htmlContent);
                                  previewWindow.document.close();
                                }
                              }}
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Open in New Tab
                            </button>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            <iframe
                              srcDoc={report.htmlContent}
                              className="w-full min-h-[400px] border-0"
                              title={`Email preview for ${formLevel}`}
                              sandbox="allow-same-origin"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">Email Details</h4>
                          <div className="space-y-1 text-sm text-blue-800">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">To:</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                                {report.supervisorEmail}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Supervisor:</span>
                              <span className="bg-blue-100 px-2 py-1 rounded">
                                {report.supervisorName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">From:</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                                beadleslip@campioncollege.com
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">Subject:</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                                Daily Beadle Report - {formLevel} - {new Date(selectedDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
