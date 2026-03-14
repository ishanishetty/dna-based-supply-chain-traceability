import { useDNAHistory, useVerifyIntegrity } from '@/hooks/useProducts';
import { DNASequence } from '@/components/DNASequence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, Loader2, Dna, ArrowRight, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface DNATimelineProps {
  productId: string | null;
}

export function DNATimeline({ productId }: DNATimelineProps) {
  const { data: history, isLoading: historyLoading } = useDNAHistory(productId);
  const { data: integrity, isLoading: integrityLoading } = useVerifyIntegrity(productId);

  const isLoading = historyLoading || integrityLoading;

  const getIntegrityStatus = (historyId: string) => {
    if (!integrity) return null;
    return integrity.find(i => i.history_id === historyId);
  };

  if (!productId) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <History className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">DNA Timeline</CardTitle>
              <CardDescription>Mutation history for selected product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Select a product to view its DNA timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading timeline...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">DNA Timeline</CardTitle>
              <CardDescription>Complete mutation history</CardDescription>
            </div>
          </div>
          {history && history.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {history.length} {history.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {!history || history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground px-6">
            <p className="text-sm">No DNA history yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] px-6 pb-6">
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-border/50" />

              {history.map((entry, index) => (
                <div key={entry.dna_id} className="relative pl-10 pb-6 last:pb-0">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center ${index === 0
                    ? 'bg-primary/20 border-primary'
                    : 'bg-secondary border-border'
                    }`}>
                    <Dna className={`w-3.5 h-3.5 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${entry.mutation_reason === 'Product Created'
                        ? 'text-primary'
                        : 'text-foreground'
                        }`}>
                        {entry.mutation_reason}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.mutated_at), 'MMM d, HH:mm')}
                      </span>
                    </div>

                    {/* DNA Sequence Display Logic */}
                    <div className="space-y-2">
                      {(() => {
                        const status = getIntegrityStatus(entry.dna_id);
                        const isTampered = status && !status.valid;

                        if (isTampered) {
                          // Find the last valid DNA state
                          // We search in the original 'history' array (which is ordered ASC)
                          // We want the most recent 'new_dna' where integrity was valid, 
                          // strictly before this tampered record.
                          let lastValidDna = null;
                          for (let i = index - 1; i >= 0; i--) {
                            const prevEntry = history[i];
                            const prevStatus = getIntegrityStatus(prevEntry.dna_id);
                            if (prevStatus && prevStatus.valid) {
                              lastValidDna = prevEntry.new_dna;
                              break;
                            }
                          }

                          return (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-xs text-destructive font-medium bg-destructive/10 p-2 rounded border border-destructive/20">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Corrupted DNA hidden. Showing last verified state:
                              </div>
                              {lastValidDna ? (
                                <DNASequence sequence={lastValidDna} size="sm" />
                              ) : (
                                <div className="text-[10px] text-muted-foreground italic px-2">
                                  No valid state found (Initial record tampered)
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Default rendering for valid records
                        return (
                          <>
                            {entry.previous_dna && (
                              <div className="flex items-center gap-2">
                                <DNASequence sequence={entry.previous_dna} size="sm" />
                                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <DNASequence sequence={entry.new_dna} size="sm" />
                              </div>
                            )}
                            {!entry.previous_dna && (
                              <DNASequence sequence={entry.new_dna} size="sm" />
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Integrity Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>{entry.mutation_hash ? entry.mutation_hash.slice(0, 8) + '...' : 'no-hash'}</span>
                      </div>

                      {getIntegrityStatus(entry.dna_id) && (
                        <Badge
                          variant={getIntegrityStatus(entry.dna_id)?.valid ? "secondary" : "destructive"}
                          className="h-5 px-1.5 text-[10px] gap-1"
                        >
                          {getIntegrityStatus(entry.dna_id)?.valid ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              Verified
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3" />
                              Tampered
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
