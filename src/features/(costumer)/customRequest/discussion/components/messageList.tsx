"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { PiChatsCircle } from "react-icons/pi";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import type { CustomMessage } from "@/types/customRequest.type";

type MessageListProps = {
  messages: CustomMessage[];
  // nama yang tampil untuk pihak lawan, mis. "Pinkara florist" (pembeli) atau nama pembeli (admin)
  otherLabel: (message: CustomMessage) => string;
  emptyText: string;
};

// daftar pesan teks + gambar (PRD §8 no. 2). Pesan sendiri di kanan, pihak lawan di kiri
export function MessageList({ messages, otherLabel, emptyText }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // pesan baru masuk -> gulir ke bawah. useEffect hanya untuk menggulir, bukan fetch data
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  if (!messages.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-ink-muted">
        <PiChatsCircle aria-hidden="true" size={36} />
        {emptyText}
      </div>
    );
  }

  return (
    <ol aria-label="Messages" className="flex flex-col gap-4 p-4 sm:p-5">
      {messages.map((message) => (
        <li key={message.id} className={`flex flex-col gap-1 ${message.mine ? "items-end" : "items-start"}`}>
          {!message.mine && <span className="px-1 text-xs font-medium text-ink-muted">{otherLabel(message)}</span>}
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${
              message.mine ? "rounded-br-md bg-primary text-primary-content" : "rounded-bl-md bg-surface-muted text-ink"
            }`}
          >
            {message.body && <p className="whitespace-pre-line wrap-break-word">{message.body}</p>}
            {message.attachments.length > 0 && (
              <div className={`flex flex-wrap gap-2 ${message.body ? "mt-2" : ""}`}>
                {message.attachments.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open attachment ${index + 1}`}
                    className="relative block size-28 overflow-hidden rounded-lg bg-base-100"
                  >
                    <Image src={url} alt="" fill sizes="112px" className="object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <span className="px-1 text-[11px] text-ink-muted">
            {formatDateTimeWIB(message.createdAt)}
            {message.mine && message.readAt && " · Read"}
          </span>
        </li>
      ))}
      <div ref={endRef} />
    </ol>
  );
}
