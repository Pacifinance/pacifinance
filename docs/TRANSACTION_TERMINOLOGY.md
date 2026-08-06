# Transaction terminology

Pacifinance uses the following domain vocabulary consistently across product,
frontend, API, backend and database code:

- **Transaction** is the aggregate financial movement.
- **Income** is a transaction whose direction brings money in.
- **Outflow** is a transaction whose direction moves money out.
- **Expense** is an outflow representing consumption or a cost. It is not a
  synonym for every outflow: investments, transfers and loan principal are
  outflows but are not expenses.
- **Direction** is represented at application boundaries as `income` or
  `outflow`. The legacy database boolean `is_expense` remains a migration
  detail until existing deployments have moved to the canonical schema.
- **Purpose** describes the economic meaning independently from direction:
  `income`, `expense`, `investment`, `transfer`, `debt`, `tax`, `refund` or
  `other`. Spending analytics include `expense` and `tax`; investments and
  transfers remain visible as outflows but are not treated as consumption.

New general-purpose code must use `transaction`, `income`, `outflow` and
`direction`. The word `expense` is reserved for consumption analytics and
specific concepts such as a shared expense. Legacy `/expenses` API routes may
exist only as documented compatibility aliases for released clients.
