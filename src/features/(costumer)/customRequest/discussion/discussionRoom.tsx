"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PiArrowLeft, PiChatsCircle } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { PageLoader } from "@/components/ui/pageLoader";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import { BriefSummary } from "../components/briefSummary";
import { RequestStatusBadge } from "../constants/requestStatus";
import { useCancelCustomRequest, useCustomRequest, useRejectQuotation, useSendMessage } from "../hooks/useCustomRequests";
import { AcceptQuotationDialog } from "./components/acceptQuotationDialog";
import { MessageInput } from "./components/messageInput";
import { MessageList } from "./components/messageList";
import { QuotationCard } from "./components/quotationCard";

// ruang diskusi custom (PRD §8): chat dengan florist, penawaran (Accept & pay / Decline), brief, batal
export function DiscussionRoom() {
  const { id: code } = useParams<{ id: string }>();
  const { data: request, isPending, isError, error, refetch } = useCustomRequest(code);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(code);
  const { mutate: reject, isPending: isRejecting } = useRejectQuotation(code);
  const { mutate: cancel, isPending: isCancelling } = useCancelCustomRequest(code);
  const [isAccepting, setIsAccepting] = useState(false);

  if (isPending) return <PageLoader />;

  if (isError) {
    const isNotFound = isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 422);
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <PiChatsCircle aria-hidden="true" size={44} className="text-ink-muted" />
        {isNotFound ? (
          <h1 className="text-xl font-semibold text-ink">Request not found</h1>
        ) : (
          <>
            <FormAlert message={getErrorMessage(error, "Couldn't load this request.")} />
            <button type="button" onClick={() => refetch()} className="btn btn-outline h-11">
              Try again
            </button>
          </>
        )}
        <Link href="/custom-requests" className="btn btn-primary h-11">
          My custom requests
        </Link>
      </div>
    );
  }

  const quotation = request.quotations[0];
  const isOpen = request.status === "DISKUSI" || request.status === "PENAWARAN_DIKIRIM";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <Link href="/custom-requests" className="inline-flex items-center gap-1.5 rounded text-sm text-ink-muted hover:text-ink">
        <PiArrowLeft aria-hidden="true" size={16} />
        My custom requests
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">Custom request</h1>
        <RequestStatusBadge status={request.status} />
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        <span className="font-mono">{request.code}</span> · Sent {formatDateTimeWIB(request.createdAt)}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* chat: di HP tampil setelah penawaran */}
        <section aria-label="Chat with our florist" className="card order-2 border border-base-300 bg-base-100 lg:order-1">
          <header className="border-b border-base-300 px-4 py-3 sm:px-5">
            <h2 className="font-semibold text-ink">Chat with our florist</h2>
            <p className="text-xs text-ink-muted">We usually reply within a few hours during studio hours.</p>
          </header>
          <div className="flex max-h-[60vh] min-h-72 flex-col overflow-y-auto">
            <MessageList
              messages={request.messages}
              otherLabel={() => "Pinkara florist"}
              emptyText="Our florist will reply here soon. Feel free to add more details."
            />
          </div>
          <MessageInput
            isPending={isSending}
            disabledReason={request.status === "DIBATALKAN" ? "This request was cancelled." : undefined}
            onSend={(message, done) =>
              sendMessage(message, {
                onSuccess: done,
                onError: (err) => toast.error(getErrorMessage(err, "Couldn't send your message.")),
              })
            }
          />
        </section>

        <aside className="order-1 flex flex-col gap-6 lg:order-2">
          {quotation ? (
            <QuotationCard
              quotation={quotation}
              serverTime={request.serverTime}
              orderHref={(orderCode) => `/orders/${orderCode}`}
              actions={
                quotation.status === "ACTIVE" && (
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => setIsAccepting(true)} className="btn btn-primary h-11">
                      Accept & pay
                    </button>
                    <button
                      type="button"
                      disabled={isRejecting}
                      onClick={() =>
                        reject(quotation.id, {
                          onSuccess: () => toast.info("Quote declined. Tell our florist what you'd like to change."),
                          onError: (err) => toast.error(getErrorMessage(err)),
                        })
                      }
                      className="btn btn-ghost h-10 text-ink"
                    >
                      Decline
                    </button>
                  </div>
                )
              }
            />
          ) : (
            isOpen && (
              <p className="rounded-box border border-dashed border-base-300 bg-base-100 p-4 text-sm text-ink-muted">
                Our florist will send you a quote with the price and ready date after discussing your idea.
              </p>
            )
          )}

          <BriefSummary request={request} />

          {isOpen && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => {
                if (!window.confirm("Cancel this custom request? You can always send a new one later.")) return;
                cancel(undefined, {
                  onSuccess: () => toast.success("Request cancelled."),
                  onError: (err) => toast.error(getErrorMessage(err)),
                });
              }}
              className="btn btn-ghost h-10 text-danger-text hover:bg-danger-soft"
            >
              Cancel request
            </button>
          )}
        </aside>
      </div>

      {isAccepting && quotation && (
        <AcceptQuotationDialog request={request} quotation={quotation} onClose={() => setIsAccepting(false)} />
      )}
    </div>
  );
}
