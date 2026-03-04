import { useCallback, useEffect, useRef, useState } from "react";

type WebSocketConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting";

type SocketEvent = unknown;
type SocketMessageData = unknown;

interface UseReconnectingWebSocketOptions {
  url: string;
  enabled?: boolean;
  reconnectBaseDelayMs?: number;
  reconnectMaxDelayMs?: number;
  reconnectBackoffFactor?: number;
  onOpen?: () => void;
  onClose?: (event: SocketEvent) => void;
  onError?: (event: SocketEvent) => void;
  onMessage?: (data: SocketMessageData) => void;
}

interface UseReconnectingWebSocketResult {
  connectionState: WebSocketConnectionState;
  isConnected: boolean;
  sendJson: (payload: unknown) => boolean;
}

export function useReconnectingWebSocket({
  url,
  enabled = true,
  reconnectBaseDelayMs = 3000,
  reconnectMaxDelayMs = 30000,
  reconnectBackoffFactor = 2,
  onOpen,
  onClose,
  onError,
  onMessage,
}: UseReconnectingWebSocketOptions): UseReconnectingWebSocketResult {
  const socketRef = useRef<WebSocket | null>(null);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  const onMessageRef = useRef(onMessage);
  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>("idle");

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      const socket = socketRef.current;
      socketRef.current = null;

      if (socket) {
        socket.onopen = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;

        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      }

      setConnectionState("idle");
      return;
    }

    let disposed = false;
    let reconnectAttempt = 0;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearReconnectTimer = () => {
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const connect = () => {
      if (disposed) return;

      setConnectionState(
        reconnectAttempt === 0 ? "connecting" : "reconnecting",
      );

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        if (disposed) return;

        reconnectAttempt = 0;
        setConnectionState("connected");
        onOpenRef.current?.();
      };

      socket.onmessage = (event) => {
        const data = (event as { data?: unknown }).data;
        onMessageRef.current?.(data);
      };

      socket.onerror = (event) => {
        onErrorRef.current?.(event);
      };

      socket.onclose = (event) => {
        onCloseRef.current?.(event);

        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (disposed) {
          return;
        }

        setConnectionState("reconnecting");

        const delay = Math.min(
          reconnectMaxDelayMs,
          reconnectBaseDelayMs *
            reconnectBackoffFactor ** Math.max(0, reconnectAttempt),
        );
        reconnectAttempt += 1;

        clearReconnectTimer();
        reconnectTimeout = setTimeout(() => {
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      disposed = true;
      clearReconnectTimer();

      const socket = socketRef.current;
      socketRef.current = null;

      if (!socket) return;

      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, [
    enabled,
    reconnectBackoffFactor,
    reconnectBaseDelayMs,
    reconnectMaxDelayMs,
    url,
  ]);

  const sendJson = useCallback((payload: unknown): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  return {
    connectionState,
    isConnected: connectionState === "connected",
    sendJson,
  };
}
