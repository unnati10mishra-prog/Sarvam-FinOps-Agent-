import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceProcessingView from './components/InvoiceProcessingView';
import ReconciliationView from './components/ReconciliationView';
import AnomalyDetectionView from './components/AnomalyDetectionView';
import JournalEntriesView from './components/JournalEntriesView';
import MonthEndCloseView from './components/MonthEndCloseView';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import './index.css';
import ApiKeyModal from './components/ApiKeyModal';

import { 
  INITIAL_INVOICES, 
  INITIAL_BANK_FEED, 
  INITIAL_ANOMALIES, 
  INITIAL_JOURNAL_ENTRIES, 
  INITIAL_MONTH_END_TASKS 
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // App Master Data States
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [bankFeed, setBankFeed] = useState(INITIAL_BANK_FEED);
  const [anomalies, setAnomalies] = useState(INITIAL_ANOMALIES);
  const [journalEntries, setJournalEntries] = useState(INITIAL_JOURNAL_ENTRIES);
  const [monthEndTasks, setMonthEndTasks] = useState(INITIAL_MONTH_END_TASKS);

  const handleAddJournalEntry = (newEntry) => {
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  const activeAnomalyCount = anomalies.filter(a => a.status !== 'Resolved').length;

  return (
    <div className="min-h-screen surface-0 flex flex-col text-[#fafafa]">
      {/* Top Header Navbar */}
      <Navbar 
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        anomalyCount={activeAnomalyCount}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          anomalyCount={activeAnomalyCount} 
        />

        {/* Center Content Viewport */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              invoices={invoices}
              anomalies={anomalies}
              bankFeed={bankFeed}
              monthEndTasks={monthEndTasks}
              setActiveTab={setActiveTab}
              selectedLang={selectedLang}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceProcessingView 
              invoices={invoices}
              setInvoices={setInvoices}
              onAddJournalEntry={handleAddJournalEntry}
              selectedLang={selectedLang}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView 
              bankFeed={bankFeed}
              setBankFeed={setBankFeed}
              invoices={invoices}
              setInvoices={setInvoices}
              selectedLang={selectedLang}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomalyDetectionView 
              anomalies={anomalies}
              setAnomalies={setAnomalies}
              selectedLang={selectedLang}
            />
          )}

          {activeTab === 'journal' && (
            <JournalEntriesView 
              journalEntries={journalEntries}
              setJournalEntries={setJournalEntries}
              selectedLang={selectedLang}
            />
          )}

          {activeTab === 'month-end' && (
            <MonthEndCloseView 
              monthEndTasks={monthEndTasks}
              setMonthEndTasks={setMonthEndTasks}
              selectedLang={selectedLang}
            />
          )}
        </main>
      </div>

      {/* Sarvam AI Multilingual Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
      />

      {/* Sarvam API Key Configuration Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}
