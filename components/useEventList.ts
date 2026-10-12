"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiClientError, api, isAbort } from "@/lib/api-client";
import type { EventDto, Paginated } from "@/lib/events";

export type EventListData = Paginated<EventDto> & { categories?: string[] };

export type EventListState =
  | { status: "loading" }
  | { status: "error"; message: string; httpStatus: number }
  | { status: "ready"; data: EventListData };

/** Fetches an events endpoint whenever `url` changes. Stale responses are cancelled. */
export function useEventList(url: string | null) {
  const [state, setState] = useState<EventListState>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setState({ status: "loading" });
    api<EventListData>(url, { signal: controller.signal })
      .then((data) => setState({ status: "ready", data }))
      .catch((err) => {
        if (isAbort(err)) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Something went wrong.",
          httpStatus: err instanceof ApiClientError ? err.status : 0,
        });
      });
    return () => controller.abort();
  }, [url, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { state, reload };
}
