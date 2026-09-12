import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <p className="text-lg font-medium">Quoter</p>
      </main>
    </QueryClientProvider>
  );
}
