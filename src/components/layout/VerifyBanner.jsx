import { useState } from 'react';
import { auth, FIREBASE_ENABLED, sendEmailVerification } from '../../firebase';

// Non-blocking reminder shown to real users whose email isn't verified yet.
export default function VerifyBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const user = FIREBASE_ENABLED ? auth?.currentUser : null;

  if (!user || user.emailVerified || dismissed) return null;

  async function resend() {
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch {}
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm px-4 py-2 flex items-center justify-between gap-3">
      <span>
        📧 Pakil-verify ang iyong email para ma-secure ang account.{' '}
        {sent && <b>Naipadala muli ang link!</b>}
      </span>
      <span className="flex items-center gap-3 shrink-0">
        {!sent && (
          <button onClick={resend} className="underline font-semibold">
            Ipadala muli
          </button>
        )}
        <button onClick={() => setDismissed(true)} className="text-amber-600" aria-label="Isara">
          ✕
        </button>
      </span>
    </div>
  );
}
