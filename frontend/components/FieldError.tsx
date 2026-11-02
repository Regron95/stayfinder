// Visar första felet för ett fält från backendens Zod-validering (fields i ApiError).
// Används i alla formulär, t.ex. <FieldError messages={fields.title} />
export default function FieldError({ messages }: { messages?: string[] }) {
  // Inget fel → rendera ingenting
  if (!messages?.length) return null;
  return <span className="text-sm text-red-600">{messages[0]}</span>;
}
