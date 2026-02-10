import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ConfirmCaregiver() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing confirmation token");
      return;
    }

    const confirm = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("confirm-caregiver", {
          body: { token },
        });

        if (error || data?.error) {
          throw new Error(data?.error || error?.message || "Confirmation failed");
        }

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Something went wrong");
      }
    };

    confirm();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-tarva max-w-sm w-full text-center py-12 px-6"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-lg font-semibold text-foreground">Confirming access...</h2>
            <p className="text-muted-foreground text-sm mt-2">Please wait while we verify your request.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Caregiver Approved!</h2>
            <p className="text-muted-foreground text-sm mt-2">
              The caregiver now has access to your medication data based on your permission settings.
            </p>
            <motion.button
              className="btn-primary mt-6"
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
            >
              Go to App
            </motion.button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Confirmation Failed</h2>
            <p className="text-muted-foreground text-sm mt-2">{errorMessage}</p>
            <motion.button
              className="btn-secondary mt-6"
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
            >
              Go to App
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
}
