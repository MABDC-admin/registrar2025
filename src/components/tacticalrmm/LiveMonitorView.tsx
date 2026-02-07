import { useState, useCallback } from 'react';
import { ArrowLeft, RefreshCw, X, ExternalLink, Loader2, Grid2x2, Grid3x3, LayoutGrid, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ConnectedAgent } from './types';

type GridLayout = 'auto' | '2x2' | '3x3';

const gridClass: Record<GridLayout, string> = {
  auto: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
  '2x2': 'grid-cols-1 sm:grid-cols-2',
  '3x3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

interface Props {
  agents: ConnectedAgent[];
  onBack: () => void;
  onRefreshAll: () => void;
  refreshing: boolean;
}

export const LiveMonitorView = ({ agents, onBack, onRefreshAll, refreshing }: Props) => {
  const [layout, setLayout] = useState<GridLayout>('auto');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [iframeErrors, setIframeErrors] = useState<Set<string>>(new Set());

  const visible = agents.filter(a => !dismissed.has(a.agent_id));
  const connectedCount = visible.filter(a => a.controlUrl && !a.connectionError).length;

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  }, []);

  const handleIframeError = useCallback((id: string) => {
    setIframeErrors(prev => new Set(prev).add(id));
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Live Monitor View</h1>
            <p className="text-sm text-muted-foreground">
              {connectedCount} connected · {visible.length} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Layout toggles */}
          <div className="flex border rounded-md">
            {([
              { key: 'auto' as GridLayout, icon: LayoutGrid, label: 'Auto' },
              { key: '2x2' as GridLayout, icon: Grid2x2, label: '2×2' },
              { key: '3x3' as GridLayout, icon: Grid3x3, label: '3×3' },
            ]).map(({ key, icon: Icon }) => (
              <Button
                key={key}
                variant={layout === key ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setLayout(key)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onRefreshAll} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No monitors connected</h3>
            <p className="text-muted-foreground text-sm">All monitors have been dismissed or none are available.</p>
            <Button variant="outline" className="mt-4" onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-3 ${gridClass[layout]}`}>
          {visible.map(agent => {
            const hasError = !!agent.connectionError || iframeErrors.has(agent.agent_id);
            const hasUrl = !!agent.controlUrl && !agent.connectionError;

            return (
              <Card key={agent.agent_id} className="overflow-hidden flex flex-col">
                {/* Tile header */}
                <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${agent.status === 'online' ? 'bg-green-500' : 'bg-destructive'}`} />
                    <span className="text-sm font-medium truncate">{agent.description || agent.hostname}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasError && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Error</Badge>
                    )}
                    {hasUrl && !hasError && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(agent.controlUrl, '_blank')}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismiss(agent.agent_id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Tile body */}
                <div className="relative aspect-video bg-muted/10">
                  {hasUrl && !hasError ? (
                    <iframe
                      src={agent.controlUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      onError={() => handleIframeError(agent.agent_id)}
                      title={`Remote: ${agent.hostname}`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 gap-2">
                      <Monitor className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {agent.connectionError || 'Failed to load remote view'}
                      </p>
                      {agent.controlUrl && (
                        <Button size="sm" variant="outline" onClick={() => window.open(agent.controlUrl, '_blank')}>
                          <ExternalLink className="h-3 w-3 mr-1" /> Open in New Tab
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
