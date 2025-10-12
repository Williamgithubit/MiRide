export const downloadBlob = (blob: Blob, filename = "export.csv") => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const csvFromTransactions = (items: any[]) => {
  const headers = [
    "Transaction ID",
    "Customer",
    "Owner",
    "Car",
    "Amount",
    "Payment Method",
    "Status",
    "Date",
  ];
  const rows = items.map((t) => [
    t.transactionId,
    t.customer?.name || "",
    t.owner?.name || "",
    t.car?.title || "",
    t.amount,
    t.paymentMethod,
    t.status,
    t.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
};
