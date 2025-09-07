import React, { useState, useEffect } from 'react';
import { ApikeysService, PublicService } from '../../api/services.gen';
import type { APIKey, PatchedAPIKey } from '../../api/types.gen';
import '../../../sass/_global.scss';

// API Testing Component
interface ApiKeyTestProps {
  apiKeys: APIKey[];
}

const ApiKeyTest: React.FC<ApiKeyTestProps> = ({ apiKeys }) => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [testTitle, setTestTitle] = useState<string>('Beginner Full-Body Assessment');

  const testPublicAPI = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // Test without API key
      const encodedTitle = encodeURIComponent(testTitle);
      const response = await fetch(`/api/public/questionnaire/?title=${encodedTitle}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }
      const result = await response.json();
      setTestResult(`✅ Public API Test Successful!\n\nResponse: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Public API Test Failed:\n${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithAPIKey = async () => {
    if (!selectedApiKey) {
      setTestResult('❌ Please select an API key to test with');
      return;
    }

    setLoading(true);
    setTestResult('');
    
    try {
      // Test with selected API key
      const encodedTitle = encodeURIComponent(testTitle);
      const response = await fetch(`/api/public/questionnaire/?title=${encodedTitle}&api_key=${selectedApiKey}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }
      const result = await response.json();
      setTestResult(`✅ API Key Test Successful!\n\nResponse: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ API Key Test Failed:\n${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h5>Test Your API</h5>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#6c757d' }}>
          Use this tool to test your API endpoints. You can test both public access (no API key) and authenticated access (with API key).
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="testTitle">Questionnaire Title:</label>
          <input
            type="text"
            id="testTitle"
            className="form-control"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            placeholder="Enter questionnaire title to test"
          />
        </div>
        
        {apiKeys.length > 0 && (
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="apiKeySelect">Select API Key (optional):</label>
            <select
              id="apiKeySelect"
              className="form-control"
              value={selectedApiKey}
              onChange={(e) => setSelectedApiKey(e.target.value)}
            >
              <option value="">No API Key (Public Access)</option>
              {apiKeys.filter(key => key.is_active).map(key => (
                <option key={key.id} value={key.key}>
                  {key.name} ({key.key.substring(0, 8)}...)
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            onClick={testPublicAPI}
            disabled={loading || !testTitle.trim()}
          >
            {loading ? 'Testing...' : 'Test Public API (No Key)'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={testWithAPIKey}
            disabled={loading || !testTitle.trim()}
          >
            {loading ? 'Testing...' : 'Test API with Key'}
          </button>
        </div>
      </div>
      
      {testResult && (
        <div className="card">
          <div className="card-header">
            <h3>Test Results</h3>
          </div>
          <div className="card-body">
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px'
            }}>
              {testResult}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const ApiKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Load API keys on component mount
  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApikeysService.apikeysRetrieve();
      setApiKeys(Array.isArray(response) ? response : [response]);
    } catch (err) {
      setError('Failed to load API keys');
      console.error('Error loading API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const newKey = await ApikeysService.apikeysCreate({
        requestBody: { 
          name: newKeyName.trim()
        } as any
      });
      setApiKeys([newKey, ...apiKeys]);
      setNewKeyName('');
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create API key');
      console.error('Error creating API key:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await ApikeysService.apikeysDestroy2({ keyId: keyId });
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
    } catch (err) {
      setError('Failed to delete API key');
      console.error('Error deleting API key:', err);
    }
  };

  const handleToggleStatus = async (keyId: number) => {
    try {
      setError(null);
      const result = await ApikeysService.apikeysPartialUpdate2({
        keyId: keyId
      });
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, is_active: result.is_active } : key
      ));
    } catch (err) {
      setError('Failed to update API key status');
      console.error('Error updating API key status:', err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container">
        <h2>API Key Management</h2>
        <p>Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>API Key Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            {showTestPanel ? 'Hide API Testing' : 'Test API'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Key'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {showTestPanel && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3>API Testing</h3>
          </div>
          <div className="card-body">
            <ApiKeyTest apiKeys={apiKeys} />
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3>Create New API Key</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateKey}>
              <div className="form-group">
                <label htmlFor="keyName">Key Name:</label>
                <input
                  type="text"
                  id="keyName"
                  className="form-control"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Enter a descriptive name for this key"
                  required
                />
              </div>
              <div className="form-group">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={creating || !newKeyName.trim()}
                >
                  {creating ? 'Creating...' : 'Create Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>API Keys ({apiKeys.length})</h3>
        </div>
        <div className="card-body">
          {apiKeys.length === 0 ? (
            <p>No API keys found. Create your first key to get started.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td>{key.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <code style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {key.key}
                          </code>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => copyToClipboard(key.key)}
                            title="Copy to clipboard"
                          >
                            {copiedKey === key.key ? '✓' : '📋'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${key.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(key.created_at)}</td>
                      <td>{key.last_used ? formatDate(key.last_used) : 'Never'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className={`btn btn-sm ${key.is_active ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleStatus(key.id)}
                            title={key.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {key.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteKey(key.id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3>API Usage</h3>
        </div>
        <div className="card-body">
          <p>Use these API keys to authenticate requests to the public questionnaire API:</p>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
            <h5>Public API Endpoint:</h5>
            <code>GET /questionnairebuilder/public/questionnaire/?title=QUESTIONNAIRE_TITLE&api_key=YOUR_API_KEY</code>
            
            <h5 style={{ marginTop: '15px' }}>Example:</h5>
            <code>GET /questionnairebuilder/public/questionnaire/?title=Beginner%20Full-Body%20Assessment&api_key=your_generated_key_here</code>
            
            <h5 style={{ marginTop: '15px' }}>Response Format:</h5>
            <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`{
  "title": "Questionnaire Title",
  "questions": [
    {
      "id": 1,
      "text": "Question text",
      "type": "multichoice",
      "answer_choices": [
        {"id": 1, "text": "Answer 1"},
        {"id": 2, "text": "Answer 2"}
      ]
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManagement;
