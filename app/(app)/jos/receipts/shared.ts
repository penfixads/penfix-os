export const PAGE_SIZE = 30

export const TILE_SELECT = `
  item_id, job_order_id, date_time_received, item_preview, item_preview_thumb,
  subcategories(subcategory_name),
  job_orders(client_id, clients(client_name, company_name))
`

// Both the server page (first load) and the client's "load more"/infinite-scroll fetches
// need the exact same date-range filter applied, or paginating would drift back to
// unfiltered results past whatever the server happened to render first.
export function applyDateRange(query: any, dateFrom?: string, dateTo?: string) {
  let q = query
  if (dateFrom) q = q.gte('date_time_received', `${dateFrom}T00:00:00`)
  if (dateTo) q = q.lte('date_time_received', `${dateTo}T23:59:59`)
  return q
}

export interface ReceiptTile {
  item_id: string
  job_order_id: string
  date_time_received: string
  item_preview: string | null
  item_preview_thumb: string | null
  subcategories: { subcategory_name: string } | null
  job_orders: { client_id: string; clients: { client_name: string; company_name: string | null } | null } | null
}
