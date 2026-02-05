import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Power } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

// Game Providers Component (backend: api_endpoint, status)
interface GameProvider {
  id: string;
  name: string;
  code: string;
  api_endpoint: string;
  status: string;
  games_count: number;
  created_at: string;
}

export const GameProviders: React.FC = () => {
  const [data, setData] = useState<GameProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    api_endpoint: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPowerhouseProviders();
      setData(response.results || response || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch providers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      await apiClient.createPowerhouseProvider({
        name: formData.name,
        code: formData.code,
        api_endpoint: formData.api_endpoint,
        status: 'ACTIVE',
      });
      toast({ title: 'Success', description: 'Provider created successfully' });
      setModalOpen(false);
      setFormData({ name: '', code: '', api_endpoint: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create provider', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (provider: GameProvider) => {
    try {
      await apiClient.togglePowerhouseProvider(provider.id);
      const isActive = provider.status === 'ACTIVE';
      toast({ title: 'Success', description: `Provider ${isActive ? 'disabled' : 'enabled'} successfully` });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to toggle provider', variant: 'destructive' });
    }
  };

  const columns: Column<GameProvider>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code' },
    { key: 'api_endpoint', header: 'API URL', render: (item) => <span className="text-gray-400 text-sm truncate max-w-[200px] block">{item.api_endpoint || '—'}</span> },
    { key: 'games_count', header: 'Games', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const isActive = item.status === 'ACTIVE';
        return (
          <Button
            size="sm"
            variant="outline"
            className={isActive ? 'border-red-600 text-red-400 hover:bg-red-600/20' : 'border-green-600 text-green-400 hover:bg-green-600/20'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(item);
            }}
          >
            <Power className="h-4 w-4 mr-1" /> {isActive ? 'Disable' : 'Enable'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Game Providers</h1>
        <Button onClick={() => setModalOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
          <Plus className="h-4 w-4 mr-2" /> Add Provider
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['name', 'code']}
        searchPlaceholder="Search by name or code..."
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add Game Provider"
        description="Add a new game provider to the system"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Provider Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., Evolution Gaming"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Code</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., EVO"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">API Endpoint (URL)</Label>
            <Input
              value={formData.api_endpoint}
              onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="https://api.provider.com"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading} className="bg-yellow-600 hover:bg-yellow-700">
              {actionLoading ? 'Creating...' : 'Add Provider'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

// Games Component
interface Game {
  id: string;
  name: string;
  provider: number;
  provider_name: string;
  game_type: string;
  min_bet: string;
  max_bet: string;
  rtp: string;
  status: string;
  created_at: string;
}

export const Games: React.FC = () => {
  const [data, setData] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider_id: '',
    category: 'CASINO',
    min_bet: '',
    max_bet: '',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gamesRes, providersRes] = await Promise.all([
        apiClient.getPowerhouseGames(),
        apiClient.getPowerhouseProviders(),
      ]);
      setData(gamesRes.results || gamesRes || []);
      setProviders(providersRes.results || providersRes || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      // Map frontend field names to backend expected names
      const payload = {
        name: formData.name,
        provider: formData.provider_id,
        game_type: formData.category,
        min_bet: formData.min_bet,
        max_bet: formData.max_bet,
      };
      await apiClient.createPowerhouseGame(payload);
      toast({ title: 'Success', description: 'Game created successfully' });
      setModalOpen(false);
      setFormData({ name: '', provider_id: '', category: 'CASINO', min_bet: '', max_bet: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create game', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (game: Game) => {
    try {
      await apiClient.toggleGameStatus(game.id);
      toast({ title: 'Success', description: `Game ${game.status === 'ACTIVE' ? 'disabled' : 'enabled'} successfully` });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to toggle game', variant: 'destructive' });
    }
  };

  const columns: Column<Game>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'provider_name', header: 'Provider', render: (item) => <span className="text-blue-400">{item.provider_name}</span> },
    { key: 'game_type', header: 'Category', render: (item) => <StatusBadge status={item.game_type} /> },
    { key: 'min_bet', header: 'Min Bet', render: (item) => `₹${item.min_bet}` },
    { key: 'max_bet', header: 'Max Bet', render: (item) => `₹${item.max_bet}` },
    { 
      key: 'status', 
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button
          size="sm"
          variant="outline"
          className={item.status === 'ACTIVE' ? 'border-red-600 text-red-400 hover:bg-red-600/20' : 'border-green-600 text-green-400 hover:bg-green-600/20'}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(item);
          }}
        >
          <Power className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Game Management</h1>
        <Button onClick={() => setModalOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
          <Plus className="h-4 w-4 mr-2" /> Add Game
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchKeys={['name', 'provider_name', 'game_type']}
        searchPlaceholder="Search by name, provider or type..."
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add Game"
        description="Add a new game to the system"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Provider</Label>
            <Select value={formData.provider_id} onValueChange={(v) => setFormData({ ...formData, provider_id: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-white hover:bg-gray-600">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Game Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., Lightning Roulette"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="SPORTS" className="text-white hover:bg-gray-600">Sports</SelectItem>
                <SelectItem value="CASINO" className="text-white hover:bg-gray-600">Casino</SelectItem>
                <SelectItem value="SLOT" className="text-white hover:bg-gray-600">Slot</SelectItem>
                <SelectItem value="LIVE" className="text-white hover:bg-gray-600">Live</SelectItem>
                <SelectItem value="VIRTUAL" className="text-white hover:bg-gray-600">Virtual</SelectItem>
                <SelectItem value="CRASH" className="text-white hover:bg-gray-600">Crash</SelectItem>
                <SelectItem value="OTHER" className="text-white hover:bg-gray-600">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Min Bet</Label>
              <Input
                type="number"
                value={formData.min_bet}
                onChange={(e) => setFormData({ ...formData, min_bet: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Max Bet</Label>
              <Input
                type="number"
                value={formData.max_bet}
                onChange={(e) => setFormData({ ...formData, max_bet: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="100000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading} className="bg-yellow-600 hover:bg-yellow-700">
              {actionLoading ? 'Creating...' : 'Add Game'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default GameProviders;
