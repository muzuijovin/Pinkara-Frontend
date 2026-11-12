"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PiCaretRight, PiChatsCircle, PiReceipt } from "react-icons/pi";
import { toast } from "react-toastify";
import { FormAlert } from "@/components/form/formAlert";
import { PageLoader } from "@/components/ui/pageLoader";
import { BriefSummary } from "@/features/(costumer)/customRequest/components/briefSummary";
import { RequestStatusBadge } from "@/features/(costumer)/customRequest/constants/requestStatus";
import { MessageInput } from "@/features/(costumer)/customRequest/discussion/components/messageInput";
import { MessageList } from "@/features/(costumer)/customRequest/discussion/components/messageList";
import { QuotationCard } from "@/features/(costumer)/customRequest/discussion/components/quotationCard";
import { formatDateTimeWIB } from "@/lib/datetime.lib";
import { getErrorMessage } from "@/lib/error.lib";
import { QuotationForm } from "./components/quotationForm";
import { useAdminCancelRequest, useAdminCustomRequest, useAdminSendMessage, useWithdrawQuotation } from "./hooks/useAdminCustomRequests";

// detail request custom untuk admin (PRD §8, §12): chat, buat / tarik penawaran, batalkan request
export function AdminCustomRequestDetail() {
  const { id: code } = useParams<{ id: string }>();
  const { data: request, isPending, isError, error, refetch } = useAdminCustomRequest(code);
  const { mutate: send, isPending: isSending } = useAdminSendMessage(code);
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawQuotation(code);
  const { mutate: cancel, isPending: isCancelling } = useAdminCancelRequest(code);
  const [isQuoting, setIsQuoting] = useState(false);

  if (isPending) return <PageLoader />;
  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <PiChatsCircle aria-hidden="true" size={44} className="text-ink-muted" />
        <FormAlert message={getErrorMessage(error, "Couldn't load this request.")} />
        <button type="button" onClick={() => refetch()} className="btn btn-outline h-11">
          Try again
        </button>
        <Link href="/admin/custom-requests" className="btn btn-primary h-11">
          Back to requests
        </Link>
      </div>
    );
  }

  const quotation = request.quotations[0];
  const isOpen = request.status === "DISKUSI" || request.status === "PENAWARAN_DIKIRIM";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/admin/custom-requests" className="rounded hover:text-ink hover:underline">
          Custom requests
        </Link>
        <PiCaretRight aria-hidden="true" size={12} />
        <span aria-current="page" className="font-mono text-ink">
          {request.code}
        </span>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-ink md:text-3xl">{request.customer?.name}</h1>
        <RequestStatusBadge status={request.status} />
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        {request.customer?.email}
        {request.customer?.phone && ` · ${request.customer.phone}`} · Sent {formatDateTimeWIB(request.createdAt)}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_400px]">
        <section aria-label="Chat with customer" className="card border border-base-300 bg-base-100">
          <header className="border-b border-base-300 px-4 py-3 sm:px-5">
            <h2 className="font-semibold text-ink">Chat</h2>
          </header>
          <div className="flex max-h-[60vh] min-h-72 flex-col overflow-y-auto">
            <MessageList messages={request.messages} otherLabel={(message) => message.sender.name} emptyText="No messages yet. Say hello and ask anything you need to know." />
          </div>
          <MessageInput
            isPending={isSending}
            disabledReason={request.status === "DIBATALKAN" ? "This request was cancelled." : undefined}
            onSend={(message, done) => send(message, { onSuccess: done, onError: (err) => toast.error(getErrorMessage(err)) })}
          />
        </section>

        <aside className="flex flex-col gap-6">
          {isQuoting ? (
            <section aria-labelledby="new-quote-title" className="card border border-primary bg-base-100">
              <div className="card-body gap-4 p-5">
                <h2 id="new-quote-title" className="flex items-center gap-2 text-lg font-semibold text-ink">
                  <PiReceipt aria-hidden="true" size={20} className="text-primary" />
                  {quotation?.status === "ACTIVE" ? "Send a new quote" : "Send a quote"}
                </h2>
                {quotation?.status === "ACTIVE" && <p className="text-xs text-ink-muted">The current quote will be replaced.</p>}
                <QuotationForm request={request} onDone={() => setIsQuoting(false)} />
              </div>
            </section>
          ) : (
            <>
              {quotation && (
                <QuotationCard
                  quotation={quotation}
                  serverTime={request.serverTime}
                  orderHref={(orderCode) => `/admin/orders/${orderCode}`}
                  actions={
                    quotation.status === "ACTIVE" && (
                      <button
                        type="button"
                        disabled={isWithdrawing}
                        onClick={() => withdraw(quotation.id, { onSuccess: () => toast.info("Quote withdrawn."), onError: (err) => toast.error(getErrorMessage(err)) })}
                        className="btn btn-ghost h-10 text-ink"
                      >
                        Withdraw quote
                      </button>
                    )
                  }
                />
              )}
              {isOpen && (
                <button type="button" onClick={() => setIsQuoting(true)} className="btn btn-primary h-11 gap-2">
                  <PiReceipt aria-hidden="true" size={18} />
                  {quotation?.status === "ACTIVE" ? "Send a new quote" : "Create quote"}
                </button>
              )}
            </>
          )}

          <BriefSummary request={request} />

          {isOpen && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => {
                const reason = window.prompt("Why are you cancelling this request? The customer will see this message.");
                if (!reason || reason.trim().length < 3) return;
                cancel(reason.trim(), { onSuccess: () => toast.success("Request cancelled."), onError: (err) => toast.error(getErrorMessage(err)) });
              }}
              className="btn btn-ghost h-10 text-danger-text hover:bg-danger-soft"
            >
              Cancel request
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
