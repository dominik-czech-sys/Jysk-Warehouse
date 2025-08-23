import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '@/api'; // Import getApiUrl

const AdminApiConfig: React.FC = () => {
  const { t } = useTranslation();
  const [apiUrl, setApiUrl] = useState(getApiUrl()); // Použijte getApiUrl pro počáteční hodnotu

  useEffect(() => {
    setApiUrl(getApiUrl()); // Aktualizujte URL, pokud se změní v localStorage
  }, []);

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      toast.error(t('common.apiUrlCannotBeEmpty'));
      return;
    }
    localStorage.setItem('API_URL', apiUrl);
    toast.success(t('common.apiUrlSavedSuccess'));
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h3 className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light mb-4">{t('common.backendApiConfiguration')}</h3>
      <div className="mb-4">
        <label htmlFor="apiURL" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('common.apiUrlLabel')}
        </label>
        <input
          type="text"
          id="apiURL"
          className="mt-1 p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="např. http://localhost:3001/api"
        />
      </div>
      <button
        className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground font-bold py-2 px-4 rounded"
        onClick={handleSaveApiUrl}
      >
        {t('common.saveApiUrl')}
      </button>
    </div>
  );
};

export default AdminApiConfig;