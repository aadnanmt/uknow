import React, { useState, useCallback } from 'react';
import { FormData } from './types';
import FormField from './components/FormField';
import FormSelect from './components/FormSelect';
import {
  WAKTU_OPTIONS,
  PENCAHAYAAN_OPTIONS,
  GAYA_VIDEO_OPTIONS,
  SUASANA_VIDEO_OPTIONS,
  KAMERA_GERAKAN_OPTIONS
} from './constants';
import { translatePromptToEnglish } from './services/geminiService';
import { SparklesIcon, LoadingSpinner } from './components/IconComponents';

const initialFormData: FormData = {
  subjek: '',
  aksi: '',
  ekspresi: '',
  tempat: '',
  waktu: '',
  gerakanKamera: '',
  pencahayaan: '',
  gayaVideo: '',
  suasanaVideo: '',
  suaraMusik: '',
  kalimatYangDiucapkan: '',
  detailTambahan: '',
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [indonesianPrompt, setIndonesianPrompt] = useState<string>('');
  const [englishPrompt, setEnglishPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleIndonesianPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIndonesianPrompt(e.target.value);
  };

  const generateIndonesianPrompt = (data: FormData): string => {
    let promptParts: string[] = [];

    if (data.subjek) {
      promptParts.push(`Visualisasikan sebuah adegan yang berpusat pada ${data.subjek}.`);
    } else {
      promptParts.push(`Visualisasikan sebuah adegan.`);
    }

    if (data.aksi) {
      promptParts.push(`${data.subjek || 'Subjek'} tersebut sedang ${data.aksi}.`);
    }

    if (data.ekspresi) {
      promptParts.push(`Ekspresi yang terpancar adalah ${data.ekspresi}.`);
    }

    if (data.tempat) {
      const timeClause = data.waktu ? `pada ${data.waktu}` : "";
      promptParts.push(`Latar tempatnya adalah di ${data.tempat}${timeClause ? ` ${timeClause}` : ''}.`);
    } else if (data.waktu) {
      promptParts.push(`Setting waktunya adalah ${data.waktu}.`);
    }
    
    if (data.gerakanKamera) {
      promptParts.push(`Kamera bergerak menggunakan teknik ${data.gerakanKamera}.`);
    }

    if (data.pencahayaan) {
      promptParts.push(`Pencahayaan ${data.pencahayaan} mendominasi visual.`);
    }

    if (data.gayaVideo) {
      const moodClause = data.suasanaVideo ? `dengan suasana yang ${data.suasanaVideo}` : "";
      promptParts.push(`Gaya video yang diinginkan adalah ${data.gayaVideo}${moodClause ? ` ${moodClause}` : ''}.`);
    } else if (data.suasanaVideo) {
      promptParts.push(`Suasana video yang ingin dibangun adalah ${data.suasanaVideo}.`);
    }
    
    if (data.suaraMusik) {
      promptParts.push(`Iringan suara atau musik adalah ${data.suaraMusik}.`);
    }

    if (data.kalimatYangDiucapkan) {
      promptParts.push(`${data.subjek || 'Subjek'} mengucapkan kalimat: "${data.kalimatYangDiucapkan}".`);
    }

    if (data.detailTambahan) {
      promptParts.push(`Beberapa detail tambahan yang penting: ${data.detailTambahan}.`);
    }
    
    if (promptParts.length <= 1 && !data.subjek && !data.aksi && !data.ekspresi && !data.tempat && !data.waktu && !data.gerakanKamera && !data.pencahayaan && !data.gayaVideo && !data.suasanaVideo && !data.suaraMusik && !data.kalimatYangDiucapkan && !data.detailTambahan) {
        return "Mohon isi beberapa detail untuk menghasilkan prompt yang lebih spesifik.";
    }

    return promptParts.join(' ').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEnglishPrompt('');

    const generatedIDPrompt = generateIndonesianPrompt(formData);
    setIndonesianPrompt(generatedIDPrompt);

    if (!process.env.API_KEY) {
        setError("API Key for translation service is not configured. English translation is unavailable.");
        setIsLoading(false);
        setEnglishPrompt("Translation unavailable: API Key missing.");
        return;
    }
    
    if (generatedIDPrompt === "Mohon isi beberapa detail untuk menghasilkan prompt yang lebih spesifik.") {
        setEnglishPrompt("Please provide more details in the form to generate a specific prompt.");
        setIsLoading(false);
        return;
    }

    try {
      const translatedPrompt = await translatePromptToEnglish(generatedIDPrompt, formData.kalimatYangDiucapkan);
      setEnglishPrompt(translatedPrompt);
    } catch (apiError: any) {
      setError(apiError.message || 'Failed to translate prompt.');
      setEnglishPrompt("Error during translation. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Veo 3 Prompt Generator</h1>
        <p className="text-slate-600">by aadnanmt</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <FormField label="Subjek" id="subjek" name="subjek" value={formData.subjek} onChange={handleChange} placeholder="Contoh: Seekor naga, seorang astronot" />
            <FormField label="Aksi" id="aksi" name="aksi" value={formData.aksi} onChange={handleChange} placeholder="Contoh: terbang di atas kota, menanam bendera" />
            <FormField label="Ekspresi" id="ekspresi" name="ekspresi" value={formData.ekspresi} onChange={handleChange} placeholder="Contoh: marah, bahagia, penasaran" />
            <FormField label="Tempat/Setting" id="tempat" name="tempat" value={formData.tempat} onChange={handleChange} placeholder="Contoh: hutan ajaib, planet Mars" />
            <FormSelect label="Waktu" id="waktu" name="waktu" value={formData.waktu} onChange={handleChange} options={WAKTU_OPTIONS} />
            <FormSelect label="Gerakan Kamera" id="gerakanKamera" name="gerakanKamera" value={formData.gerakanKamera} onChange={handleChange} options={KAMERA_GERAKAN_OPTIONS} />
            <FormSelect label="Pencahayaan" id="pencahayaan" name="pencahayaan" value={formData.pencahayaan} onChange={handleChange} options={PENCAHAYAAN_OPTIONS} />
            <FormSelect label="Gaya Video" id="gayaVideo" name="gayaVideo" value={formData.gayaVideo} onChange={handleChange} options={GAYA_VIDEO_OPTIONS} />
            <FormSelect label="Suasana Video" id="suasanaVideo" name="suasanaVideo" value={formData.suasanaVideo} onChange={handleChange} options={SUASANA_VIDEO_OPTIONS} />
            <FormField label="Suara atau Musik" id="suaraMusik" name="suaraMusik" value={formData.suaraMusik} onChange={handleChange} placeholder="Contoh: musik orkestra epik, suara angin" />
          </div>
          <FormField label="Kalimat yang Diucapkan (Dialog)" id="kalimatYangDiucapkan" name="kalimatYangDiucapkan" type="textarea" value={formData.kalimatYangDiucapkan} onChange={handleChange} placeholder="Contoh: 'Ini adalah langkah kecil bagi manusia...'" rows={2}/>
          <FormField label="Detail Tambahan" id="detailTambahan" name="detailTambahan" type="textarea" value={formData.detailTambahan} onChange={handleChange} placeholder="Contoh: fokus pada mata subjek, warna dominan merah" rows={3}/>
          
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Generate Prompt
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md shadow-lg">
            <h3 className="font-bold text-lg mb-1">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {(indonesianPrompt || englishPrompt) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-700 mb-3">Prompt Bahasa Indonesia (Editable)</h2>
              <textarea
                value={indonesianPrompt}
                onChange={handleIndonesianPromptChange}
                rows={10}
                className="w-full p-3 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-sky-500 focus:border-sky-500 shadow-inner"
                placeholder="Hasil prompt Bahasa Indonesia akan muncul di sini..."
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-700 mb-3">Prompt Bahasa Inggris (Final)</h2>
              <textarea
                value={englishPrompt}
                readOnly
                rows={10}
                className="w-full p-3 bg-slate-200 border border-slate-300 rounded-md text-slate-700 focus:ring-sky-500 focus:border-sky-500 shadow-inner cursor-not-allowed"
                placeholder="Hasil prompt Bahasa Inggris akan muncul di sini..."
              />
            </div>
          </div>
        )}
      </main>
      <footer className="text-center mt-12 py-4 border-t border-slate-300">
        <p className="text-sm text-slate-500">Veo 3 Prompt Generator by aadnanmt - Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;