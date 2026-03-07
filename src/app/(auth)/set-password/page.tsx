import { Suspense } from "react";
import SetPasswordForm from "./SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center space-y-4 py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-bubblegum-300 border-t-bubblegum-600" />
          <p className="text-grape-500 font-medium">Loading...</p>
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
