import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { invokeFunction } from "@/lib/functions";

type TrackingEvent = {
  id?: string;
  event_time: string;
  location: string;
  message: string;
  status: string;
};

type TrackingResponse = {
  tracking_number: string | null;
  shipment_status: string | null;
  events: TrackingEvent[];
};

const formatEventTime = (t: string) => {
  const n = Number(t);
  const d = Number.isFinite(n) && n > 0 ? new Date(n < 1e12 ? n * 1000 : n) : new Date(t);
  return Number.isNaN(d.getTime()) ? t : d.toLocaleString("en-IN");
};

/** Courier tracking timeline for one of the signed-in buyer's orders. */
export function OrderTracking({ orderId }: { orderId: string }) {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invokeFunction<TrackingResponse>("order-tracking", { order_id: orderId }).then((res) => {
      if (res.error) setError(res.error);
      else setData(res.data);
    });
  }, [orderId]);

  if (error)
    return <p className="text-xs text-foreground/50">Tracking is unavailable right now.</p>;
  if (!data) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-5 h-5 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }
  if (!data.tracking_number) {
    return (
      <p className="text-sm text-foreground/60">
        Your order is being prepared. Tracking details will appear here once it ships.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Truck className="h-4 w-4 text-gold" strokeWidth={1.5} />
        <span className="text-foreground/70">AWB</span>
        <span className="font-mono text-foreground">{data.tracking_number}</span>
        {data.shipment_status && (
          <span className="ml-auto text-[0.6rem] tracking-luxe uppercase text-gold">
            {data.shipment_status}
          </span>
        )}
      </div>
      {data.events.length === 0 ? (
        <p className="text-sm text-foreground/60">Awaiting the first courier scan.</p>
      ) : (
        <ol className="relative border-l border-gold/25 ml-2 space-y-4">
          {data.events.map((ev, i) => (
            <li key={ev.id ?? i} className="pl-5 relative">
              <span
                className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  i === 0 ? "bg-gold" : "bg-border"
                }`}
              />
              <p className={`text-sm ${i === 0 ? "text-foreground" : "text-foreground/70"}`}>
                {ev.message || ev.status}
              </p>
              <p className="text-[0.65rem] text-foreground/45">
                {ev.location} · {formatEventTime(ev.event_time)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
