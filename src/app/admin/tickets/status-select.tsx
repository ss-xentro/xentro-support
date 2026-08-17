"use client"

export default function StatusSelect({ ticketStatus }: { ticketStatus: string }) {
  return (
    <select
      name="status"
      defaultValue={ticketStatus}
      onChange={(e) => e.target.form?.requestSubmit()}
      className={`text-xs font-semibold rounded-md px-2 py-1 border border-border bg-background focus:ring-2 focus:ring-primary outline-none cursor-pointer ${
        ticketStatus === 'OPEN' ? 'text-green-600 dark:text-green-400' :
        ticketStatus === 'IN_PROGRESS' ? 'text-blue-600 dark:text-blue-400' :
        'text-gray-600 dark:text-gray-400'
      }`}
    >
      <option value="OPEN">OPEN</option>
      <option value="IN_PROGRESS">IN PROGRESS</option>
      <option value="RESOLVED">RESOLVED</option>
      <option value="CLOSED">CLOSED</option>
    </select>
  )
}
