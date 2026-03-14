import { useState } from 'react';
import { useAddEvent } from '@/hooks/useProducts';
import { EventType, EVENT_TYPE_LABELS, EVENT_TYPE_DESCRIPTIONS, HEALTH_IMPACT } from '@/lib/dna';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Zap, Clock, Thermometer, Route } from 'lucide-react';

interface EventLoggerProps {
  productId: string | null;
}

const eventIcons: Record<EventType, React.ReactNode> = {
  delay: <Clock className="w-4 h-4" />,
  quality_issue: <AlertTriangle className="w-4 h-4" />,
  temperature_violation: <Thermometer className="w-4 h-4" />,
  reroute: <Route className="w-4 h-4" />,
};

export function EventLogger({ productId }: EventLoggerProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventType | ''>('');
  const addEvent = useAddEvent();

  const handleLogEvent = async () => {
    if (!productId || !selectedEvent) return;

    try {
      await addEvent.mutateAsync({
        productId,
        eventType: selectedEvent,
      });
      setSelectedEvent('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isDisabled = !productId || !selectedEvent || addEvent.isPending;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Zap className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-lg">Log Incident</CardTitle>
            <CardDescription>Record supply chain events to mutate DNA</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!productId ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Select a product first to log events</p>
          </div>
        ) : (
          <>
            <Select 
              value={selectedEvent} 
              onValueChange={(value) => setSelectedEvent(value as EventType)}
            >
              <SelectTrigger className="w-full bg-input/50">
                <SelectValue placeholder="Select incident type..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {eventIcons[type]}
                      <span>{EVENT_TYPE_LABELS[type]}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({HEALTH_IMPACT[type]} HP)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEvent && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  {EVENT_TYPE_DESCRIPTIONS[selectedEvent]}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-destructive font-medium">
                    Health Impact: {HEALTH_IMPACT[selectedEvent]}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogEvent}
              disabled={isDisabled}
              variant="destructive"
              className="w-full gap-2"
            >
              {addEvent.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  Processing Mutation...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Log Incident
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
