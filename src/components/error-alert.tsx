export function ErrorAlert({ message }: { message: string }) {
  return (
    <div class="grid size-full grow place-items-center p-3">
      <div class="max-w-xl bg-red-200 p-4 text-red-700">{message}</div>
    </div>
  );
}
