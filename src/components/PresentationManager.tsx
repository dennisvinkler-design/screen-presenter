import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PresentationRow { id: string; updated_at: string }

interface Props {
  onLoad: (id: string) => Promise<void>;
  onSaveAs: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PresentationManager({ onLoad, onSaveAs, onDelete }: Props) {
  const [presentations, setPresentations] = useState<PresentationRow[]>([]);
  const [newId, setNewId] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch('/api/presentations');
    if (res.ok) {
      const { data } = await res.json();
      setPresentations(data || []);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-4">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-3 flex gap-3 items-center">
          <Input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="Save as id (e.g. kickoff-2025)" className="bg-neutral-800 border-neutral-700" />
          <Button onClick={async () => { if (!newId) return; setBusyId('save'); await onSaveAs(newId); setBusyId(null); setNewId(''); await refresh(); }} disabled={!newId || busyId==='save'}>
            Save as
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2 max-h-80 overflow-auto pr-1">
        {presentations.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-2 rounded-md bg-neutral-900 border border-neutral-800">
            <div className="text-sm">
              <div className="font-medium text-neutral-200">{p.id}</div>
              <div className="text-neutral-500 text-xs">{new Date(p.updated_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={async () => { setBusyId(p.id+':load'); await onLoad(p.id); setBusyId(null); }} disabled={busyId===p.id+':load'}>
                Load
              </Button>
              <Button variant="destructive" onClick={async () => { setBusyId(p.id+':del'); await onDelete(p.id); setBusyId(null); await refresh(); }} disabled={busyId===p.id+':del'}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {presentations.length === 0 && (
          <div className="text-sm text-neutral-500">No saved presentations yet</div>
        )}
      </div>
    </div>
  );
}


