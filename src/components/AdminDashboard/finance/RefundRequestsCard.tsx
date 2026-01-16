import AdminCardShell from "../AdminCardShell";

const refundRequests = [
  {
    bookingId: "#BK-10234",
    user: "Emma Johansson",
    amount: "SEK 1,200",
    reason: "Cancelled booking",
  },
];

const RefundRequestsCard = () => {
  const hasItems = refundRequests.length > 0;

  return (
    <AdminCardShell title="Refund Requests" subtitle="Finance queue">
      <div className="flex h-full flex-col">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[auto_auto_auto] items-center gap-3 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Booking</span>
            <span>User</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-slate-200">
            {hasItems ? (
              refundRequests.map((request) => (
                <div
                  key={request.bookingId}
                  className="px-4 py-3 text-sm text-slate-800"
                >
                  <div className="grid grid-cols-[auto_auto_auto] items-center gap-3">
                    <span className="font-semibold text-slate-900">
                      {request.bookingId}
                    </span>
                    <span className="text-slate-700">{request.user}</span>
                    <span className="text-right font-semibold text-slate-900">
                      {request.amount}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{request.reason}</p>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No pending items
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default RefundRequestsCard;
