import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/shared/FormModal';
import { Globe, Edit, Save } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface SiteContentItem {
  key: string;
  data: any;
  updated_at: string | null;
}

const CONTENT_KEYS = ['hero', 'promos', 'testimonials', 'recent_wins', 'coming_soon'];

export const SiteContentManagement: React.FC = () => {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editData, setEditData] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPowerhouseSiteContent();
      setItems(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch site content', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: SiteContentItem) => {
    setSelectedKey(item.key);
    setEditData(typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(editData);
      } catch {
        toast({ title: 'Error', description: 'Invalid JSON', variant: 'destructive' });
        setSaving(false);
        return;
      }
      await apiClient.updatePowerhouseSiteContent(selectedKey, parsed);
      toast({ title: 'Success', description: 'Content updated successfully' });
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update content', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="h-6 w-6 text-yellow-500" /> Website Content
        </h1>
      </div>
      <p className="text-gray-400 text-sm">
        Edit hero, promos, testimonials, recent wins, and coming soon content shown on the public website.
      </p>

      <div className="grid gap-4">
        {(items.length > 0 ? items : CONTENT_KEYS.map((k) => ({ key: k, data: {}, updated_at: null }))).map((item) => {
          const updated = items.find((i) => i.key === item.key);
          const dataPreview = updated?.data ?? item.data;
          const preview =
            typeof dataPreview === 'object'
              ? Array.isArray(dataPreview)
                ? `[${dataPreview.length} items]`
                : Object.keys(dataPreview || {}).length
                  ? `{ ${Object.keys(dataPreview || {}).join(', ')} }`
                  : '—'
              : String(dataPreview).slice(0, 40);
          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-800 border border-gray-700"
            >
              <div>
                <p className="font-medium text-white capitalize">{item.key.replace('_', ' ')}</p>
                <p className="text-sm text-gray-400 truncate max-w-md">{preview}</p>
                {updated?.updated_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(updated.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                onClick={() => handleEdit(updated || item)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          );
        })}
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Edit: ${selectedKey?.replace('_', ' ')}`}
        description="Edit content as JSON. Hero is an object; promos, testimonials, recent_wins, coming_soon are arrays."
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Content (JSON)</Label>
            <textarea
              value={editData}
              onChange={(e) => setEditData(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white font-mono text-sm"
              placeholder='{"title": "...", "subtitle": "..."}'
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 gap-2"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default SiteContentManagement;
